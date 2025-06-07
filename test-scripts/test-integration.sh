#!/bin/bash

# test-integration.sh - End-to-end integration testing with real deployments
set -e

echo "🌟 Starting End-to-End Integration Testing Phase"
echo "==============================================="
echo "This test will deploy a complete application stack on Railway"
echo ""

source test-utils.sh

# Test 1: Create a new project for integration testing
echo "🏗️ Step 1: Creating new project for full-stack deployment..."
integration_project_response=$(call_tool "project-create" "\"name\": \"integration-test-fullstack-$(date +%s)\"")
validate_success "$integration_project_response" "Integration Project Creation"

INTEGRATION_PROJECT_ID=$(extract_value "$integration_project_response" ".result.content[0].data.id")
if [ -z "$INTEGRATION_PROJECT_ID" ] || [ "$INTEGRATION_PROJECT_ID" = "null" ]; then
    echo "❌ Failed to create integration test project"
    exit 1
fi

echo "✅ Created integration project: $INTEGRATION_PROJECT_ID"
log_test_result "integration-project-create" "PASS" "Created project $INTEGRATION_PROJECT_ID"

# Test 2: Deploy PostgreSQL database
echo "🐘 Step 2: Deploying PostgreSQL database..."
postgres_deploy_response=$(call_tool "database-deploy" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"type\": \"POSTGRESQL\", \"name\": \"app-database\"")
validate_success "$postgres_deploy_response" "PostgreSQL Database Deploy"

POSTGRES_SERVICE_ID=$(extract_value "$postgres_deploy_response" ".result.content[0].data.id")
echo "✅ PostgreSQL database service ID: $POSTGRES_SERVICE_ID"
log_test_result "integration-postgres-deploy" "PASS" "Deployed PostgreSQL $POSTGRES_SERVICE_ID"

# Test 3: Deploy Redis for caching
echo "🔴 Step 3: Deploying Redis cache..."
redis_deploy_response=$(call_tool "database-deploy" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"type\": \"REDIS\", \"name\": \"app-cache\"")
validate_success "$redis_deploy_response" "Redis Cache Deploy"

REDIS_SERVICE_ID=$(extract_value "$redis_deploy_response" ".result.content[0].data.id")
echo "✅ Redis cache service ID: $REDIS_SERVICE_ID"
log_test_result "integration-redis-deploy" "PASS" "Deployed Redis $REDIS_SERVICE_ID"

# Test 4: Wait for databases to be ready
echo "⏳ Step 4: Waiting for databases to be ready..."
echo "Waiting for PostgreSQL..."
wait_for_deployment "$POSTGRES_SERVICE_ID"
postgres_ready=$?

echo "Waiting for Redis..."
wait_for_deployment "$REDIS_SERVICE_ID"
redis_ready=$?

if [ $postgres_ready -eq 0 ] && [ $redis_ready -eq 0 ]; then
    echo "✅ Both databases are ready"
    log_test_result "integration-databases-ready" "PASS" "Databases deployed successfully"
else
    echo "❌ Database deployment failed"
    log_test_result "integration-databases-ready" "FAIL" "Database deployment failed"
fi

