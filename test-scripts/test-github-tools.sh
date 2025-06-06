#!/bin/bash

# Test script for GitHub integration tools

echo "Testing Railway MCP GitHub Integration Tools"
echo "============================================"

# Test github-repo-check
echo -e "\n1. Testing github-repo-check:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-repo-check","arguments":{"fullRepoName":"octocat/Hello-World"}},"id":1}' | node build/index.js

# Test github-repo-list
echo -e "\n2. Testing github-repo-list:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-repo-list","arguments":{}},"id":2}' | node build/index.js

# Test github-repo-get
echo -e "\n3. Testing github-repo-get:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-repo-get","arguments":{"fullRepoName":"YOUR_GITHUB_USERNAME/YOUR_REPO"}},"id":3}' | node build/index.js

# Test github-branch-list
echo -e "\n4. Testing github-branch-list:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-branch-list","arguments":{"fullRepoName":"YOUR_GITHUB_USERNAME/YOUR_REPO"}},"id":4}' | node build/index.js

# Test github-repo-deploy
echo -e "\n5. Testing github-repo-deploy:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-repo-deploy","arguments":{"projectId":"YOUR_PROJECT_ID","fullRepoName":"YOUR_GITHUB_USERNAME/YOUR_REPO","branch":"main"}},"id":5}' | node build/index.js

# Test github-repo-link
echo -e "\n6. Testing github-repo-link:"
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"github-repo-link","arguments":{"serviceId":"YOUR_SERVICE_ID","fullRepoName":"YOUR_GITHUB_USERNAME/YOUR_REPO","branch":"main"}},"id":6}' | node build/index.js

echo -e "\nNote: Replace YOUR_GITHUB_USERNAME, YOUR_REPO, YOUR_PROJECT_ID, and YOUR_SERVICE_ID with actual values."
echo "GitHub integration requires Railway to have access to your repositories."