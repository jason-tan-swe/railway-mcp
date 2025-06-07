export interface TestResult {
    success: boolean;
    message: string;
    data?: any;
    duration?: number;
    error?: string;
}
export interface Tool {
    name: string;
    description: string;
    inputSchema: any;
}
export declare class RailwayMcpClient {
    private client;
    private transport;
    private connected;
    constructor();
    /**
     * Start the Railway MCP server and connect to it
     */
    connect(railwayToken?: string): Promise<TestResult>;
    /**
     * List all available tools from the server
     */
    listTools(): Promise<TestResult>;
    /**
     * Call a specific tool with given arguments
     */
    callTool(name: string, arguments_?: any): Promise<TestResult>;
    /**
     * Disconnect from the server and cleanup
     */
    disconnect(): Promise<TestResult>;
    /**
     * Check if client is connected to server
     */
    isConnected(): boolean;
}
//# sourceMappingURL=mcp-client.d.ts.map