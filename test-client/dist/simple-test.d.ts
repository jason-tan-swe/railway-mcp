#!/usr/bin/env node
/**
 * Simple MCP test using direct subprocess communication
 * This bypasses the MCP SDK client issues and tests the protocol directly
 */
export declare class SimpleMcpTest {
    private serverProcess;
    private messageId;
    /**
     * Start the Railway MCP server
     */
    startServer(railwayToken: string): Promise<boolean>;
    /**
     * Send a JSON-RPC message to the server
     */
    sendMessage(method: string, params?: any): Promise<any>;
    /**
     * Run comprehensive MCP protocol tests
     */
    runTests(railwayToken: string): Promise<void>;
    /**
     * Cleanup server process
     */
    cleanup(): Promise<void>;
}
//# sourceMappingURL=simple-test.d.ts.map