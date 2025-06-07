#!/bin/bash

# test-foundation.sh - Test core project and service functionality
set -e

echo "🚀 Starting Foundation Testing Phase"
echo "=================================="

source ./test-utils.sh

# Test 1: Project listing
echo "📋 Testing project listing..."
projects_response=$(call_tool "project-list" "")
validate_success "$projects_response" "Project List"
log_test_result "project-list" "PASS" "Successfully retrieved project list"

# Test 2: Project creation
echo "🏗️ Testing project creation..."
create_response=$(call_tool "project-create" "\"name\": \"mcp-test-foundation-$(date +%s)\"")
validate_success "$create_response" "Project Creation"

PROJECT_ID=$(extract_value "$create_response" ".result.content[0].data.id")
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo "❌ Failed to extract project ID from creation response"
    exit 1
fi

echo "✅ Created test project with ID: $PROJECT_ID"
log_test_result "project-create" "PASS" "Created project $PROJECT_ID"

# Test 3: Project info retrieval
echo "ℹ️ Testing project info retrieval..."
info_response=$(call_tool "project-info" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$info_response" "Project Info"
log_test_result "project-info" "PASS" "Retrieved project info for $PROJECT_ID"

# Test 4: Environment listing
echo "🌍 Testing environment listing..."
env_response=$(call_tool "project-environments" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$env_response" "Environment List"
log_test_result "project-environments" "PASS" "Retrieved environments for $PROJECT_ID"

# Test 5: Service creation from repository
echo "⚙️ Testing service creation from repository..."
service_response=$(call_tool "service-create-from-repo" "\"projectId\": \"$PROJECT_ID\", \"repoUrl\": \"https://github.com/railwayapp/starters\", \"name\": \"test-service-$(date +%s)\"")
validate_success "$service_response" "Service Creation from Repo"

SERVICE_ID=$(extract_value "$service_response" ".result.content[0].data.id")
if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo "❌ Failed to extract service ID from creation response"
    exit 1
fi

echo "✅ Created test service with ID: $SERVICE_ID"
log_test_result "service-create-from-repo" "PASS" "Created service $SERVICE_ID"

# Test 6: Service listing
echo "📝 Testing service listing..."
services_response=$(call_tool "service-list" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$services_response" "Service List"
log_test_result "service-list" "PASS" "Retrieved services for project $PROJECT_ID"

# Test 7: Service info retrieval
echo "🔍 Testing service info retrieval..."
service_info_response=$(call_tool "service-info" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$service_info_response" "Service Info"
log_test_result "service-info" "PASS" "Retrieved service info for $SERVICE_ID"

# Test 8: Wait for initial deployment
echo "⏳ Waiting for initial deployment to complete..."
wait_for_deployment "$SERVICE_ID"
deployment_wait_result=$?

if [ $deployment_wait_result -eq 0 ]; then
    log_test_result "initial-deployment" "PASS" "Service deployed successfully"
else
    log_test_result "initial-deployment" "FAIL" "Service deployment failed or timed out"
fi

# Test 9: Deployment listing
echo "📊 Testing deployment listing..."
deployments_response=$(call_tool "deployment-list" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$deployments_response" "Deployment List"

DEPLOYMENT_ID=$(extract_value "$deployments_response" ".result.content[0].data.deployments[0].id")
log_test_result "deployment-list" "PASS" "Retrieved deployments for service $SERVICE_ID"

# Test 10: Deployment logs
if [ -n "$DEPLOYMENT_ID" ] && [ "$DEPLOYMENT_ID" != "null" ]; then
    echo "📄 Testing deployment logs..."
    logs_response=$(call_tool "deployment-logs" "\"deploymentId\": \"$DEPLOYMENT_ID\"")
    validate_success "$logs_response" "Deployment Logs"
    log_test_result "deployment-logs" "PASS" "Retrieved logs for deployment $DEPLOYMENT_ID"
fi

# Test 11: Deployment health check
echo "🏥 Testing deployment health check..."
health_response=$(call_tool "deployment-health-check" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$health_response" "Deployment Health Check"
log_test_result "deployment-health-check" "PASS" "Health check completed for service $SERVICE_ID"

# Test 12: Variable management
echo "🔧 Testing variable management..."

# Set a variable
var_set_response=$(call_tool "variable-set" "\"serviceId\": \"$SERVICE_ID\", \"key\": \"TEST_VAR\", \"value\": \"test-value-123\"")
validate_success "$var_set_response" "Variable Set"
log_test_result "variable-set" "PASS" "Set variable TEST_VAR for service $SERVICE_ID"

# List variables
var_list_response=$(call_tool "variable-list" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$var_list_response" "Variable List"
log_test_result "variable-list" "PASS" "Retrieved variables for service $SERVICE_ID"

# Delete the test variable
var_delete_response=$(call_tool "variable-delete" "\"serviceId\": \"$SERVICE_ID\", \"key\": \"TEST_VAR\"")
validate_success "$var_delete_response" "Variable Delete"
log_test_result "variable-delete" "PASS" "Deleted variable TEST_VAR for service $SERVICE_ID"

# Test 13: Service restart
echo "🔄 Testing service restart..."
restart_response=$(call_tool "service-restart" "\"serviceId\": \"$SERVICE_ID\"")
validate_success "$restart_response" "Service Restart"
log_test_result "service-restart" "PASS" "Restarted service $SERVICE_ID"

# Save test context for subsequent test phases
cat > test-context.sh << EOF
#!/bin/bash
# Test context from foundation phase
export TEST_PROJECT_ID="$PROJECT_ID"
export TEST_SERVICE_ID="$SERVICE_ID"
export TEST_DEPLOYMENT_ID="$DEPLOYMENT_ID"
EOF

echo ""
echo "✅ Foundation Testing Phase Complete"
echo "📋 Summary:"
echo "   - Project ID: $PROJECT_ID"
echo "   - Service ID: $SERVICE_ID"
echo "   - Deployment ID: $DEPLOYMENT_ID"
echo "   - All core functionality verified"
echo ""
echo "💾 Test context saved to test-context.sh"