import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
export class RailwayMcpClient {
    client;
    transport = null;
    connected = false;
    constructor() {
        this.client = new Client({
            name: "railway-mcp-test-client",
            version: "1.0.0"
        }, {
            capabilities: {
                tools: {}
            }
        });
    }
    /**
     * Start the Railway MCP server and connect to it
     */
    async connect(railwayToken) {
        const startTime = Date.now();
        try {
            console.log('🚀 Starting Railway MCP server...');
            // Create transport that will spawn the server process
            this.transport = new StdioClientTransport({
                command: 'node',
                args: ['../build/index.js'],
                env: {
                    ...process.env,
                    RAILWAY_API_TOKEN: railwayToken || process.env.RAILWAY_API_TOKEN || ''
                }
            });
            // Connect client to transport
            await this.client.connect(this.transport);
            this.connected = true;
            console.log('✅ Connected to Railway MCP server');
            return {
                success: true,
                message: 'Successfully connected to Railway MCP server',
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to connect to server',
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            };
        }
    }
    /**
     * List all available tools from the server
     */
    async listTools() {
        const startTime = Date.now();
        if (!this.connected) {
            return {
                success: false,
                message: 'Not connected to server',
                duration: Date.now() - startTime
            };
        }
        try {
            console.log('📋 Fetching available tools...');
            const result = await this.client.listTools();
            console.log(`✅ Found ${result.tools.length} tools`);
            return {
                success: true,
                message: `Found ${result.tools.length} tools`,
                data: result.tools,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Failed to list tools',
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            };
        }
    }
    /**
     * Call a specific tool with given arguments
     */
    async callTool(name, arguments_ = {}) {
        const startTime = Date.now();
        if (!this.connected) {
            return {
                success: false,
                message: 'Not connected to server',
                duration: Date.now() - startTime
            };
        }
        try {
            console.log(`🔧 Calling tool: ${name}`);
            const result = await this.client.callTool({
                name,
                arguments: arguments_
            });
            console.log(`✅ Tool ${name} completed successfully`);
            return {
                success: true,
                message: `Tool ${name} executed successfully`,
                data: result,
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                message: `Tool ${name} failed`,
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            };
        }
    }
    /**
     * Disconnect from the server and cleanup
     */
    async disconnect() {
        const startTime = Date.now();
        try {
            if (this.connected && this.client) {
                await this.client.close();
                this.connected = false;
            }
            if (this.transport) {
                await this.transport.close();
                this.transport = null;
            }
            console.log('🔌 Disconnected from server');
            return {
                success: true,
                message: 'Successfully disconnected',
                duration: Date.now() - startTime
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Error during disconnect',
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime
            };
        }
    }
    /**
     * Check if client is connected to server
     */
    isConnected() {
        return this.connected;
    }
}
//# sourceMappingURL=mcp-client.js.map