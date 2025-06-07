#!/bin/bash

# test-databases.sh - Test database and volume functionality
set -e

echo "🗄️ Starting Database & Storage Testing Phase"
echo "==========================================="

source test-utils.sh

# Load test context from foundation phase
if [ -f test-context.sh ]; then
    source test-context.sh
else
    echo "❌ ERROR: test-context.sh not found. Run test-foundation.sh first."
    exit 1
fi

PROJECT_ID="$TEST_PROJECT_ID"

# Test 1: Database type listing
echo "📋 Testing database type listing..."
db_types_response=$(call_tool "database-list-types" "")
validate_success "$db_types_response" "Database Types List"
log_test_result "database-list-types" "PASS" "Retrieved available database types"

# Test 2: PostgreSQL database deployment
echo "🐘 Testing PostgreSQL database deployment..."
postgres_response=$(call_tool "database-deploy" "\"projectId\": \"$PROJECT_ID\", \"type\": \"POSTGRESQL\", \"name\": \"test-postgres-$(date +%s)\"")
validate_success "$postgres_response" "PostgreSQL Database Deploy"

POSTGRES_SERVICE_ID=$(extract_value "$postgres_response" ".result.content[0].data.id")
if [ -z "$POSTGRES_SERVICE_ID" ] || [ "$POSTGRES_SERVICE_ID" = "null" ]; then
    echo "❌ Failed to extract PostgreSQL service ID"
    exit 1
fi

echo "✅ Created PostgreSQL database with service ID: $POSTGRES_SERVICE_ID"
log_test_result "database-deploy-postgres" "PASS" "Created PostgreSQL database $POSTGRES_SERVICE_ID"

# Test 3: Redis database deployment
echo "🔴 Testing Redis database deployment..."
redis_response=$(call_tool "database-deploy" "\"projectId\": \"$PROJECT_ID\", \"type\": \"REDIS\", \"name\": \"test-redis-$(date +%s)\"")
validate_success "$redis_response" "Redis Database Deploy"

REDIS_SERVICE_ID=$(extract_value "$redis_response" ".result.content[0].data.id")
if [ -z "$REDIS_SERVICE_ID" ] || [ "$REDIS_SERVICE_ID" = "null" ]; then
    echo "❌ Failed to extract Redis service ID"
    exit 1
fi

echo "✅ Created Redis database with service ID: $REDIS_SERVICE_ID"
log_test_result "database-deploy-redis" "PASS" "Created Redis database $REDIS_SERVICE_ID"

# Test 4: Wait for database deployments
echo "⏳ Waiting for PostgreSQL deployment..."
wait_for_deployment "$POSTGRES_SERVICE_ID"
postgres_wait_result=$?

echo "⏳ Waiting for Redis deployment..."
wait_for_deployment "$REDIS_SERVICE_ID"
redis_wait_result=$?

if [ $postgres_wait_result -eq 0 ]; then
    log_test_result "postgres-deployment-wait" "PASS" "PostgreSQL deployed successfully"
else
    log_test_result "postgres-deployment-wait" "FAIL" "PostgreSQL deployment failed"
fi

if [ $redis_wait_result -eq 0 ]; then
    log_test_result "redis-deployment-wait" "PASS" "Redis deployed successfully"
else
    log_test_result "redis-deployment-wait" "FAIL" "Redis deployment failed"
fi