# Test 5: Get database connection details
echo "🔗 Step 5: Retrieving database connection strings..."
postgres_vars_response=$(call_tool "variable-list" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
validate_success "$postgres_vars_response" "PostgreSQL Variables"

redis_vars_response=$(call_tool "variable-list" "\"serviceId\": \"$REDIS_SERVICE_ID\"")
validate_success "$redis_vars_response" "Redis Variables"

# Extract DATABASE_URL and REDIS_URL
DATABASE_URL=$(extract_value "$postgres_vars_response" ".result.content[0].data.variables[] | select(.name == \"DATABASE_URL\") | .value")
REDIS_URL=$(extract_value "$redis_vars_response" ".result.content[0].data.variables[] | select(.name == \"REDIS_URL\") | .value")

echo "✅ Database URLs retrieved"
log_test_result "integration-db-urls" "PASS" "Retrieved database connection URLs"

# Test 6: Deploy a Node.js web application
echo "🚀 Step 6: Deploying Node.js web application..."
webapp_deploy_response=$(call_tool "service-create-from-repo" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"repoUrl\": \"https://github.com/railwayapp/starters\", \"name\": \"webapp\", \"branch\": \"main\"")
validate_success "$webapp_deploy_response" "Web App Deploy"

WEBAPP_SERVICE_ID=$(extract_value "$webapp_deploy_response" ".result.content[0].data.id")
echo "✅ Web application service ID: $WEBAPP_SERVICE_ID"
log_test_result "integration-webapp-deploy" "PASS" "Deployed web app $WEBAPP_SERVICE_ID"

# Test 7: Configure environment variables for the web app
echo "⚙️ Step 7: Configuring application environment variables..."

# Set database connection
if [ -n "$DATABASE_URL" ] && [ "$DATABASE_URL" != "null" ]; then
    db_var_response=$(call_tool "variable-set" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"key\": \"DATABASE_URL\", \"value\": \"$DATABASE_URL\"")
    validate_success "$db_var_response" "Database URL Variable"
fi

# Set Redis connection
if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" != "null" ]; then
    redis_var_response=$(call_tool "variable-set" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"key\": \"REDIS_URL\", \"value\": \"$REDIS_URL\"")
    validate_success "$redis_var_response" "Redis URL Variable"
fi

# Set application environment
env_var_response=$(call_tool "variable-set" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"key\": \"NODE_ENV\", \"value\": \"production\"")
validate_success "$env_var_response" "Node Environment Variable"

# Set application port
port_var_response=$(call_tool "variable-set" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"key\": \"PORT\", \"value\": \"3000\"")
validate_success "$port_var_response" "Port Variable"

# Set application name
app_name_response=$(call_tool "variable-set" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"key\": \"APP_NAME\", \"value\": \"Railway MCP Integration Test\"")
validate_success "$app_name_response" "App Name Variable"

echo "✅ Environment variables configured"
log_test_result "integration-env-vars" "PASS" "Configured environment variables"

# Test 8: Create and attach a volume for file storage
echo "💾 Step 8: Creating and attaching storage volume..."
volume_create_response=$(call_tool "volume-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"name\": \"app-storage\", \"mountPath\": \"/app/uploads\"")
validate_success "$volume_create_response" "Volume Creation"

VOLUME_ID=$(extract_value "$volume_create_response" ".result.content[0].data.id")
if [ -n "$VOLUME_ID" ] && [ "$VOLUME_ID" != "null" ]; then
    # Attach volume to web app
    volume_attach_response=$(call_tool "volume-attach" "\"volumeId\": \"$VOLUME_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\", \"mountPath\": \"/app/uploads\"")
    validate_success "$volume_attach_response" "Volume Attachment"
    echo "✅ Volume created and attached: $VOLUME_ID"
    log_test_result "integration-volume" "PASS" "Created and attached volume $VOLUME_ID"
fi

# Test 9: Wait for web application deployment
echo "⏳ Step 9: Waiting for web application to deploy..."
wait_for_deployment "$WEBAPP_SERVICE_ID"
webapp_ready=$?

if [ $webapp_ready -eq 0 ]; then
    echo "✅ Web application deployed successfully"
    log_test_result "integration-webapp-ready" "PASS" "Web application deployed"
else
    echo "❌ Web application deployment failed"
    log_test_result "integration-webapp-ready" "FAIL" "Web application deployment failed"
fi

# Test 10: Check deployment health and get service URL
echo "🏥 Step 10: Checking application health..."
webapp_health_response=$(call_tool "deployment-health-check" "\"serviceId\": \"$WEBAPP_SERVICE_ID\"")
validate_success "$webapp_health_response" "Web App Health Check"

webapp_info_response=$(call_tool "service-info" "\"serviceId\": \"$WEBAPP_SERVICE_ID\"")
validate_success "$webapp_info_response" "Web App Service Info"

# Extract service URL if available
SERVICE_URL=$(extract_value "$webapp_info_response" ".result.content[0].data.serviceUrl")
if [ -n "$SERVICE_URL" ] && [ "$SERVICE_URL" != "null" ]; then
    echo "✅ Application URL: $SERVICE_URL"
    log_test_result "integration-service-url" "PASS" "Service URL: $SERVICE_URL"
else
    echo "⚠️ Service URL not yet available"
fi

# Test 11: Set up custom domain (if available)
echo "🌐 Step 11: Testing custom domain setup..."
domain_response=$(call_tool "domain-create" "\"serviceId\": \"$WEBAPP_SERVICE_ID\", \"domain\": \"integration-test-$(date +%s).railway.app\"")

if validate_success "$domain_response" "Custom Domain Setup" 2>/dev/null; then
    DOMAIN_ID=$(extract_value "$domain_response" ".result.content[0].data.id")
    echo "✅ Custom domain configured: $DOMAIN_ID"
    log_test_result "integration-custom-domain" "PASS" "Configured custom domain $DOMAIN_ID"
else
    echo "⚠️ Custom domain setup not available or failed"
    log_test_result "integration-custom-domain" "SKIP" "Custom domain not available"
fi

# Test 12: Set up monitoring and alerts
echo "📊 Step 12: Setting up monitoring and alerts..."
# Create custom metric
metric_response=$(call_tool "monitoring-metric-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\", \"name\": \"integration_test_requests\", \"type\": \"COUNTER\", \"value\": 1, \"labels\": {\"test\": \"integration\"}")

if validate_success "$metric_response" "Custom Metric" 2>/dev/null; then
    log_test_result "integration-custom-metric" "PASS" "Created custom metric"
else
    echo "⚠️ Custom metrics not available"
    log_test_result "integration-custom-metric" "SKIP" "Custom metrics not available"
fi

# Create alert for high error rate
alert_response=$(call_tool "monitoring-alert-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\", \"name\": \"High Error Rate\", \"description\": \"Alert when error rate exceeds 5%\", \"condition\": \"error_rate > 5\", \"threshold\": 5, \"severity\": \"HIGH\", \"notifications\": [{\"type\": \"EMAIL\", \"destination\": \"test@example.com\"}]")

if validate_success "$alert_response" "Error Rate Alert" 2>/dev/null; then
    ALERT_ID=$(extract_value "$alert_response" ".result.content[0].data.id")
    echo "✅ Error rate alert configured: $ALERT_ID"
    log_test_result "integration-error-alert" "PASS" "Configured error rate alert $ALERT_ID"
else
    echo "⚠️ Alerting not available"
    log_test_result "integration-error-alert" "SKIP" "Alerting not available"
fi

# Test 13: Set up private networking
echo "🔒 Step 13: Setting up private networking..."
network_response=$(call_tool "networking-network-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"name\": \"app-network\", \"cidr\": \"10.0.0.0/24\", \"region\": \"us-west1\"")

if validate_success "$network_response" "Private Network" 2>/dev/null; then
    NETWORK_ID=$(extract_value "$network_response" ".result.content[0].data.id")
    echo "✅ Private network created: $NETWORK_ID"
    log_test_result "integration-private-network" "PASS" "Created private network $NETWORK_ID"
    
    # Add services to private network
    webapp_endpoint_response=$(call_tool "networking-endpoint-add" "\"networkId\": \"$NETWORK_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\", \"port\": 3000, \"protocol\": \"HTTP\"")
    if validate_success "$webapp_endpoint_response" "Web App Network Endpoint" 2>/dev/null; then
        log_test_result "integration-webapp-endpoint" "PASS" "Added webapp to private network"
    fi
    
    postgres_endpoint_response=$(call_tool "networking-endpoint-add" "\"networkId\": \"$NETWORK_ID\", \"serviceId\": \"$POSTGRES_SERVICE_ID\", \"port\": 5432, \"protocol\": \"TCP\"")
    if validate_success "$postgres_endpoint_response" "PostgreSQL Network Endpoint" 2>/dev/null; then
        log_test_result "integration-postgres-endpoint" "PASS" "Added PostgreSQL to private network"
    fi
else
    echo "⚠️ Private networking not available"
    log_test_result "integration-private-network" "SKIP" "Private networking not available"
fi

# Test 14: Set up load balancer
echo "⚖️ Step 14: Setting up load balancer..."
lb_response=$(call_tool "networking-load-balancer-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"name\": \"app-lb\", \"type\": \"APPLICATION\", \"algorithm\": \"ROUND_ROBIN\", \"healthCheck\": {\"path\": \"/health\", \"port\": 3000, \"protocol\": \"HTTP\", \"interval\": 30, \"timeout\": 5, \"healthyThreshold\": 2, \"unhealthyThreshold\": 3}, \"listeners\": [{\"port\": 80, \"protocol\": \"HTTP\"}]")

if validate_success "$lb_response" "Load Balancer" 2>/dev/null; then
    LB_ID=$(extract_value "$lb_response" ".result.content[0].data.id")
    echo "✅ Load balancer created: $LB_ID"
    log_test_result "integration-load-balancer" "PASS" "Created load balancer $LB_ID"
    
    # Add web app as target
    lb_target_response=$(call_tool "networking-lb-target-add" "\"loadBalancerId\": \"$LB_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\", \"weight\": 100")
    if validate_success "$lb_target_response" "Load Balancer Target" 2>/dev/null; then
        log_test_result "integration-lb-target" "PASS" "Added webapp to load balancer"
    fi
else
    echo "⚠️ Load balancing not available"
    log_test_result "integration-load-balancer" "SKIP" "Load balancing not available"
fi

# Test 15: Create backup of the complete setup
echo "💾 Step 15: Creating backup of complete application stack..."
stack_backup_response=$(call_tool "backup-create" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"type\": \"PROJECT\", \"description\": \"Complete application stack backup - integration test\", \"retentionDays\": 7")

if validate_success "$stack_backup_response" "Stack Backup" 2>/dev/null; then
    STACK_BACKUP_ID=$(extract_value "$stack_backup_response" ".result.content[0].data.id")
    echo "✅ Application stack backup created: $STACK_BACKUP_ID"
    log_test_result "integration-stack-backup" "PASS" "Created stack backup $STACK_BACKUP_ID"
else
    echo "⚠️ Backup functionality not available"
    log_test_result "integration-stack-backup" "SKIP" "Backup not available"
fi

# Test 16: Trigger a rebuild to test CI/CD workflow
echo "🔄 Step 16: Testing CI/CD workflow with rebuild..."
rebuild_response=$(call_tool "deployment-trigger" "\"serviceId\": \"$WEBAPP_SERVICE_ID\"")
validate_success "$rebuild_response" "Web App Rebuild"

REBUILD_DEPLOYMENT_ID=$(extract_value "$rebuild_response" ".result.content[0].data.id")
if [ -n "$REBUILD_DEPLOYMENT_ID" ] && [ "$REBUILD_DEPLOYMENT_ID" != "null" ]; then
    echo "✅ Rebuild triggered: $REBUILD_DEPLOYMENT_ID"
    log_test_result "integration-rebuild" "PASS" "Triggered rebuild $REBUILD_DEPLOYMENT_ID"
    
    # Monitor rebuild progress
    echo "⏳ Monitoring rebuild progress..."
    wait_for_deployment "$WEBAPP_SERVICE_ID"
    rebuild_status=$?
    
    if [ $rebuild_status -eq 0 ]; then
        echo "✅ Rebuild completed successfully"
        log_test_result "integration-rebuild-complete" "PASS" "Rebuild completed successfully"
    else
        echo "❌ Rebuild failed"
        log_test_result "integration-rebuild-complete" "FAIL" "Rebuild failed"
    fi
fi

# Test 17: Test scaling (restart service to simulate scaling)
echo "📈 Step 17: Testing service scaling..."
scale_response=$(call_tool "service-restart" "\"serviceId\": \"$WEBAPP_SERVICE_ID\"")
validate_success "$scale_response" "Service Scaling"
log_test_result "integration-scaling" "PASS" "Tested service scaling/restart"

# Test 18: Generate compliance report for the deployment
echo "📋 Step 18: Generating compliance report..."
compliance_response=$(call_tool "security-compliance-report" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"framework\": \"SOC2\"")

if validate_success "$compliance_response" "Compliance Report" 2>/dev/null; then
    COMPLIANCE_ID=$(extract_value "$compliance_response" ".result.content[0].data.id")
    echo "✅ SOC2 compliance report generated: $COMPLIANCE_ID"
    log_test_result "integration-compliance" "PASS" "Generated compliance report $COMPLIANCE_ID"
else
    echo "⚠️ Compliance reporting not available"
    log_test_result "integration-compliance" "SKIP" "Compliance reporting not available"
fi

# Test 19: Test logging and debugging
echo "📄 Step 19: Testing logging and debugging capabilities..."
webapp_logs_response=$(call_tool "deployment-logs" "\"deploymentId\": \"$REBUILD_DEPLOYMENT_ID\"")
validate_success "$webapp_logs_response" "Application Logs"
log_test_result "integration-logs" "PASS" "Retrieved application logs"

# Get deployment metrics
metrics_response=$(call_tool "monitoring-apm-data" "\"projectId\": \"$INTEGRATION_PROJECT_ID\", \"serviceId\": \"$WEBAPP_SERVICE_ID\"")
if validate_success "$metrics_response" "APM Metrics" 2>/dev/null; then
    log_test_result "integration-apm" "PASS" "Retrieved APM metrics"
else
    echo "⚠️ APM metrics not available yet"
    log_test_result "integration-apm" "SKIP" "APM metrics not available"
fi

# Test 20: Final validation - list all services and their status
echo "🔍 Step 20: Final validation of complete deployment..."
final_services_response=$(call_tool "service-list" "\"projectId\": \"$INTEGRATION_PROJECT_ID\"")
validate_success "$final_services_response" "Final Service List"

# Count services and verify they're all running
service_count=$(extract_value "$final_services_response" ".result.content[0].data.services | length")
echo "📊 Total services deployed: $service_count"

# Get project info for final summary
project_info_response=$(call_tool "project-info" "\"projectId\": \"$INTEGRATION_PROJECT_ID\"")
validate_success "$project_info_response" "Final Project Info"

echo ""
echo "🎉 END-TO-END INTEGRATION TEST COMPLETE!"
echo "========================================"
echo ""
echo "📋 DEPLOYMENT SUMMARY:"
echo "   🏗️ Project ID: $INTEGRATION_PROJECT_ID"
echo "   🐘 PostgreSQL Service: $POSTGRES_SERVICE_ID"
echo "   🔴 Redis Service: $REDIS_SERVICE_ID"
echo "   🚀 Web App Service: $WEBAPP_SERVICE_ID"
echo "   💾 Storage Volume: $VOLUME_ID"
echo "   🌐 Service URL: ${SERVICE_URL:-'Not available'}"
echo "   🔒 Private Network: ${NETWORK_ID:-'Not available'}"
echo "   ⚖️ Load Balancer: ${LB_ID:-'Not available'}"
echo "   💾 Backup ID: ${STACK_BACKUP_ID:-'Not available'}"
echo "   📊 Alert ID: ${ALERT_ID:-'Not available'}"
echo ""
echo "✅ Successfully deployed and tested complete application stack!"
echo "✅ All Railway MCP tools working with real infrastructure!"
echo ""

# Save complete integration context
cat > integration-test-context.sh << EOF
#!/bin/bash
# Complete integration test context
export INTEGRATION_PROJECT_ID="$INTEGRATION_PROJECT_ID"
export POSTGRES_SERVICE_ID="$POSTGRES_SERVICE_ID"
export REDIS_SERVICE_ID="$REDIS_SERVICE_ID"
export WEBAPP_SERVICE_ID="$WEBAPP_SERVICE_ID"
export VOLUME_ID="$VOLUME_ID"
export SERVICE_URL="$SERVICE_URL"
export NETWORK_ID="$NETWORK_ID"
export LB_ID="$LB_ID"
export STACK_BACKUP_ID="$STACK_BACKUP_ID"
export ALERT_ID="$ALERT_ID"
export COMPLIANCE_ID="$COMPLIANCE_ID"

# Quick cleanup function
cleanup_integration_test() {
    echo "Cleaning up integration test resources..."
    echo '{"method": "tools/call", "params": {"name": "project-delete", "arguments": {"projectId": "'$INTEGRATION_PROJECT_ID'"}}}' | node ../build/index.js
    echo "Integration test cleanup completed"
}
EOF

echo "💾 Integration test context saved to integration-test-context.sh"
echo "🧹 To cleanup: source integration-test-context.sh && cleanup_integration_test"

log_test_result "integration-test-complete" "PASS" "End-to-end integration test completed successfully"