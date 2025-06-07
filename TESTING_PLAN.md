# Railway MCP Server - Real Service Testing Plan

## Overview

This testing plan validates the Railway MCP server against live Railway services without using mocks. We'll create a dedicated Railway account/team for testing and systematically verify all 105+ tools across the complete API surface.

## Prerequisites

### 1. Railway Test Environment Setup
- **Railway Account**: Create dedicated testing account (or use separate team)
- **API Token**: Generate Railway API token with full permissions
- **Test Repository**: Create dedicated GitHub repo for deployment testing
- **Credit Allocation**: Ensure sufficient Railway credits for testing activities

### 2. Local Environment Setup
```bash
# Clone and setup
git clone <repository>
cd railway-mcp
npm install
npm run build

# Set API token
export RAILWAY_API_TOKEN="your-test-railway-api-token"

# Test basic server startup
echo '{"method": "tools/list", "params": {}}' | node build/index.js
```

### 3. Test Data Preparation
- **GitHub Repository**: Simple Node.js/Docker app for service testing
- **Database Schemas**: SQL scripts for database testing
- **Environment Variables**: Test configuration data
- **Domain Names**: Test domains for custom domain testing

## Testing Strategy

### Phase 1: Foundation Testing (Core Infrastructure)
**Duration**: 2-3 hours  
**Goal**: Verify basic project, service, and deployment functionality

#### Test Projects & Environment Management
```bash
# Test script: test-foundation.sh
#!/bin/bash

echo "=== Foundation Testing Phase ==="

# Test project operations
echo '{"method": "tools/call", "params": {"name": "project-list", "arguments": {}}}' | node build/index.js
echo '{"method": "tools/call", "params": {"name": "project-create", "arguments": {"name": "mcp-test-project"}}}' | node build/index.js

# Capture project ID for subsequent tests
PROJECT_ID=$(echo '{"method": "tools/call", "params": {"name": "project-list", "arguments": {}}}' | node build/index.js | jq -r '.result.content[0].data.projects[0].id')

# Test environment management
echo '{"method": "tools/call", "params": {"name": "project-environments", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js

# Test service creation
echo '{"method": "tools/call", "params": {"name": "service-create-from-repo", "arguments": {"projectId": "'$PROJECT_ID'", "repoUrl": "https://github.com/railwayapp/starters", "name": "test-service"}}}' | node build/index.js
```

#### Success Criteria
- ✅ Projects can be listed, created, and managed
- ✅ Environments are accessible and configurable
- ✅ Services deploy successfully from GitHub
- ✅ Basic deployment workflow completes

### Phase 2: Database & Storage Testing
**Duration**: 2-3 hours  
**Goal**: Verify database deployment and volume management

```bash
# Test script: test-databases.sh
#!/bin/bash

echo "=== Database Testing Phase ==="

# Test database type listing
echo '{"method": "tools/call", "params": {"name": "database-list-types", "arguments": {}}}' | node build/index.js

# Deploy PostgreSQL database
echo '{"method": "tools/call", "params": {"name": "database-deploy", "arguments": {"projectId": "'$PROJECT_ID'", "type": "POSTGRESQL", "name": "test-postgres"}}}' | node build/index.js

# Test volume operations
echo '{"method": "tools/call", "params": {"name": "volume-list", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js
echo '{"method": "tools/call", "params": {"name": "volume-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "test-volume", "mountPath": "/data"}}}' | node build/index.js
```

#### Success Criteria
- ✅ Database services deploy successfully
- ✅ Volumes can be created and mounted
- ✅ Database connections are accessible
- ✅ Storage persistence works correctly

### Phase 3: Advanced Deployment Testing
**Duration**: 3-4 hours  
**Goal**: Test rollback, versioning, and advanced deployment strategies

