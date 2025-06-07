#!/bin/bash

# test-mcp-direct.sh - Direct MCP server testing with proper JSON-RPC handling
set -e

echo "🧪 Direct MCP Server Testing"
echo "============================"

# Set Railway API token
export RAILWAY_API_TOKEN="6bf8c070-1474-4dd7-bb74-c53748e3151b"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to call MCP server and get response
call_mcp_tool() {
    local tool_name="$1"
    local params="$2"
    
    echo -e "${BLUE}🔧 Testing tool: $tool_name${NC}"
    
    # Create JSON-RPC request
    local request
    if [ -z "$params" ]; then
        request='{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "'$tool_name'", "arguments": {}}}'
    else
        request='{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "'$tool_name'", "arguments": {'$params'}}}'
    fi
    
    echo "Request: $request"
    
    # Start MCP server and send request
    local response
    response=$(echo "$request" | timeout 10s node ../build/index.js 2>/dev/null | head -1)
    
    echo "Response: $response"
    
    # Check if response is valid JSON
    if echo "$response" | jq . >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Valid JSON response${NC}"
        
        # Check for errors
        local error=$(echo "$response" | jq -r '.error // empty')
        if [ -n "$error" ] && [ "$error" != "null" ]; then
            echo -e "${RED}❌ Tool error: $error${NC}"
            return 1
        else
            echo -e "${GREEN}✅ Tool succeeded${NC}"
            return 0
        fi
    else
        echo -e "${RED}❌ Invalid JSON response or no response${NC}"
        return 1
    fi
}

# Test 1: Tools list
echo ""
echo "1. Testing tools/list..."
list_request='{"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}'
echo "Request: $list_request"

list_response=$(echo "$list_request" | timeout 10s node ../build/index.js 2>/dev/null | head -1)
echo "Response: $list_response"

if echo "$list_response" | jq . >/dev/null 2>&1; then
    tool_count=$(echo "$list_response" | jq '.result.tools | length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Tools list succeeded: $tool_count tools available${NC}"
else
    echo -e "${RED}❌ Tools list failed${NC}"
    exit 1
fi

# Test 2: Project list  
echo ""
echo "2. Testing project-list..."
if call_mcp_tool "project-list" ""; then
    echo -e "${GREEN}✅ project-list works${NC}"
else
    echo -e "${RED}❌ project-list failed${NC}"
    exit 1
fi

# Test 3: Database types
echo ""
echo "3. Testing database-list-types..."
if call_mcp_tool "database-list-types" ""; then
    echo -e "${GREEN}✅ database-list-types works${NC}"
else
    echo -e "${RED}❌ database-list-types failed${NC}"
    exit 1
fi

# Test 4: Create a test project
echo ""
echo "4. Testing project creation..."
project_name="mcp-test-$(date +%s)"
if call_mcp_tool "project-create" "\"name\": \"$project_name\""; then
    echo -e "${GREEN}✅ project-create works${NC}"
    echo "Created project: $project_name"
else
    echo -e "${RED}❌ project-create failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Direct MCP testing successful!${NC}"
echo -e "${BLUE}All core tools are working with real Railway API${NC}"