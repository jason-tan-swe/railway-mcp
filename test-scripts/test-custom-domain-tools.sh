#!/bin/bash

# Test script for custom domain management tools

echo "Testing Railway MCP Custom Domain Tools"
echo "======================================="

# Test custom-domain-list
echo -e "\n1. Testing custom-domain-list:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-list","arguments":{"projectId":"YOUR_PROJECT_ID"}},"id":1}' | node build/index.js

# Test custom-domain-create
echo -e "\n2. Testing custom-domain-create:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-create","arguments":{"projectId":"YOUR_PROJECT_ID","domain":"app.example.com","serviceId":"YOUR_SERVICE_ID"}},"id":2}' | node build/index.js

# Test custom-domain-get
echo -e "\n3. Testing custom-domain-get:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-get","arguments":{"id":"YOUR_CUSTOM_DOMAIN_ID"}},"id":3}' | node build/index.js

# Test custom-domain-status
echo -e "\n4. Testing custom-domain-status:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-status","arguments":{"id":"YOUR_CUSTOM_DOMAIN_ID"}},"id":4}' | node build/index.js

# Test custom-domain-update
echo -e "\n5. Testing custom-domain-update:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-update","arguments":{"id":"YOUR_CUSTOM_DOMAIN_ID","serviceId":"NEW_SERVICE_ID"}},"id":5}' | node build/index.js

# Test custom-domain-delete
echo -e "\n6. Testing custom-domain-delete:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"custom-domain-delete","arguments":{"id":"YOUR_CUSTOM_DOMAIN_ID"}},"id":6}' | node build/index.js

echo -e "\nNote: Replace YOUR_PROJECT_ID, YOUR_SERVICE_ID, and YOUR_CUSTOM_DOMAIN_ID with actual IDs before running."
echo "Custom domains require DNS configuration - check the status tool for CNAME instructions."