# Test 5: Database service info
echo "ℹ️ Testing database service info retrieval..."
postgres_info_response=$(call_tool "service-info" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
validate_success "$postgres_info_response" "PostgreSQL Service Info"
log_test_result "postgres-service-info" "PASS" "Retrieved PostgreSQL service info"

redis_info_response=$(call_tool "service-info" "\"serviceId\": \"$REDIS_SERVICE_ID\"")
validate_success "$redis_info_response" "Redis Service Info"
log_test_result "redis-service-info" "PASS" "Retrieved Redis service info"

# Test 6: Database variables (connection strings)
echo "🔗 Testing database connection variables..."
postgres_vars_response=$(call_tool "variable-list" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
validate_success "$postgres_vars_response" "PostgreSQL Variables"
log_test_result "postgres-variables" "PASS" "Retrieved PostgreSQL connection variables"

redis_vars_response=$(call_tool "variable-list" "\"serviceId\": \"$REDIS_SERVICE_ID\"")
validate_success "$redis_vars_response" "Redis Variables"
log_test_result "redis-variables" "PASS" "Retrieved Redis connection variables"

# Test 7: Volume operations
echo "💾 Testing volume operations..."

# List existing volumes
volumes_list_response=$(call_tool "volume-list" "\"projectId\": \"$PROJECT_ID\"")
validate_success "$volumes_list_response" "Volume List"
log_test_result "volume-list" "PASS" "Retrieved volume list for project"

# Create a new volume
volume_create_response=$(call_tool "volume-create" "\"projectId\": \"$PROJECT_ID\", \"name\": \"test-volume-$(date +%s)\", \"mountPath\": \"/data\"")
validate_success "$volume_create_response" "Volume Create"

VOLUME_ID=$(extract_value "$volume_create_response" ".result.content[0].data.id")
if [ -z "$VOLUME_ID" ] || [ "$VOLUME_ID" = "null" ]; then
    echo "❌ Failed to extract volume ID"
    exit 1
fi

echo "✅ Created volume with ID: $VOLUME_ID"
log_test_result "volume-create" "PASS" "Created volume $VOLUME_ID"

# Test 8: Volume info retrieval
echo "🔍 Testing volume info retrieval..."
volume_info_response=$(call_tool "volume-info" "\"volumeId\": \"$VOLUME_ID\"")
validate_success "$volume_info_response" "Volume Info"
log_test_result "volume-info" "PASS" "Retrieved volume info for $VOLUME_ID"

# Test 9: Volume attachment to service
echo "🔗 Testing volume attachment..."
volume_attach_response=$(call_tool "volume-attach" "\"volumeId\": \"$VOLUME_ID\", \"serviceId\": \"$TEST_SERVICE_ID\", \"mountPath\": \"/app/data\"")
validate_success "$volume_attach_response" "Volume Attach"
log_test_result "volume-attach" "PASS" "Attached volume $VOLUME_ID to service $TEST_SERVICE_ID"

# Test 10: Volume detachment
echo "🔌 Testing volume detachment..."
volume_detach_response=$(call_tool "volume-detach" "\"volumeId\": \"$VOLUME_ID\", \"serviceId\": \"$TEST_SERVICE_ID\"")
validate_success "$volume_detach_response" "Volume Detach"
log_test_result "volume-detach" "PASS" "Detached volume $VOLUME_ID from service $TEST_SERVICE_ID"

# Test 11: Database TCP proxy testing
echo "🌐 Testing TCP proxy for databases..."
postgres_tcp_response=$(call_tool "tcpProxy-list" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
validate_success "$postgres_tcp_response" "PostgreSQL TCP Proxy List"
log_test_result "postgres-tcp-proxy" "PASS" "Retrieved TCP proxy info for PostgreSQL"

# Test 12: Database deployment logs
echo "📄 Testing database deployment logs..."
postgres_deployments=$(call_tool "deployment-list" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
POSTGRES_DEPLOYMENT_ID=$(extract_value "$postgres_deployments" ".result.content[0].data.deployments[0].id")

if [ -n "$POSTGRES_DEPLOYMENT_ID" ] && [ "$POSTGRES_DEPLOYMENT_ID" != "null" ]; then
    postgres_logs_response=$(call_tool "deployment-logs" "\"deploymentId\": \"$POSTGRES_DEPLOYMENT_ID\"")
    validate_success "$postgres_logs_response" "PostgreSQL Deployment Logs"
    log_test_result "postgres-deployment-logs" "PASS" "Retrieved PostgreSQL deployment logs"
fi

# Test 13: Database service restart
echo "🔄 Testing database service restart..."
postgres_restart_response=$(call_tool "service-restart" "\"serviceId\": \"$POSTGRES_SERVICE_ID\"")
validate_success "$postgres_restart_response" "PostgreSQL Service Restart"
log_test_result "postgres-restart" "PASS" "Restarted PostgreSQL service"

# Update test context with database information
cat >> test-context.sh << EOF

# Database test context
export TEST_POSTGRES_SERVICE_ID="$POSTGRES_SERVICE_ID"
export TEST_REDIS_SERVICE_ID="$REDIS_SERVICE_ID"
export TEST_VOLUME_ID="$VOLUME_ID"
EOF

echo ""
echo "✅ Database & Storage Testing Phase Complete"
echo "📋 Summary:"
echo "   - PostgreSQL Service ID: $POSTGRES_SERVICE_ID"
echo "   - Redis Service ID: $REDIS_SERVICE_ID"
echo "   - Volume ID: $VOLUME_ID"
echo "   - All database and storage functionality verified"
echo ""
echo "💾 Database context added to test-context.sh"