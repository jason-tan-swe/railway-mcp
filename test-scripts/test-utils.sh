#!/bin/bash

# test-utils.sh - Common utilities for Railway MCP testing framework
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global test state
TEST_LOG_FILE="test-logs/$(date +%Y%m%d_%H%M%S)_test.log"
TEST_RESULTS_FILE="test-results/session-summary.txt"

# Initialize test environment
init_test_environment() {
    # Create directories if they don't exist
    mkdir -p test-logs test-results
    
    # Initialize log files
    echo "=== Railway MCP Test Session Started: $(date) ===" > "$TEST_LOG_FILE"
    echo "=== Railway MCP Test Results: $(date) ===" > "$TEST_RESULTS_FILE"
    
    # Check required environment
    if [ -z "$RAILWAY_API_TOKEN" ]; then
        echo -e "${RED}❌ RAILWAY_API_TOKEN not set${NC}"
        echo "Please set your Railway API token:"
        echo "export RAILWAY_API_TOKEN='your-token-here'"
        exit 1
    fi
    
    # Check that build exists
    if [ ! -f "build/index.js" ]; then
        echo -e "${YELLOW}⚠️ Build not found, running build...${NC}"
        npm run build
    fi
    
    echo -e "${GREEN}✅ Test environment initialized${NC}"
}

# Call Railway MCP tool and return response
call_tool() {
    local tool_name="$1"
    local params="$2"
    
    # Log the tool call
    echo "TOOL_CALL: $tool_name with params: $params" >> "$TEST_LOG_FILE"
    
    # Create JSON-RPC request
    local request
    if [ -z "$params" ] || [ "$params" = '""' ]; then
        request='{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "'$tool_name'", "arguments": {}}}'
    else
        request='{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "'$tool_name'", "arguments": {'$params'}}}'
    fi
    
    # Make the call and capture response
    local response
    if command -v gtimeout >/dev/null 2>&1; then
        response=$(echo "$request" | gtimeout 10s node build/index.js 2>/dev/null | head -1)
    else
        # Fallback for macOS without timeout
        response=$(echo "$request" | node build/index.js 2>/dev/null | head -1)
    fi
    
    # Log the response
    echo "RESPONSE: $response" >> "$TEST_LOG_FILE"
    
    echo "$response"
}

# Extract value from JSON response using jq
extract_value() {
    local json_response="$1"
    local jq_path="$2"
    
    echo "$json_response" | jq -r "$jq_path" 2>/dev/null || echo ""
}

# Validate that a tool response indicates success
validate_success() {
    local response="$1"
    local operation_name="$2"
    
    # Check if response is valid JSON
    if ! echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${RED}❌ $operation_name: Invalid JSON response${NC}"
        echo "Response: $response"
        return 1
    fi
    
    # Check if response contains JSON-RPC error
    local error=$(echo "$response" | jq -r '.error // empty')
    if [ -n "$error" ] && [ "$error" != "null" ] && [ "$error" != "" ]; then
        echo -e "${RED}❌ $operation_name failed:${NC}"
        echo "$response" | jq '.error' 2>/dev/null || echo "$response"
        return 1
    fi
    
    # Check if response contains result content
    if echo "$response" | jq -e '.result.content' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $operation_name succeeded${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ $operation_name: Unexpected response format${NC}"
        echo "Response: $response"
        return 1
    fi
}

# Log test result
log_test_result() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    
    local timestamp=$(date '+%H:%M:%S')
    local log_entry="[$timestamp] $test_name: $status - $details"
    
    echo "$log_entry" >> "$TEST_RESULTS_FILE"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ $test_name: $details${NC}"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}❌ $test_name: $details${NC}"
    else
        echo -e "${YELLOW}⚠️ $test_name: $details${NC}"
    fi
}

