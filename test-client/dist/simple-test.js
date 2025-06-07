#!/usr/bin/env node
import { spawn } from 'child_process';
/**
 * Simple MCP test using direct subprocess communication
 * This bypasses the MCP SDK client issues and tests the protocol directly
 */
export class SimpleMcpTest {
    serverProcess = null;
    messageId = 1;
    /**
     * Start the Railway MCP server
     */
    async startServer(railwayToken) {
        try {
            console.log('🚀 Starting Railway MCP server...');
            this.serverProcess = spawn('node', ['../build/index.js'], {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: { ...process.env, RAILWAY_API_TOKEN: railwayToken }
            });
            if (!this.serverProcess.stdin || !this.serverProcess.stdout || !this.serverProcess.stderr) {
                throw new Error('Failed to create server process streams');
            }
            // Listen for server startup
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Server startup timeout'));
                }, 10000);
                this.serverProcess.stderr.on('data', (data) => {
                    const message = data.toString();
                    console.log('📡 Server:', message.trim());
                    if (message.includes('Railway MCP server running')) {
                        clearTimeout(timeout);
                        resolve(true);
                    }
                });
                this.serverProcess.on('error', (error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
            });
        }
        catch (error) {
            console.error('❌ Failed to start server:', error);
            return false;
        }
    }
    /**
     * Send a JSON-RPC message to the server
     */
    async sendMessage(method, params = {}) {
        if (!this.serverProcess || !this.serverProcess.stdin || !this.serverProcess.stdout) {
            throw new Error('Server not running');
        }
        const message = {
            jsonrpc: "2.0",
            id: this.messageId++,
            method,
            params
        };
        console.log(`📤 Sending: ${method}`);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout waiting for response to ${method}`));
            }, 30000);
            const responseHandler = (data) => {
                const response = data.toString().trim();
                if (response) {
                    clearTimeout(timeout);
                    this.serverProcess.stdout?.removeListener('data', responseHandler);
                    try {
                        const parsed = JSON.parse(response);
                        console.log(`📥 Received response for ${method}`);
                        resolve(parsed);
                    }
                    catch (error) {
                        console.log('📥 Raw response:', response);
                        resolve({ raw: response });
                    }
                }
            };
            this.serverProcess.stdout?.on('data', responseHandler);
            this.serverProcess.stdin?.write(JSON.stringify(message) + '\n');
        });
    }
    /**
     * Run comprehensive MCP protocol tests
     */
    async runTests(railwayToken) {
        console.log('🧪 Starting Simple MCP Protocol Tests');
        console.log('=====================================');
        try {
            // Test 1: Start server
            console.log('\n📡 Test 1: Server Startup');
            const started = await this.startServer(railwayToken);
            if (!started) {
                throw new Error('Server failed to start');
            }
            console.log('✅ Server started successfully');
            // Test 2: Initialize protocol
            console.log('\n🤝 Test 2: Protocol Initialization');
            const initResponse = await this.sendMessage('initialize', {
                protocolVersion: "2024-11-05",
                capabilities: { tools: {} },
                clientInfo: { name: "test-client", version: "1.0.0" }
            });
            console.log('✅ Protocol initialized');
            // Test 3: List tools
            console.log('\n📋 Test 3: Tool Discovery');
            const toolsResponse = await this.sendMessage('tools/list', {});
            if (toolsResponse.result && toolsResponse.result.tools) {
                const toolCount = toolsResponse.result.tools.length;
                console.log(`✅ Found ${toolCount} tools`);
                // Show first few tools
                const firstTools = toolsResponse.result.tools.slice(0, 5).map((t) => t.name);
                console.log(`   📝 Sample tools: ${firstTools.join(', ')}`);
            }
            else {
                console.log('⚠️  Tool listing response format unexpected');
            }
            // Test 4: Call a simple tool
            console.log('\n🛠️  Test 4: Tool Invocation');
            const projectListResponse = await this.sendMessage('tools/call', {
                name: 'project_list',
                arguments: {}
            });
            if (projectListResponse.result) {
                console.log('✅ project_list tool executed successfully');
                if (projectListResponse.result.content && projectListResponse.result.content[0]) {
                    const content = projectListResponse.result.content[0].text;
                    const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
                    console.log(`   📋 Response preview: ${preview}`);
                }
            }
            else {
                console.log('⚠️  Tool call response format unexpected');
                console.log('   📄 Raw response:', JSON.stringify(projectListResponse, null, 2));
            }
            console.log('\n🎉 All tests completed successfully!');
        }
        catch (error) {
            console.error('\n❌ Test failed:', error);
        }
        finally {
            await this.cleanup();
        }
    }
    /**
     * Cleanup server process
     */
    async cleanup() {
        if (this.serverProcess) {
            console.log('\n🧹 Cleaning up server process...');
            this.serverProcess.kill();
            this.serverProcess = null;
        }
    }
}
// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const test = new SimpleMcpTest();
    const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
    if (!token) {
        console.error('❌ Please provide Railway API token via RAILWAY_API_TOKEN environment variable or command line argument');
        process.exit(1);
    }
    test.runTests(token).catch(console.error);
}
//# sourceMappingURL=simple-test.js.map