```bash
# Test script: test-deployments.sh
#!/bin/bash

echo "=== Advanced Deployment Testing Phase ==="

# Get service ID from previous tests
SERVICE_ID=$(echo '{"method": "tools/call", "params": {"name": "service-list", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js | jq -r '.result.content[0].data.services[0].id')

# Test deployment versions
echo '{"method": "tools/call", "params": {"name": "deployment-versions", "arguments": {"serviceId": "'$SERVICE_ID'"}}}' | node build/index.js

# Test build management
echo '{"method": "tools/call", "params": {"name": "build-list", "arguments": {"serviceId": "'$SERVICE_ID'"}}}' | node build/index.js
echo '{"method": "tools/call", "params": {"name": "build-trigger", "arguments": {"serviceId": "'$SERVICE_ID'"}}}' | node build/index.js

# Test rollback functionality
CURRENT_VERSION=$(echo '{"method": "tools/call", "params": {"name": "deployment-versions", "arguments": {"serviceId": "'$SERVICE_ID'"}}}' | node build/index.js | jq -r '.result.content[0].data.versions[1].id')

echo '{"method": "tools/call", "params": {"name": "deployment-rollback", "arguments": {"serviceId": "'$SERVICE_ID'", "versionId": "'$CURRENT_VERSION'", "reason": "Testing rollback functionality"}}}' | node build/index.js
```

#### Success Criteria
- ✅ Deployment versions are tracked correctly
- ✅ Builds can be triggered and monitored
- ✅ Rollback operations work reliably
- ✅ Build logs are accessible and complete

### Phase 4: Enterprise Features Testing
**Duration**: 4-5 hours  
**Goal**: Validate backup, security, and compliance features

```bash
# Test script: test-enterprise.sh
#!/bin/bash

echo "=== Enterprise Features Testing Phase ==="

# Test backup operations
echo '{"method": "tools/call", "params": {"name": "backup-create", "arguments": {"projectId": "'$PROJECT_ID'", "type": "PROJECT", "description": "Test backup"}}}' | node build/index.js

BACKUP_ID=$(echo '{"method": "tools/call", "params": {"name": "backup-list", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js | jq -r '.result.content[0].data.backups[0].id')

echo '{"method": "tools/call", "params": {"name": "backup-get", "arguments": {"backupId": "'$BACKUP_ID'"}}}' | node build/index.js

# Test security features
echo '{"method": "tools/call", "params": {"name": "security-audit-logs", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js
echo '{"method": "tools/call", "params": {"name": "security-vulnerabilities", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js

# Test access token management
echo '{"method": "tools/call", "params": {"name": "security-token-create", "arguments": {"name": "test-token", "permissions": ["project:read"], "expiresAt": "2024-12-31T23:59:59Z"}}}' | node build/index.js
```

#### Success Criteria
- ✅ Backups can be created and retrieved
- ✅ Security audit logs are accessible
- ✅ Vulnerability scanning works
- ✅ Access token management functions properly

### Phase 5: Monitoring & Observability Testing
**Duration**: 3-4 hours  
**Goal**: Verify metrics, alerting, and tracing functionality

```bash
# Test script: test-monitoring.sh
#!/bin/bash

echo "=== Monitoring Testing Phase ==="

# Test metrics collection
echo '{"method": "tools/call", "params": {"name": "monitoring-metrics-query", "arguments": {"projectId": "'$PROJECT_ID'", "serviceId": "'$SERVICE_ID'"}}}' | node build/index.js

# Create custom metric
echo '{"method": "tools/call", "params": {"name": "monitoring-metric-create", "arguments": {"projectId": "'$PROJECT_ID'", "serviceId": "'$SERVICE_ID'", "name": "test_metric", "type": "COUNTER", "value": 42}}}' | node build/index.js

# Test APM data
echo '{"method": "tools/call", "params": {"name": "monitoring-apm-data", "arguments": {"projectId": "'$PROJECT_ID'", "serviceId": "'$SERVICE_ID'"}}}' | node build/index.js

# Test alerting
echo '{"method": "tools/call", "params": {"name": "monitoring-alert-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "test-alert", "description": "Test alert", "condition": "cpu_usage > 80", "threshold": 80, "severity": "HIGH", "notifications": [{"type": "EMAIL", "destination": "test@example.com"}]}}}' | node build/index.js

# Test distributed tracing
echo '{"method": "tools/call", "params": {"name": "monitoring-traces", "arguments": {"projectId": "'$PROJECT_ID'", "serviceId": "'$SERVICE_ID'"}}}' | node build/index.js
```

