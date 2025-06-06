#!/bin/bash

# Test script for environment management tools

echo "Testing Railway MCP Environment Tools"
echo "===================================="

# Test environment-list
echo -e "\n1. Testing environment-list:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-list","arguments":{"projectId":"YOUR_PROJECT_ID"}},"id":1}' | node build/index.js

# Test environment-create
echo -e "\n2. Testing environment-create:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-create","arguments":{"projectId":"YOUR_PROJECT_ID","name":"test-env","isEphemeral":false}},"id":2}' | node build/index.js

# Test environment-info
echo -e "\n3. Testing environment-info:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-info","arguments":{"environmentId":"YOUR_ENV_ID"}},"id":3}' | node build/index.js

# Test environment-update
echo -e "\n4. Testing environment-update:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-update","arguments":{"environmentId":"YOUR_ENV_ID","name":"test-env-renamed"}},"id":4}' | node build/index.js

# Test environment-clone
echo -e "\n5. Testing environment-clone:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-clone","arguments":{"sourceEnvironmentId":"YOUR_SOURCE_ENV_ID","targetProjectId":"YOUR_PROJECT_ID","newEnvironmentName":"cloned-env","includeVariables":true}},"id":5}' | node build/index.js

# Test environment-deploy
echo -e "\n6. Testing environment-deploy:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-deploy","arguments":{"environmentId":"YOUR_ENV_ID"}},"id":6}' | node build/index.js

# Test environment-delete
echo -e "\n7. Testing environment-delete:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"environment-delete","arguments":{"environmentId":"YOUR_ENV_ID"}},"id":7}' | node build/index.js

echo -e "\nNote: Replace YOUR_PROJECT_ID, YOUR_ENV_ID, and YOUR_SOURCE_ENV_ID with actual IDs before running."