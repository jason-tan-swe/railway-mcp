import { TestResult } from './mcp-client.js';
export interface ServiceTestData {
    projectId?: string;
    projectName?: string;
    environmentId?: string;
    serviceId?: string;
    deploymentId?: string;
    domainId?: string;
    serviceUrl?: string;
    repositoryUrl?: string;
    branch?: string;
}
export declare class ServiceDeploymentTests {
    private client;
    private results;
    private testData;
    constructor();
    /**
     * Run all service deployment tests
     */
    runAll(railwayToken?: string): Promise<TestResult[]>;
    /**
     * Test GitHub repository access
     */
    private testGitHubAccess;
    /**
     * Test creating a test project for service deployment
     */
    private testCreateServiceProject;
    /**
     * Test deploying service from GitHub repository
     */
    private testDeployFromGitHub;
    /**
     * Test monitoring deployment progress
     */
    private testMonitorDeployment;
    /**
     * Test verifying service is running
     */
    private testVerifyServiceRunning;
    /**
     * Test creating domain for service
     */
    private testCreateDomain;
    /**
     * Test service management operations
     */
    private testServiceOperations;
    /**
     * Test getting deployment logs
     */
    private testGetDeploymentLogs;
    /**
     * Test cleaning up service and project
     */
    private testCleanupService;
    /**
     * Print test summary
     */
    private printSummary;
}
//# sourceMappingURL=service-deployment.d.ts.map