# Wait for deployment to complete
wait_for_deployment() {
    local service_id="$1"
    local max_wait=300  # 5 minutes
    local wait_time=0
    local check_interval=15
    
    echo -e "${BLUE}⏳ Waiting for deployment to complete...${NC}"
    
    while [ $wait_time -lt $max_wait ]; do
        # Check deployment status
        local health_response=$(call_tool "deployment-health-check" "\"serviceId\": \"$service_id\"")
        
        if validate_success "$health_response" "Health Check" 2>/dev/null; then
            # Check if service is running
            local status=$(extract_value "$health_response" ".result.content[0].data.status")
            if [ "$status" = "SUCCESS" ] || [ "$status" = "RUNNING" ]; then
                echo -e "${GREEN}✅ Deployment completed successfully${NC}"
                return 0
            fi
        fi
        
        echo -e "${YELLOW}⏳ Still deploying... (${wait_time}s elapsed)${NC}"
        sleep $check_interval
        wait_time=$((wait_time + check_interval))
    done
    
    echo -e "${RED}❌ Deployment timed out after ${max_wait}s${NC}"
    return 1
}

# Generate random string for unique naming
generate_random_string() {
    local length=${1:-8}
    cat /dev/urandom | LC_ALL=C tr -dc 'a-z0-9' | fold -w $length | head -n 1
}

# Clean up test resources by name pattern
cleanup_test_resources() {
    local project_pattern="$1"
    
    echo -e "${BLUE}🧹 Cleaning up test resources...${NC}"
    
    # List projects and find test projects
    local projects_response=$(call_tool "project-list" "")
    if validate_success "$projects_response" "Project List" 2>/dev/null; then
        # Extract project IDs that match the test pattern
        local test_projects=$(extract_value "$projects_response" '.result.content[0].data.projects[] | select(.name | test("'"$project_pattern"'")) | .id')
        
        for project_id in $test_projects; do
            if [ -n "$project_id" ] && [ "$project_id" != "null" ]; then
                echo -e "${YELLOW}🗑️ Deleting test project: $project_id${NC}"
                call_tool "project-delete" "\"projectId\": \"$project_id\"" > /dev/null 2>&1 || true
            fi
        done
    fi
    
    echo -e "${GREEN}✅ Cleanup completed${NC}"
}

# Display test summary
display_test_summary() {
    local phase_name="$1"
    
    echo ""
    echo -e "${BLUE}📊 Test Summary for $phase_name${NC}"
    echo "=================================="
    
    if [ -f "$TEST_RESULTS_FILE" ]; then
        local total_tests=$(grep -c ":" "$TEST_RESULTS_FILE" || echo "0")
        local passed_tests=$(grep -c "PASS" "$TEST_RESULTS_FILE" || echo "0")
        local failed_tests=$(grep -c "FAIL" "$TEST_RESULTS_FILE" || echo "0")
        
        echo -e "${GREEN}✅ Passed: $passed_tests${NC}"
        echo -e "${RED}❌ Failed: $failed_tests${NC}"
        echo -e "${BLUE}📝 Total: $total_tests${NC}"
        
        echo ""
        echo "Detailed Results:"
        cat "$TEST_RESULTS_FILE"
    else
        echo "No test results found"
    fi
    
    echo ""
    echo -e "${BLUE}📄 Logs saved to: $TEST_LOG_FILE${NC}"
    echo -e "${BLUE}📊 Results saved to: $TEST_RESULTS_FILE${NC}"
}

# Validate JSON response structure
validate_json_response() {
    local response="$1"
    local expected_structure="$2"
    
    if ! echo "$response" | jq -e "$expected_structure" > /dev/null 2>&1; then
        echo -e "${RED}❌ Invalid response structure${NC}"
        echo "Expected: $expected_structure"
        echo "Got: $response"
        return 1
    fi
    
    return 0
}

# Check if a service is healthy and responding
check_service_health() {
    local service_id="$1"
    local retries=${2:-3}
    
    for i in $(seq 1 $retries); do
        local health_response=$(call_tool "deployment-health-check" "\"serviceId\": \"$service_id\"")
        
        if validate_success "$health_response" "Health Check" 2>/dev/null; then
            local status=$(extract_value "$health_response" ".result.content[0].data.status")
            if [ "$status" = "SUCCESS" ] || [ "$status" = "RUNNING" ]; then
                return 0
            fi
        fi
        
        if [ $i -lt $retries ]; then
            echo -e "${YELLOW}⏳ Health check attempt $i failed, retrying...${NC}"
            sleep 10
        fi
    done
    
    return 1
}

# Export all functions for use in test scripts
export -f init_test_environment call_tool extract_value validate_success log_test_result
export -f wait_for_deployment generate_random_string cleanup_test_resources display_test_summary
export -f validate_json_response check_service_health