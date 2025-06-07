# Railway MCP Server - Testing Framework

This directory contains a comprehensive testing framework for validating the Railway MCP server against real Railway services.

## Quick Start

1. **Set your Railway API token:**
   ```bash
   export RAILWAY_API_TOKEN="your-railway-api-token-here"
   ```

2. **Run the complete test suite:**
   ```bash
   cd test-scripts
   ./master-test.sh
   ```

3. **View results:**
   ```bash
   # Summary
   cat test-results/session-summary.txt
   
   # Detailed report
   cat test-results/detailed-report.md
   
   # Individual phase logs
   ls test-logs/
   ```

## Test Scripts

### Core Scripts
- **`master-test.sh`** - Runs complete test suite with reporting
- **`test-setup.sh`** - Initializes test environment and utilities
- **`test-utils.sh`** - Utility functions for all test scripts

### Test Phases
- **`test-foundation.sh`** - Core project/service/deployment functionality
- **`test-databases.sh`** - Database deployment and volume management
- **`test-deployments.sh`** - Advanced deployment features (rollback, versioning)
- **`test-enterprise.sh`** - Enterprise features (backup, security, compliance)
- **`test-monitoring.sh`** - Monitoring, metrics, and observability
- **`test-networking.sh`** - Private networking and load balancing
- **`test-integration.sh`** - End-to-end workflow testing

## Individual Test Execution

Run specific test phases:

```bash
# Foundation testing only
./test-foundation.sh

# Database testing only
./test-databases.sh

# Setup environment first
./test-setup.sh
source test-utils.sh
```

## Test Output

### Results Structure
```
test-results/
├── session-summary.txt    # High-level results summary
├── detailed-report.md     # Comprehensive markdown report
└── test-log.txt          # Individual test results log

test-logs/
├── Foundation.log         # Foundation phase detailed log
├── Database_Storage.log   # Database phase detailed log
├── stderr.log            # Error output
└── ...                   # Additional phase logs
```

### Test Context
The `test-context.sh` file maintains state between test phases:
```bash
source test-context.sh
echo "Project ID: $TEST_PROJECT_ID"
echo "Service ID: $TEST_SERVICE_ID"
```

## Test Configuration

### Environment Variables
- **`RAILWAY_API_TOKEN`** - Required: Your Railway API token
- **`TEST_TIMEOUT`** - Optional: Test timeout in seconds (default: 300)
- **`TEST_CLEANUP`** - Optional: Auto-cleanup resources (default: manual)

### Test Data
Tests create resources with predictable naming:
- Projects: `mcp-test-*` or `integration-test-*`
- Services: `test-service-*`, `test-postgres-*`, etc.
- Variables: `TEST_VAR`, `INTEGRATION_*`

## Utilities

### Helper Functions (test-utils.sh)
```bash
# Call MCP tools
call_tool "project-list" ""
call_tool "project-create" "\"name\": \"my-project\""

# Validate responses
validate_success "$response" "Test Name"

# Extract data from responses
project_id=$(extract_value "$response" ".result.content[0].data.id")

# Wait for deployments
wait_for_deployment "$service_id"

# Cleanup test resources
cleanup_test_resources
```

### Manual Testing
```bash
# Setup environment
./test-setup.sh
source test-utils.sh

# Test individual tools
response=$(call_tool "project-list" "")
echo "$response" | jq '.'

# Validate specific functionality
validate_success "$response" "My Test"
```

## Troubleshooting

### Common Issues

1. **Token Authentication**
   ```bash
   # Verify token is set
   echo $RAILWAY_API_TOKEN
   
   # Test basic connectivity
   echo '{"method": "tools/list", "params": {}}' | node ../build/index.js
   ```

2. **Build Issues**
   ```bash
   # Rebuild MCP server
   cd ..
   npm run build
   cd test-scripts
   ```

3. **Test Failures**
   ```bash
   # Check detailed logs
   cat test-logs/Foundation.log
   
   # Check error output
   cat test-logs/stderr.log
   
   # Run single test for debugging
   ./test-foundation.sh
   ```

4. **Resource Cleanup**
   ```bash
   # Manual cleanup
   source test-utils.sh
   cleanup_test_resources
   
   # Check Railway dashboard for remaining resources
   ```

### Resource Limits
- Tests create multiple Railway projects/services
- Ensure sufficient Railway credits for testing
- Monitor resource usage during extended testing

### Test Duration
- **Foundation**: ~5-10 minutes
- **Database**: ~10-15 minutes  
- **Complete Suite**: ~30-60 minutes
- Duration depends on Railway deployment times

## Extending Tests

### Adding New Test Phases
1. Create `test-newphase.sh` following existing patterns
2. Add to `master-test.sh` execution sequence
3. Update test context as needed

### Custom Validations
```bash
# Add custom validation function
validate_custom_response() {
    local response="$1"
    local expected_field="$2"
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null; then
        echo "✅ Custom validation passed"
        return 0
    else
        echo "❌ Custom validation failed"
        return 1
    fi
}
```

## Best Practices

1. **Always run setup first:** `./test-setup.sh`
2. **Check prerequisites:** Valid Railway token, sufficient credits
3. **Monitor resources:** Clean up after testing
4. **Save logs:** Keep test outputs for debugging
5. **Incremental testing:** Test phases individually when developing

## Security Notes

- Tests use real Railway services and may incur costs
- API tokens have full account access - use dedicated test accounts
- Test resources are automatically named for easy identification
- Cleanup removes all `mcp-test-*` and `integration-test-*` resources