#### Success Criteria
- ✅ Metrics are collected and queryable
- ✅ Custom metrics can be created
- ✅ APM data is accessible and complete
- ✅ Alerts can be configured and triggered
- ✅ Distributed tracing data is available

### Phase 6: Networking & Infrastructure Testing
**Duration**: 3-4 hours  
**Goal**: Test private networking, load balancing, and security

```bash
# Test script: test-networking.sh
#!/bin/bash

echo "=== Networking Testing Phase ==="

# Test private networking
echo '{"method": "tools/call", "params": {"name": "networking-network-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "test-network", "cidr": "10.0.0.0/24", "region": "us-west1"}}}' | node build/index.js

NETWORK_ID=$(echo '{"method": "tools/call", "params": {"name": "networking-private-networks", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js | jq -r '.result.content[0].data.networks[0].id')

# Add service to network
echo '{"method": "tools/call", "params": {"name": "networking-endpoint-add", "arguments": {"networkId": "'$NETWORK_ID'", "serviceId": "'$SERVICE_ID'", "port": 3000, "protocol": "HTTP"}}}' | node build/index.js

# Test load balancer
echo '{"method": "tools/call", "params": {"name": "networking-load-balancer-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "test-lb", "type": "APPLICATION", "algorithm": "ROUND_ROBIN", "healthCheck": {"path": "/health", "port": 3000, "protocol": "HTTP", "interval": 30, "timeout": 5, "healthyThreshold": 2, "unhealthyThreshold": 3}, "listeners": [{"port": 80, "protocol": "HTTP"}]}}}' | node build/index.js

# Test security groups
echo '{"method": "tools/call", "params": {"name": "networking-security-group-create", "arguments": {"networkId": "'$NETWORK_ID'", "name": "test-sg", "description": "Test security group", "rules": [{"direction": "INBOUND", "protocol": "TCP", "portRange": "80", "source": "0.0.0.0/0", "action": "ALLOW", "priority": 100}]}}}' | node build/index.js
```

#### Success Criteria
- ✅ Private networks can be created and managed
- ✅ Services can be added to private networks
- ✅ Load balancers distribute traffic correctly
- ✅ Security groups enforce access rules

### Phase 7: Integration Testing
**Duration**: 2-3 hours  
**Goal**: Test end-to-end workflows and cross-feature integration

```bash
# Test script: test-integration.sh
#!/bin/bash

echo "=== Integration Testing Phase ==="

# Test complete deployment workflow
# 1. Create project
# 2. Deploy service with database
# 3. Configure networking
# 4. Set up monitoring
# 5. Create backup
# 6. Test rollback

PROJECT_ID=$(echo '{"method": "tools/call", "params": {"name": "project-create", "arguments": {"name": "integration-test-project"}}}' | node build/index.js | jq -r '.result.content[0].data.id')

# Deploy full stack
echo '{"method": "tools/call", "params": {"name": "service-create-from-repo", "arguments": {"projectId": "'$PROJECT_ID'", "repoUrl": "https://github.com/your-test-repo", "name": "web-service"}}}' | node build/index.js

echo '{"method": "tools/call", "params": {"name": "database-deploy", "arguments": {"projectId": "'$PROJECT_ID'", "type": "POSTGRESQL", "name": "app-db"}}}' | node build/index.js

# Configure environment variables
echo '{"method": "tools/call", "params": {"name": "variable-set", "arguments": {"projectId": "'$PROJECT_ID'", "key": "DATABASE_URL", "value": "postgresql://user:pass@localhost:5432/db"}}}' | node build/index.js

# Set up monitoring and backup
echo '{"method": "tools/call", "params": {"name": "monitoring-alert-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "high-cpu", "description": "High CPU usage", "condition": "cpu_usage > 80", "threshold": 80, "severity": "HIGH", "notifications": [{"type": "EMAIL", "destination": "test@example.com"}]}}}' | node build/index.js

echo '{"method": "tools/call", "params": {"name": "backup-policy-create", "arguments": {"projectId": "'$PROJECT_ID'", "name": "daily-backup", "schedule": "0 2 * * *", "backupType": "PROJECT", "retentionDays": 7, "targets": []}}}' | node build/index.js
```

