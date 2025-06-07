#!/bin/bash

# Test script for logs and monitoring tools

echo "Testing Railway MCP Logs and Monitoring Tools"
echo "============================================="

# Test logs-build
echo -e "\n1. Testing logs-build (build logs):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"logs-build","arguments":{"deploymentId":"YOUR_DEPLOYMENT_ID","limit":50}},"id":1}' | node build/index.js

# Test logs-deployment
echo -e "\n2. Testing logs-deployment (runtime logs):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"logs-deployment","arguments":{"deploymentId":"YOUR_DEPLOYMENT_ID","limit":50}},"id":2}' | node build/index.js

# Test logs-environment
echo -e "\n3. Testing logs-environment (all environment logs):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"logs-environment","arguments":{"environmentId":"YOUR_ENV_ID","limit":50}},"id":3}' | node build/index.js

# Test logs-http
echo -e "\n4. Testing logs-http (HTTP request logs):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"logs-http","arguments":{"deploymentId":"YOUR_DEPLOYMENT_ID","limit":50}},"id":4}' | node build/index.js

# Test metrics-get
echo -e "\n5. Testing metrics-get (resource metrics):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"metrics-get","arguments":{"startDate":"2024-01-01T00:00:00Z","measurements":["CPU_USAGE","MEMORY_USAGE"],"groupBy":["SERVICE_ID"],"serviceId":"YOUR_SERVICE_ID"}},"id":5}' | node build/index.js

# Test logs-plugin
echo -e "\n6. Testing logs-plugin (database logs):"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"logs-plugin","arguments":{"pluginId":"YOUR_PLUGIN_ID","environmentId":"YOUR_ENV_ID","limit":50}},"id":6}' | node build/index.js

echo -e "\nNote: Replace YOUR_DEPLOYMENT_ID, YOUR_ENV_ID, YOUR_SERVICE_ID, and YOUR_PLUGIN_ID with actual IDs before running."
echo "For dates, use ISO 8601 format (e.g., 2024-01-01T00:00:00Z)"