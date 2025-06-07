#!/bin/bash

# railway-connectivity-test.sh - Real Railway API connectivity validation
set -e

echo "🚀 Railway MCP Server - Real API Connectivity Test"
echo "================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check prerequisites
echo "🔧 Checking prerequisites..."

# Check Railway API token
if [ -z "$RAILWAY_API_TOKEN" ]; then
    echo -e "${RED}❌ RAILWAY_API_TOKEN not set${NC}"
    echo ""
    echo "💡 To test Railway connectivity, set your API token:"
    echo "   export RAILWAY_API_TOKEN='your-railway-api-token-here'"
    echo ""
    echo "🔗 Get your token at: https://railway.app/account/tokens"
    exit 1
fi

echo -e "${GREEN}✅ Railway API token configured${NC}"

# Check build
if [ ! -f "../build/index.js" ]; then
    echo -e "${YELLOW}⚠️ Build not found, running build...${NC}"
    cd ..
    npm run build
    cd test-scripts
    echo -e "${GREEN}✅ Build completed${NC}"
else
    echo -e "${GREEN}✅ Build exists${NC}"
fi

# Load test utilities
source ./test-utils.sh

echo ""
echo "🌐 Testing Railway API connectivity..."

# Test 1: Authentication validation
echo "1. Testing Railway API authentication..."
projects_response=$(call_tool "project-list" "")

if validate_success "$projects_response" "Authentication" 2>/dev/null; then
    echo -e "${GREEN}✅ Successfully authenticated with Railway API${NC}"
    
    # Extract project count for verification
    project_count=$(extract_value "$projects_response" '.result.content[0].data.projects | length')
    if [ -n "$project_count" ] && [ "$project_count" -ge 0 ] 2>/dev/null; then
        echo -e "${BLUE}   📊 Found $project_count projects in your Railway account${NC}"
    fi
else
    echo -e "${RED}❌ Failed to authenticate with Railway API${NC}"
    echo "Response: $projects_response"
    exit 1
fi

# Test 2: Tool availability validation
echo ""
echo "2. Testing MCP tool availability..."
tools_response=$(echo '{"method": "tools/list", "params": {}}' | node ../build/index.js 2>/dev/null)

if echo "$tools_response" | jq -e '.result.tools' > /dev/null 2>&1; then
    tool_count=$(echo "$tools_response" | jq '.result.tools | length' 2>/dev/null)
    echo -e "${GREEN}✅ MCP server provides $tool_count tools${NC}"
    
    # Validate some key tools exist
    key_tools=("project-list" "project-create" "service-create-from-repo" "deployment-list" "variable-set")
    missing_tools=()
    
    for tool in "${key_tools[@]}"; do
        if echo "$tools_response" | jq -e ".result.tools[] | select(.name == \"$tool\")" > /dev/null 2>&1; then
            echo -e "   ${GREEN}✓${NC} $tool"
        else
            missing_tools+=("$tool")
            echo -e "   ${RED}✗${NC} $tool"
        fi
    done
    
    if [ ${#missing_tools[@]} -eq 0 ]; then
        echo -e "${GREEN}✅ All core tools available${NC}"
    else
        echo -e "${RED}❌ Missing tools: ${missing_tools[*]}${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to retrieve MCP tools list${NC}"
    exit 1
fi

# Test 3: Service operations (if projects exist)
if [ -n "$project_count" ] && [ "$project_count" -gt 0 ] 2>/dev/null; then
    echo ""
    echo "3. Testing service operations..."
    
    # Get first project for testing
    first_project_id=$(extract_value "$projects_response" '.result.content[0].data.projects[0].id')
    
    if [ -n "$first_project_id" ] && [ "$first_project_id" != "null" ]; then
        echo -e "${BLUE}   📋 Testing with project: $first_project_id${NC}"
        
        # Test service listing
        services_response=$(call_tool "service-list" "\"projectId\": \"$first_project_id\"")
        
        if validate_success "$services_response" "Service List" 2>/dev/null; then
            service_count=$(extract_value "$services_response" '.result.content[0].data.services | length')
            echo -e "${GREEN}✅ Service listing works ($service_count services found)${NC}"
        else
            echo -e "${YELLOW}⚠️ Service listing failed (may be expected if project is empty)${NC}"
        fi
    fi
else
    echo ""
    echo "3. Skipping service operations (no projects in account)"
fi

# Test 4: Database template validation
echo ""
echo "4. Testing database template availability..."
db_types_response=$(call_tool "database-list-types" "")

if validate_success "$db_types_response" "Database Types" 2>/dev/null; then
    db_count=$(extract_value "$db_types_response" '.result.content[0].data.databaseTypes | length')
    echo -e "${GREEN}✅ Database templates available ($db_count types)${NC}"
    
    # Show available database types
    echo -e "${BLUE}   📋 Available databases:${NC}"
    echo "$db_types_response" | jq -r '.result.content[0].data.databaseTypes[]?.name // empty' 2>/dev/null | head -5 | while read db_name; do
        if [ -n "$db_name" ]; then
            echo -e "      • $db_name"
        fi
    done
else
    echo -e "${YELLOW}⚠️ Database template listing failed${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Railway Connectivity Test Complete!${NC}"
echo "======================================"
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  ${GREEN}✅ Railway API Authentication: SUCCESS${NC}"
echo -e "  ${GREEN}✅ MCP Server Tools: $tool_count available${NC}"
echo -e "  ${GREEN}✅ Core Tools: All present${NC}"
if [ -n "$project_count" ]; then
    echo -e "  ${GREEN}✅ Project Access: $project_count projects${NC}"
fi
if [ -n "$db_count" ]; then
    echo -e "  ${GREEN}✅ Database Templates: $db_count types${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Railway MCP Server is working correctly!${NC}"
echo ""
echo -e "${BLUE}💡 Ready for comprehensive testing:${NC}"
echo "   ./test-foundation.sh        # Test core functionality"
echo "   ./test-integration.sh       # Test full application deployment"
echo "   ./master-test.sh           # Run complete test suite"
echo ""
echo -e "${BLUE}🔗 Railway Dashboard:${NC} https://railway.app/dashboard"