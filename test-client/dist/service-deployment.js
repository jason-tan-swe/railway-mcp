import { RailwayMcpClient } from './mcp-client.js';
export class ServiceDeploymentTests {
    client;
    results = [];
    testData = {};
    constructor() {
        this.client = new RailwayMcpClient();
    }
    /**
     * Run all service deployment tests
     */
    async runAll(railwayToken) {
        console.log('🚀 Starting Service Deployment Tests');
        console.log('===================================');
        try {
            // Connect to server
            const connectResult = await this.client.connect(railwayToken);
            if (!connectResult.success) {
                console.error(`❌ Failed to connect: ${connectResult.error}`);
                return [connectResult];
            }
            // Test 1: Check GitHub repository access
            await this.testGitHubAccess();
            // Test 2: Create test project for service
            await this.testCreateServiceProject();
            // Test 3: Deploy service from GitHub repository
            await this.testDeployFromGitHub();
            // Test 4: Monitor deployment progress
            await this.testMonitorDeployment();
            // Test 5: Verify service is running
            await this.testVerifyServiceRunning();
            // Test 6: Create domain for service
            await this.testCreateDomain();
            // Test 7: Test service management operations
            await this.testServiceOperations();
            // Test 8: Get deployment logs
            await this.testGetDeploymentLogs();
            // Test 9: Clean up service and project
            await this.testCleanupService();
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
     * Test GitHub repository access
     */
    async testGitHubAccess() {
        console.log('\n🐙 Test 1: Check GitHub Repository Access');
        console.log('------------------------------------------');
        // Test with a simple public repository for deployment
        this.testData.repositoryUrl = 'microsoft/vscode-web-playground';
        this.testData.branch = 'main';
        const result = await this.client.callTool('github-repo-check', {
            fullRepoName: this.testData.repositoryUrl
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   📁 Repository: ${this.testData.repositoryUrl}`);
            console.log(`   🌿 Branch: ${this.testData.branch}`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
            // Fallback to a different repository if access fails
            console.log('   🔄 Trying fallback repository...');
            this.testData.repositoryUrl = 'vercel/next.js';
            const fallbackResult = await this.client.callTool('github-repo-check', {
                fullRepoName: this.testData.repositoryUrl
            });
            if (fallbackResult.success) {
                console.log(`   ✅ Fallback repository accessible`);
            }
        }
    }
    /**
     * Test creating a test project for service deployment
     */
    async testCreateServiceProject() {
        console.log('\n🆕 Test 2: Create Service Test Project');
        console.log('--------------------------------------');
        const timestamp = Date.now();
        this.testData.projectName = `service-test-${timestamp}`;
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
                // Get production environment ID
                const envResult = await this.client.callTool('environment-list', {
                    projectId: this.testData.projectId
                });
                if (envResult.success && envResult.data && envResult.data.content) {
                    const envContent = envResult.data.content[0].text;
                    // Look for production environment or any environment
                    const envMatch = envContent.match(/🌍 \w+ \(ID: ([a-f0-9-]+)\)/) ||
                        envContent.match(/ID: ([a-f0-9-]+)/);
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
     * Test deploying service from GitHub repository
     */
    async testDeployFromGitHub() {
        console.log('\n📦 Test 3: Deploy Service from GitHub');
        console.log('------------------------------------');
        if (!this.testData.projectId || !this.testData.repositoryUrl) {
            const result = {
                success: false,
                message: 'Missing project ID or repository URL',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('service_create_from_repo', {
            projectId: this.testData.projectId,
            environmentId: this.testData.environmentId,
            repo: this.testData.repositoryUrl,
            branch: this.testData.branch || 'main',
            serviceName: 'web-app'
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🚀 Service deployment initiated from GitHub`);
            // Extract service ID if available
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const serviceMatch = content.match(/ID: ([a-f0-9-]+)/);
                if (serviceMatch) {
                    this.testData.serviceId = serviceMatch[1];
                    console.log(`   🆔 Service ID: ${this.testData.serviceId}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test monitoring deployment progress
     */
    async testMonitorDeployment() {
        console.log('\n📊 Test 4: Monitor Deployment Progress');
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
        await new Promise(resolve => setTimeout(resolve, 3000));
        // Check for services in the project
        const servicesResult = await this.client.callTool('service_list', {
            projectId: this.testData.projectId
        });
        if (servicesResult.success && servicesResult.data && servicesResult.data.content) {
            const content = servicesResult.data.content[0].text;
            const serviceMatch = content.match(/🚀 ([^(]+) \(ID: ([a-f0-9-]+)\)/);
            if (serviceMatch) {
                this.testData.serviceId = serviceMatch[2];
                console.log(`   🆔 Found Service ID: ${this.testData.serviceId}`);
            }
        }
        if (!this.testData.serviceId || !this.testData.environmentId) {
            const result = {
                success: false,
                message: 'No service ID or environment ID available for monitoring',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('deployment_list', {
            projectId: this.testData.projectId,
            serviceId: this.testData.serviceId,
            environmentId: this.testData.environmentId,
            limit: 3
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const deployments = (content.match(/🚀/g) || []).length;
                console.log(`   📈 Found ${deployments} deployment(s)`);
                // Extract latest deployment ID
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
     * Test verifying service is running
     */
    async testVerifyServiceRunning() {
        console.log('\n✅ Test 5: Verify Service Running');
        console.log('--------------------------------');
        if (!this.testData.projectId || !this.testData.serviceId) {
            const result = {
                success: false,
                message: 'Missing project or service ID',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('service_info', {
            projectId: this.testData.projectId,
            serviceId: this.testData.serviceId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                console.log(`   🔍 Service details retrieved`);
                // Check if service has repository connection
                if (content.includes('github') || content.includes('repo')) {
                    console.log(`   📂 GitHub repository connected`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test creating domain for service
     */
    async testCreateDomain() {
        console.log('\n🌐 Test 6: Create Service Domain');
        console.log('-------------------------------');
        if (!this.testData.environmentId || !this.testData.serviceId) {
            const result = {
                success: false,
                message: 'Missing environment or service ID',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('domain_create', {
            environmentId: this.testData.environmentId,
            serviceId: this.testData.serviceId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const urlMatch = content.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    this.testData.serviceUrl = urlMatch[1];
                    console.log(`   🌐 Service URL: ${this.testData.serviceUrl}`);
                }
                const domainMatch = content.match(/ID: ([a-f0-9-]+)/);
                if (domainMatch) {
                    this.testData.domainId = domainMatch[1];
                    console.log(`   🆔 Domain ID: ${this.testData.domainId}`);
                }
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test service management operations
     */
    async testServiceOperations() {
        console.log('\n⚙️  Test 7: Service Management Operations');
        console.log('---------------------------------------');
        if (!this.testData.projectId || !this.testData.serviceId || !this.testData.environmentId) {
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
            serviceId: this.testData.serviceId,
            environmentId: this.testData.environmentId
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            console.log(`   🔄 Service restart operation completed`);
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test getting deployment logs
     */
    async testGetDeploymentLogs() {
        console.log('\n📋 Test 8: Get Deployment Logs');
        console.log('------------------------------');
        if (!this.testData.deploymentId) {
            const result = {
                success: false,
                message: 'No deployment ID available',
                duration: 0
            };
            this.results.push(result);
            console.log(`❌ ${result.message}`);
            return;
        }
        const result = await this.client.callTool('deployment_logs', {
            deploymentId: this.testData.deploymentId,
            limit: 50
        });
        this.results.push(result);
        if (result.success) {
            console.log(`✅ ${result.message} (${result.duration}ms)`);
            if (result.data && result.data.content && result.data.content[0]) {
                const content = result.data.content[0].text;
                const logLines = content.split('\n').length;
                console.log(`   📊 Retrieved ${logLines} log lines`);
            }
        }
        else {
            console.log(`❌ ${result.message}: ${result.error}`);
        }
    }
    /**
     * Test cleaning up service and project
     */
    async testCleanupService() {
        console.log('\n🧹 Test 9: Cleanup Service Project');
        console.log('----------------------------------');
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
            console.log(`   🗑️  Deleted service test project: ${this.testData.projectName}`);
            if (this.testData.serviceUrl) {
                console.log(`   🌐 Service was accessible at: ${this.testData.serviceUrl}`);
            }
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
        console.log('\n📊 Service Deployment Test Summary');
        console.log('==================================');
        const passed = this.results.filter(r => r.success).length;
        const total = this.results.length;
        const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;
        console.log(`✅ Passed: ${passed}/${total} tests`);
        console.log(`⏱️  Average duration: ${avgDuration.toFixed(0)}ms`);
        console.log(`📈 Success rate: ${((passed / total) * 100).toFixed(1)}%`);
        if (passed === total) {
            console.log('\n🎉 All service deployment tests passed!');
            console.log('   GitHub service deployment via MCP is working correctly');
        }
        else {
            console.log('\n❌ Some tests failed. Check the output above for details.');
        }
        if (this.testData.serviceUrl) {
            console.log(`\n🌐 Service URL: ${this.testData.serviceUrl}`);
        }
    }
}
// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const tests = new ServiceDeploymentTests();
    const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
    if (!token) {
        console.error('❌ Please provide Railway API token via RAILWAY_API_TOKEN environment variable or command line argument');
        process.exit(1);
    }
    tests.runAll(token).catch(console.error);
}
//# sourceMappingURL=service-deployment.js.map