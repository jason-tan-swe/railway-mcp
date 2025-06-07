import { TestResult } from './mcp-client.js';
export interface ProjectTestData {
    projectId?: string;
    projectName?: string;
    environmentId?: string;
    environmentName?: string;
}
export declare class ProjectLifecycleTests {
    private client;
    private results;
    private testData;
    constructor();
    /**
     * Run all project lifecycle tests
     */
    runAll(railwayToken?: string): Promise<TestResult[]>;
    /**
     * Test listing existing projects
     */
    private testListProjects;
    /**
     * Test creating a new project
     */
    private testCreateProject;
    /**
     * Test getting project details
     */
    private testGetProjectInfo;
    /**
     * Test listing project environments
     */
    private testListEnvironments;
    /**
     * Test creating a new environment
     */
    private testCreateEnvironment;
    /**
     * Test updating an environment
     */
    private testUpdateEnvironment;
    /**
     * Test cleaning up the test project
     */
    private testCleanupProject;
    /**
     * Print test summary
     */
    private printSummary;
}
//# sourceMappingURL=project-lifecycle.d.ts.map