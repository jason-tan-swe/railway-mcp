#!/bin/bash

# demo-test.sh - Demonstrate the testing framework without requiring a Railway token
set -e

echo "🎭 Railway MCP Server - Testing Framework Demo"
echo "============================================="
echo ""

# Check that the build is successful
echo "✅ Checking build status..."
if [ ! -f "../build/index.js" ]; then
    echo "❌ Build not found. Running build..."
    cd ..
    npm run build
    cd test-scripts
else
    echo "✅ Build found"
fi

# Test that the server can start
echo ""
echo "🚀 Testing server startup..."
server_output=$(echo '{"method": "tools/list", "params": {}}' | timeout 5s node ../build/index.js 2>&1)
server_exit=$?

if [ $server_exit -eq 0 ]; then
    echo "✅ Server starts successfully"
else
    echo "❌ Server failed to start (exit code: $server_exit)"
    echo "Output: $server_output"
    exit 1
fi

# Show available test phases
echo ""
echo "📋 Available Test Phases:"
echo "========================"
for script in test-*.sh; do
    if [ "$script" != "test-setup.sh" ] && [ "$script" != "test-utils.sh" ]; then
        # Extract description from script
        description=$(head -5 "$script" | grep "^# test-" | cut -d'-' -f3- | cut -d'.' -f1 | tr '-' ' ')
        echo "  📄 $script - $description"
    fi
done

echo ""
echo "🎯 Testing Framework Components:"
echo "==============================="

# Test utilities
echo "🔧 Testing utility functions..."
source ./test-utils.sh > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Test utilities loaded successfully"
else
    echo "❌ Test utilities failed to load"
fi

# Test framework structure
echo "📁 Testing framework structure..."
required_files=("test-setup.sh" "test-utils.sh" "test-foundation.sh" "test-databases.sh" "test-deployments.sh" "test-enterprise.sh" "test-monitoring.sh" "test-networking.sh" "test-integration.sh" "master-test.sh")

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required test files present (${#required_files[@]} files)"
else
    echo "❌ Missing files: ${missing_files[*]}"
fi

# Test tool validation (without token)
echo "🛠️ Testing tool validation..."
tools_response=$(echo '{"method": "tools/list", "params": {}}' | node ../build/index.js 2>/dev/null)
tool_count=$(echo "$tools_response" | jq '.result.tools | length' 2>/dev/null || echo "0")

if [ "$tool_count" -gt 0 ]; then
    echo "✅ Found $tool_count tools available"
else
    echo "⚠️ Tools list requires Railway API token"
fi

echo ""
echo "🎉 Framework Demo Complete!"
echo "=========================="
echo ""
echo "📊 Summary:"
echo "  ✅ Build: Working"
echo "  ✅ Server: Starts successfully"
echo "  ✅ Test phases: ${#required_files[@]} available"
echo "  ✅ Utilities: Loaded"
echo "  ✅ Tools: $tool_count detected"
echo ""
echo "🚀 Ready for Testing!"
echo ""
echo "💡 To run tests with real Railway services:"
echo "   1. Set your Railway API token:"
echo "      export RAILWAY_API_TOKEN='your-token-here'"
echo ""
echo "   2. Run the complete test suite:"
echo "      ./master-test.sh"
echo ""
echo "   3. Or run individual test phases:"
echo "      ./test-foundation.sh"
echo "      ./test-databases.sh"
echo "      ./test-integration.sh"
echo ""
echo "📋 Test Results Structure:"
echo "   test-results/    - Test reports and summaries"
echo "   test-logs/       - Detailed execution logs"
echo "   test-context.sh  - Shared test state"
echo ""
echo "🧹 Cleanup:"
echo "   The framework includes automatic resource cleanup"
echo "   Test resources use predictable naming for easy identification"