import { TestResult } from './mcp-client.js';
export declare class BasicConnectivityTests {
    private client;
    private results;
    constructor();
    /**
     * Run all basic connectivity tests
     */
    runAll(railwayToken?: string): Promise<TestResult[]>;
    /**
     * Test server connection and initialization
     */
    private testServerConnection;
    /**
     * Test tool discovery and listing
     */
    private testToolDiscovery;
    /**
     * Test simple tool invocation (project_list)
     */
    private testSimpleToolInvocation;
    /**
     * Test tool schema validation with invalid parameters
     */
    private testToolSchemaValidation;
    /**
     * Print test summary
     */
    private printSummary;
}
//# sourceMappingURL=basic-connectivity.d.ts.map