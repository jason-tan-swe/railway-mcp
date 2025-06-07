import { RailwayMcpClient } from './mcp-client.js';
export class DatabaseDeploymentTests {
    client;
    results = [];
    testData = {};
    constructor() {
        this.client = new RailwayMcpClient();
    }
    /**
     * Run all database deployment tests
     */
    async runAll(railwayToken) {
        console.log('🗄️  Starting Database Deployment Tests');
        console.log('======================================');
        try {
            // Connect to server
            const connectResult = await this.client.connect(railwayToken);
            if (!connectResult.success) {
                console.error(`❌ Failed to connect: ${connectResult.error}`);
                return [connectResult];
            }
            // Test 1: List available database types
            await this.testListDatabaseTypes();
            // Test 2: Create test project for database
            await this.testCreateTestProject();
            // Test 3: Deploy PostgreSQL database
            await this.testDeployPostgreSQL();
            // Test 4: Verify database deployment
            await this.testVerifyDatabaseDeployment();
            // Test 5: Get database connection details
            await this.testGetDatabaseConnection();
            // Test 6: Monitor deployment status
            await this.testMonitorDeployment();
            // Test 7: Test database service management
            await this.testDatabaseServiceOps();
            // Test 8: Clean up test resources
            await this.testCleanupDatabase();
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
     * Test listing available database types
     */
    async testListDatabaseTypes() {
        console.log('\n📋 Test 1: List Available Database Types');
        console.log('----------------------------------------');
        const result = await this.client.callTool('database_list_types');
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const dbTypes = ['postgresql', 'mysql', 'redis', 'mongodb'];
                const foundTypes = dbTypes.filter(type => content.toLowerCase().includes(type));
                console.log(`   📊 Supported database types: ${foundTypes.join(', ')}`);
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test creating a test project for database deployment
     */
    async testCreateTestProject() {
        console.log('\n🆕 Test 2: Create Test Project');
        console.log('-------------------------------');
        const timestamp = Date.now();
        this.testData.projectName = `db-test-${timestamp}`;
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
                // Get environment ID (production environment should be created automatically)
                const envResult = await this.client.callTool('environment-list', {
                    projectId: this.testData.projectId
                });
                if (envResult.success && envResult.data && envResult.data.content) {
                    const envContent = envResult.data.content[0].text;
                    const envMatch = envContent.match(/🌍 production \(ID: ([a-f0-9-]+)\)/);
                    if (envMatch) {
                        this.testData.environmentId = envMatch[1];
                        console.log(`   🌍 Environment ID: ${this.testData.environmentId}`);
                    }
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test deploying PostgreSQL database
     */
    async testDeployPostgreSQL() {
        console.log('\n🐘 Test 3: Deploy PostgreSQL Database');
        console.log('------------------------------------');
        if (!this.testData.projectId || !this.testData.environmentId) {
            const result = {
                success: false,
                message: 'Missing project or environment ID from previous test',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('database_deploy_from_template', {
            projectId: this.testData.projectId,
            type: 'postgresql',
            region: 'us-west1',
            environmentId: this.testData.environmentId,
            name: 'test-postgres'
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🗄️  PostgreSQL database deployment initiated`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test verifying database deployment status
     */
    async testVerifyDatabaseDeployment() {
        console.log('\n🔍 Test 4: Verify Database Deployment');
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
        // Wait a moment for deployment to start
        console.log('   ⏳ Waiting for deployment to initialize...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        const result = await this.client.callTool('service_list', {
            projectId: this.testData.projectId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const serviceMatch = content.match(/🚀 ([^(]+) \(ID: ([a-f0-9-]+)\)/);
                if (serviceMatch) {
                    this.testData.databaseServiceId = serviceMatch[2];
                    console.log(`   🆔 Database Service ID: ${this.testData.databaseServiceId}`);
                    console.log(`   📊 Service Name: ${serviceMatch[1].trim()}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test getting database connection details
     */
    async testGetDatabaseConnection() {
        console.log('\n🔗 Test 5: Get Database Connection Details');
        console.log('------------------------------------------');
        if (!this.testData.databaseServiceId || !this.testData.projectId) {
            const result = {
                success: false,
                message: 'No database service ID available',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('service_info', {
            projectId: this.testData.projectId,
            serviceId: this.testData.databaseServiceId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                if (content.includes('postgres') || content.includes('PostgreSQL')) {
                    console.log(`   🗄️  PostgreSQL service details retrieved`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test monitoring deployment status
     */
    async testMonitorDeployment() {
        console.log('\n📊 Test 6: Monitor Deployment Status');
        console.log('-----------------------------------');
        if (!this.testData.projectId || !this.testData.databaseServiceId || !this.testData.environmentId) {
            const result = {
                success: false,
                message: 'Missing required IDs for deployment monitoring',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('deployment_list', {
            projectId: this.testData.projectId,
            serviceId: this.testData.databaseServiceId,
            environmentId: this.testData.environmentId,
            limit: 5
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const deployments = (content.match(/🚀/g) || []).length;
                console.log(`   📈 Found ${deployments} deployment(s)`);
                // Try to extract deployment ID
                const deployMatch = content.match(/ID: ([a-f0-9-]+)/);
                if (deployMatch) {
                    this.testData.deploymentId = deployMatch[1];
                    console.log(`   🆔 Latest Deployment ID: ${this.testData.deploymentId}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test database service operations (restart, etc.)
     */
    async testDatabaseServiceOps() {
        console.log('\n⚙️  Test 7: Database Service Operations');
        console.log('-------------------------------------');
        if (!this.testData.projectId || !this.testData.databaseServiceId || !this.testData.environmentId) {
            const result = {
                success: false,
                message: 'Missing required IDs for service operations',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        // Test service restart
        const result = await this.client.callTool('service_restart', {
            projectId: this.testData.projectId,
            serviceId: this.testData.databaseServiceId,
            environmentId: this.testData.environmentId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🔄 Database service restart initiated`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test cleaning up database and project
     */
    async testCleanupDatabase() {
        console.log('\n🧹 Test 8: Cleanup Database Project');
        console.log('-----------------------------------');
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
            console.log(`   🗑️  Deleted database test project: ${this.testData.projectName}`);
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
        console.log('\n📊 Database Deployment Test Summary');
        console.log('===================================');
        const passed = this.results.filter(r => r.success).length;
        const total = this.results.length;
        const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
        console.log(`✅ Passed: ${passed}/${total} tests`);
        console.log(`⏱️  Average duration: ${avgDuration.toFixed(0)}ms`);
        console.log(`📈 Success rate: ${((passed / total) * 100).toFixed(1)}%`);
        if (passed === total) {
            console.log('\n🎉 All database deployment tests passed!');
            console.log('   PostgreSQL deployment via MCP is working correctly');
        }
        else {
            console.log('\n❌ Some tests failed. Check the output above for details.');
        }
    }
}
// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tests = new DatabaseDeploymentTests();
    const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
    if (!token) {
        console.error('❌ Please provide Railway API token via RAILWAY_API_TOKEN environment variable or command line argument');
        process.exit(1);
    }
    tests.runAll(token).catch(console.error);
}
//# sourceMappingURL=database-deployment.js.map