#### Success Criteria
- ✅ Complete application stack deploys successfully
- ✅ All services communicate properly
- ✅ Monitoring captures application metrics
- ✅ Backup and recovery processes work
- ✅ End-to-end workflows complete without errors

## Test Execution Framework

### Automated Test Runner
```bash
# master-test.sh - Execute all test phases
#!/bin/bash

set -e  # Exit on any error

echo "Starting Railway MCP Server Full Test Suite"
echo "============================================"

# Setup test environment
source ./test-setup.sh

# Run test phases
echo "Phase 1: Foundation Testing"
./test-foundation.sh

echo "Phase 2: Database Testing"
./test-databases.sh

echo "Phase 3: Deployment Testing"
./test-deployments.sh

echo "Phase 4: Enterprise Testing"
./test-enterprise.sh

echo "Phase 5: Monitoring Testing"
./test-monitoring.sh

echo "Phase 6: Networking Testing"
./test-networking.sh

echo "Phase 7: Integration Testing"
./test-integration.sh

# Cleanup test resources
echo "Cleaning up test resources"
./test-cleanup.sh

echo "All tests completed successfully!"
```

### Test Validation Scripts
```bash
# validate-responses.sh - Validate API responses
#!/bin/bash

validate_json_response() {
    local response="$1"
    local expected_field="$2"
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null; then
        echo "✅ Response contains expected field: $expected_field"
        return 0
    else
        echo "❌ Response missing expected field: $expected_field"
        echo "Response: $response"
        return 1
    fi
}

validate_success_response() {
    local response="$1"
    
    if echo "$response" | jq -e '.result.content[0].data' > /dev/null; then
        echo "✅ Successful response received"
        return 0
    else
        echo "❌ Error response received"
        echo "Response: $response"
        return 1
    fi
}
```

### Continuous Monitoring
```bash
# test-monitor.sh - Monitor test resources during testing
#!/bin/bash

monitor_railway_resources() {
    while true; do
        echo "=== Resource Monitor $(date) ==="
        
        # Check service health
        echo '{"method": "tools/call", "params": {"name": "service-list", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js | jq '.result.content[0].data.services[] | {name: .name, status: .status}'
        
        # Check deployment status
        echo '{"method": "tools/call", "params": {"name": "deployment-list", "arguments": {"serviceId": "'$SERVICE_ID'"}}}' | node build/index.js | jq '.result.content[0].data.deployments[0] | {status: .status, createdAt: .createdAt}'
        
        sleep 30
    done
}
```

## Expected Outcomes

### Success Metrics
- **API Coverage**: 100% of implemented tools successfully tested
- **Response Validation**: All API responses contain expected data structures
- **Error Handling**: Proper error messages for invalid inputs
- **Performance**: Response times under acceptable thresholds
- **Reliability**: No unexpected failures during test execution

### Test Reports
- **Detailed Logs**: Complete request/response logs for each test
- **Performance Metrics**: Response time analysis across all tools
- **Error Analysis**: Classification and resolution of any failures
- **Coverage Report**: Matrix of tested vs. implemented functionality

### Cleanup Procedures
```bash
# test-cleanup.sh - Clean up all test resources
#!/bin/bash

echo "Cleaning up test resources..."

# Delete test projects (this cascades to delete all resources)
for PROJECT_ID in $(echo '{"method": "tools/call", "params": {"name": "project-list", "arguments": {}}}' | node build/index.js | jq -r '.result.content[0].data.projects[] | select(.name | startswith("mcp-test") or startswith("integration-test")) | .id'); do
    echo "Deleting project: $PROJECT_ID"
    echo '{"method": "tools/call", "params": {"name": "project-delete", "arguments": {"projectId": "'$PROJECT_ID'"}}}' | node build/index.js
done

echo "Cleanup completed"
```

This comprehensive testing plan ensures thorough validation of the Railway MCP server against real Railway services, providing confidence in the implementation's reliability and correctness.

## Quick Start

The complete testing framework is implemented in the `test-scripts/` directory:

```bash
# Set your Railway API token
export RAILWAY_API_TOKEN="your-railway-api-token-here"

# Run the complete test suite
cd test-scripts
./master-test.sh
```

For detailed instructions, see [test-scripts/README.md](test-scripts/README.md).