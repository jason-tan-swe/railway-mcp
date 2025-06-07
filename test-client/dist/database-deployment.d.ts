import { TestResult } from './mcp-client.js';
export interface DatabaseTestData {
    projectId?: string;
    projectName?: string;
    environmentId?: string;
    databaseServiceId?: string;
    databaseConnectionDetails?: any;
    deploymentId?: string;
}
export declare class DatabaseDeploymentTests {
    private client;
    private results;
    private testData;
    constructor();
    /**
     * Run all database deployment tests
     */
    runAll(railwayToken?: string): Promise<TestResult[]>;
    /**
     * Test listing available database types
     */
    private testListDatabaseTypes;
    /**
     * Test creating a test project for database deployment
     */
    private testCreateTestProject;
    /**
     * Test deploying PostgreSQL database
     */
    private testDeployPostgreSQL;
    /**
     * Test verifying database deployment status
     */
    private testVerifyDatabaseDeployment;
    /**
     * Test getting database connection details
     */
    private testGetDatabaseConnection;
    /**
     * Test monitoring deployment status
     */
    private testMonitorDeployment;
    /**
     * Test database service operations (restart, etc.)
     */
    private testDatabaseServiceOps;
    /**
     * Test cleaning up database and project
     */
    private testCleanupDatabase;
    /**
     * Print test summary
     */
    private printSummary;
}
//# sourceMappingURL=database-deployment.d.ts.map