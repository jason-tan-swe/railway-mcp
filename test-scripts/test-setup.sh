#!/bin/bash

# test-setup.sh - Setup test environment and utilities
set -e

echo "Setting up Railway MCP Server test environment..."

# Check prerequisites
if [ -z "$RAILWAY_API_TOKEN" ]; then
    echo "❌ ERROR: RAILWAY_API_TOKEN environment variable not set"
    echo "Please set your Railway API token: export RAILWAY_API_TOKEN='your-token-here'"
    exit 1
fi

# Verify Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ ERROR: Node.js version 18+ required. Current version: $(node --version)"
    exit 1
fi

# Build the project if needed
if [ ! -f "build/index.js" ]; then
    echo "Building Railway MCP server..."
    npm run build
fi

# Test basic server functionality
echo "Testing basic server startup..."
echo '{"method": "tools/list", "params": {}}' | timeout 10s node build/index.js > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Server starts successfully"
else
    echo "❌ ERROR: Server failed to start"
    exit 1
fi

# Create test results directory
mkdir -p test-results
mkdir -p test-logs

# Utility functions for testing
cat > test-utils.sh << 'EOF'
#!/bin/bash

# Utility functions for Railway MCP testing

call_tool() {
    local tool_name="$1"
    shift
    local args="$*"
    
    local json_payload="{\"method\": \"tools/call\", \"params\": {\"name\": \"$tool_name\", \"arguments\": {$args}}}"
    
    echo "🔧 Calling tool: $tool_name" >&2
    echo "📤 Payload: $json_payload" >&2
    
    local response=$(echo "$json_payload" | node build/index.js 2>test-logs/stderr.log)
    local exit_code=$?
    
    echo "📥 Response: $response" >&2
    echo "$response"
    
    return $exit_code
}

validate_success() {
    local response="$1"
    local test_name="$2"
    
    if echo "$response" | jq -e '.result.content[0].data' > /dev/null 2>&1; then
        echo "✅ $test_name: SUCCESS"
        return 0
    else
        echo "❌ $test_name: FAILED"
        echo "Response: $response" | jq '.' 2>/dev/null || echo "$response"
        return 1
    fi
}

extract_value() {
    local response="$1"
    local jq_path="$2"
    
    echo "$response" | jq -r "$jq_path" 2>/dev/null || echo ""
}

log_test_result() {
    local test_name="$1"
    local result="$2"
    local details="$3"
    
    echo "$(date): $test_name - $result - $details" >> test-results/test-log.txt
}

wait_for_deployment() {
    local service_id="$1"
    local max_wait=300  # 5 minutes
    local waited=0
    
    echo "⏳ Waiting for deployment to complete..."
    
    while [ $waited -lt $max_wait ]; do
        local response=$(call_tool "deployment-list" "\"serviceId\": \"$service_id\"")
        local status=$(extract_value "$response" ".result.content[0].data.deployments[0].status")
        
        case "$status" in
            "SUCCESS")
                echo "✅ Deployment completed successfully"
                return 0
                ;;
            "FAILED"|"CRASHED")
                echo "❌ Deployment failed with status: $status"
                return 1
                ;;
            "BUILDING"|"DEPLOYING")
                echo "⏳ Deployment in progress (status: $status)..."
                ;;
        esac
        
        sleep 10
        waited=$((waited + 10))
    done
    
    echo "❌ Deployment timed out after $max_wait seconds"
    return 1
}

cleanup_test_resources() {
    echo "🧹 Cleaning up test resources..."
    
    # Get all test projects
    local projects_response=$(call_tool "project-list" "")
    local project_ids=$(extract_value "$projects_response" ".result.content[0].data.projects[] | select(.name | startswith(\"mcp-test\") or startswith(\"integration-test\")) | .id")
    
    for project_id in $project_ids; do
        if [ -n "$project_id" ] && [ "$project_id" != "null" ]; then
            echo "🗑️ Deleting project: $project_id"
            call_tool "project-delete" "\"projectId\": \"$project_id\"" > /dev/null 2>&1 || true
        fi
    done
}
EOF

chmod +x test-utils.sh
source test-utils.sh

echo "✅ Test environment setup complete"
echo "📁 Test results will be saved to: test-results/"
echo "📁 Test logs will be saved to: test-logs/"