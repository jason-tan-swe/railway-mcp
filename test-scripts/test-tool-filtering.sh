#!/bin/bash

# Test script for tool filtering feature
# Tests various filtering scenarios with the Railway MCP server

set -e

echo "🧪 Testing Railway MCP Tool Filtering Feature"
echo "=============================================="

# Test configuration
MCP_SERVER_PATH="../build/index.js"
TEST_TOKEN="${RAILWAY_API_TOKEN:-dummy_token_for_testing}"

# Helper function to test tool filtering
test_tool_filter() {
    local filter_name="$1"
    local filter_value="$2"
    local expected_behavior="$3"
    
    echo "🔍 Testing: $filter_name"
    echo "   Filter: $filter_value"
    echo "   Expected: $expected_behavior"
    
    # Set the filter and run the server to list tools
    export RAILWAY_TOOLS_FILTER="$filter_value"
    
    # Get tool list from MCP server
    local tool_count=$(echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
        RAILWAY_API_TOKEN="$TEST_TOKEN" node "$MCP_SERVER_PATH" 2>/dev/null | \
        jq -r '.result.tools | length' 2>/dev/null || echo "0")
    
    # Get server logs for filtering info
    local server_logs=$(echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
        RAILWAY_API_TOKEN="$TEST_TOKEN" node "$MCP_SERVER_PATH" 2>&1 >/dev/null | \
        grep -E "(Tool filtering|Registering)" || echo "No filtering logs")
    
    echo "   Result: $tool_count tools registered"
    echo "   Logs: $server_logs"
    echo ""
    
    # Return tool count for validation
    echo "$tool_count"
}

# Helper function to validate tool presence
test_specific_tool() {
    local filter_value="$1"
    local tool_name="$2"
    local should_exist="$3"
    
    export RAILWAY_TOOLS_FILTER="$filter_value"
    
    # Check if specific tool exists
    local tool_exists=$(echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | \
        RAILWAY_API_TOKEN="$TEST_TOKEN" node "$MCP_SERVER_PATH" 2>/dev/null | \
        jq -r --arg tool "$tool_name" '.result.tools[] | select(.name == $tool) | .name' 2>/dev/null || echo "")
    
    if [ "$should_exist" = "true" ]; then
        if [ "$tool_exists" = "$tool_name" ]; then
            echo "✅ Tool '$tool_name' correctly present with filter '$filter_value'"
        else
            echo "❌ Tool '$tool_name' missing with filter '$filter_value'"
            return 1
        fi
    else
        if [ "$tool_exists" = "$tool_name" ]; then
            echo "❌ Tool '$tool_name' unexpectedly present with filter '$filter_value'"
            return 1
        else
            echo "✅ Tool '$tool_name' correctly absent with filter '$filter_value'"
        fi
    fi
}

# Test 1: No filtering (all tools)
echo "📋 Test 1: No Filtering"
unset RAILWAY_TOOLS_FILTER
all_tools=$(test_tool_filter "No Filter" "" "All tools should be available")

# Test 2: Simple category
echo "📋 Test 2: Simple Category"
simple_tools=$(test_tool_filter "Simple Category" "simple" "Only simple tools should be available")

# Test 3: Intermediate category  
echo "📋 Test 3: Intermediate Category"
intermediate_tools=$(test_tool_filter "Intermediate Category" "intermediate" "Simple + intermediate tools should be available")

# Test 4: Pro category
echo "📋 Test 4: Pro Category"
pro_tools=$(test_tool_filter "Pro Category" "pro" "All tools should be available")

# Test 5: Multiple categories
echo "📋 Test 5: Multiple Categories"
multi_tools=$(test_tool_filter "Multiple Categories" "simple,deployment" "Simple tools + deployment tools should be available")

# Test 6: Specific tools
echo "📋 Test 6: Specific Tools"
specific_tools=$(test_tool_filter "Specific Tools" "project_list,service_info" "Only specified tools should be available")

# Test 7: Mixed categories and tools
echo "📋 Test 7: Mixed Categories and Tools"
mixed_tools=$(test_tool_filter "Mixed" "simple,project_delete" "Simple tools + project_delete should be available")

# Test 8: Invalid filter
echo "📋 Test 8: Invalid Filter"
invalid_tools=$(test_tool_filter "Invalid Filter" "nonexistent_category,fake_tool" "Should fallback to all tools")

# Test 9: Use case categories
echo "📋 Test 9: Use Case Categories"
core_tools=$(test_tool_filter "Core Use Case" "core" "Core project/service management tools should be available")

# Validation Tests
echo "🎯 Validation Tests"
echo "==================="

# Test specific tool presence/absence
test_specific_tool "simple" "project_list" "true"
test_specific_tool "simple" "project_delete_batch" "false"
test_specific_tool "intermediate" "project_create" "true"
test_specific_tool "pro" "project_delete_batch" "true"
test_specific_tool "project_list,service_info" "project_list" "true"
test_specific_tool "project_list,service_info" "project_create" "false"

# Test filter validation tools
echo "🔧 Testing Filter Validation Tools"
echo "=================================="

test_validation_tool() {
    local tool_name="$1"
    local args="$2"
    
    export RAILWAY_TOOLS_FILTER=""  # Reset to test validation tools
    
    echo "Testing $tool_name..."
    local result=$(echo "{\"jsonrpc\":\"2.0\",\"method\":\"tools/call\",\"params\":{\"name\":\"$tool_name\",\"arguments\":$args},\"id\":1}" | \
        RAILWAY_API_TOKEN="$TEST_TOKEN" node "$MCP_SERVER_PATH" 2>/dev/null | \
        jq -r '.result.content[0].text' 2>/dev/null || echo "Error")
    
    if [[ "$result" == *"Error"* ]]; then
        echo "❌ $tool_name failed"
        return 1
    else
        echo "✅ $tool_name succeeded"
        echo "   Preview: ${result:0:100}..."
    fi
}

# Test validation tools
test_validation_tool "tool_filter_examples" "{}"
test_validation_tool "tool_filter_categories" "{}"
test_validation_tool "tool_filter_current" "{}"
test_validation_tool "tool_filter_validate" "{\"filter\":\"simple,deployment\"}"
test_validation_tool "tool_filter_validate" "{\"filter\":\"invalid_filter\"}"

# Summary
echo ""
echo "📊 Test Summary"
echo "==============="
echo "No filter: $all_tools tools"
echo "Simple: $simple_tools tools"
echo "Intermediate: $intermediate_tools tools"
echo "Pro: $pro_tools tools"
echo "Multiple categories: $multi_tools tools"
echo "Specific tools: $specific_tools tools"
echo "Mixed: $mixed_tools tools"
echo "Invalid filter: $invalid_tools tools"
echo "Core use case: $core_tools tools"

# Validate expected ranges
if [ "$simple_tools" -lt 20 ] || [ "$simple_tools" -gt 50 ]; then
    echo "⚠️  Warning: Simple tools count ($simple_tools) outside expected range (20-50)"
fi

if [ "$intermediate_tools" -le "$simple_tools" ]; then
    echo "⚠️  Warning: Intermediate tools ($intermediate_tools) should be more than simple ($simple_tools)"
fi

if [ "$pro_tools" -ne "$all_tools" ]; then
    echo "⚠️  Warning: Pro tools ($pro_tools) should equal all tools ($all_tools)"
fi

if [ "$specific_tools" -ne 2 ]; then
    echo "⚠️  Warning: Specific tools test should have exactly 2 tools, got $specific_tools"
fi

echo ""
echo "✅ Tool filtering tests completed!"
echo "   Run with different RAILWAY_API_TOKEN values to test with real Railway API"