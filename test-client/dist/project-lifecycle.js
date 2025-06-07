import { RailwayMcpClient } from './mcp-client.js';
export class ProjectLifecycleTests {
    client;
    results = [];
    testData = {};
    constructor() {
        this.client = new RailwayMcpClient();
    }
    /**
     * Run all project lifecycle tests
     */
    async runAll(railwayToken) {
        console.log('🏗️  Starting Project Lifecycle Tests');
        console.log('====================================');
        try {
            // Connect to server
            const connectResult = await this.client.connect(railwayToken);
            if (!connectResult.success) {
                console.error(`❌ Failed to connect: ${connectResult.error}`);
                return [connectResult];
            }
            // Test 1: List existing projects
            await this.testListProjects();
            // Test 2: Create new test project
            await this.testCreateProject();
            // Test 3: Get project details
            await this.testGetProjectInfo();
            // Test 4: List project environments
            await this.testListEnvironments();
            // Test 5: Create new environment
            await this.testCreateEnvironment();
            // Test 6: Update environment
            await this.testUpdateEnvironment();
            // Test 7: Clean up test resources
            await this.testCleanupProject();
        }
        finally {
            // Always disconnect
            await this.client.disconnect();
        }
        // Print summary
        this.printSummary();
        return this.results;
    }
    /**
     * Test listing existing projects
     */
    async testListProjects() {
        console.log('\n📋 Test 1: List Existing Projects');
        console.log('----------------------------------');
        const result = await this.client.callTool('project_list');
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const projectCount = (content.match(/📁/g) || []).length;
                console.log(`   📊 Found ${projectCount} existing projects`);
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test creating a new project
     */
    async testCreateProject() {
        console.log('\n🆕 Test 2: Create New Project');
        console.log('------------------------------');
        const timestamp = Date.now();
        this.testData.projectName = `mcp-test-${timestamp}`;
        const result = await this.client.callTool('project_create', {
            name: this.testData.projectName
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            // Extract project ID from response
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const idMatch = content.match(/ID: ([a-f0-9-]+)/);
                if (idMatch) {
                    this.testData.projectId = idMatch[1];
                    console.log(`   🆔 Project ID: ${this.testData.projectId}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test getting project details
     */
    async testGetProjectInfo() {
        console.log('\n🔍 Test 3: Get Project Information');
        console.log('-----------------------------------');
        if (!this.testData.projectId) {
            const result = {
                success: false,
                message: 'No project ID available from previous test',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('project_info', {
            projectId: this.testData.projectId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const envMatch = content.match(/Environments:\s*([^\n]*)/);
                if (envMatch && envMatch[1] && !envMatch[1].includes('No environments')) {
                    console.log(`   🌍 Project has environments`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test listing project environments
     */
    async testListEnvironments() {
        console.log('\n🌍 Test 4: List Project Environments');
        console.log('------------------------------------');
        if (!this.testData.projectId) {
            const result = {
                success: false,
                message: 'No project ID available',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('environment-list', {
            projectId: this.testData.projectId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const envCount = (content.match(/🌍/g) || []).length;
                console.log(`   📊 Found ${envCount} environments`);
                // Try to extract production environment ID
                const prodMatch = content.match(/🌍 production \(ID: ([a-f0-9-]+)\)/);
                if (prodMatch) {
                    this.testData.environmentId = prodMatch[1];
                    console.log(`   🆔 Production Environment ID: ${this.testData.environmentId}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test creating a new environment
     */
    async testCreateEnvironment() {
        console.log('\n🆕 Test 5: Create New Environment');
        console.log('----------------------------------');
        if (!this.testData.projectId) {
            const result = {
                success: false,
                message: 'No project ID available',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        this.testData.environmentName = 'staging';
        const result = await this.client.callTool('environment-create', {
            projectId: this.testData.projectId,
            name: this.testData.environmentName,
            isEphemeral: false
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🌍 Created staging environment`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
            // Environment might already exist, which is ok
            if (result.error && result.error.includes('already exists')) {
                console.log(`   ℹ️  Staging environment already exists - this is fine`);
            }
        }
    }
    /**
     * Test updating an environment
     */
    async testUpdateEnvironment() {
        console.log('\n✏️  Test 6: Update Environment');
        console.log('------------------------------');
        if (!this.testData.environmentId) {
            const result = {
                success: false,
                message: 'No environment ID available',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('environment-update', {
            environmentId: this.testData.environmentId,
            name: 'production-updated'
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   📝 Updated environment name`);
            // Revert the name change
            await this.client.callTool('environment-update', {
                environmentId: this.testData.environmentId,
                name: 'production'
            });
            console.log(`   🔄 Reverted environment name back to 'production'`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test cleaning up the test project
     */
    async testCleanupProject() {
        console.log('\n🧹 Test 7: Cleanup Test Project');
        console.log('--------------------------------');
        if (!this.testData.projectId) {
            const result = {
                success: false,
                message: 'No project ID to clean up',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('project_delete', {
            projectId: this.testData.projectId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🗑️  Deleted test project: ${this.testData.projectName}`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
            console.log(`   ⚠️  Manual cleanup may be required for project: ${this.testData.projectName}`);
        }
    }
    /**
     * Print test summary
     */
    printSummary() {
        console.log('\n📊 Project Lifecycle Test Summary');
        console.log('==================================');
        const passed = this.results.filter(r => r.success).length;
        const total = this.results.length;
        const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
        console.log(`✅ Passed: ${passed}/${total} tests`);
        console.log(`⏱️  Average duration: ${avgDuration.toFixed(0)}ms`);
        console.log(`📈 Success rate: ${((passed / total) * 100).toFixed(1)}%`);
        if (passed === total) {
            console.log('\n🎉 All project lifecycle tests passed!');
            console.log('   Railway project management is working correctly');
        }
        else {
            console.log('\n❌ Some tests failed. Check the output above for details.');
        }
    }
}
// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tests = new ProjectLifecycleTests();
    const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
    if (!token) {
        console.error('❌ Please provide Railway API token via RAILWAY_API_TOKEN environment variable or command line argument');
        process.exit(1);
    }
    tests.runAll(token).catch(console.error);
}
//# sourceMappingURL=project-lifecycle.js.map