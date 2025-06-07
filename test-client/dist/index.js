#!/usr/bin/env node
import { BasicConnectivityTests } from './basic-connectivity.js';
import { ProjectLifecycleTests } from './project-lifecycle.js';
import { DatabaseDeploymentTests } from './database-deployment.js';
import { ServiceDeploymentTests } from './service-deployment.js';
/**
 * Main test runner for Railway MCP Server validation
 */
async function main() {
    console.log('🚀 Railway MCP Server Test Suite');
    console.log('=================================');
    const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
    if (!token) {
        console.error('❌ Railway API token required!');
        console.error('   Set RAILWAY_API_TOKEN environment variable or pass as argument');
        console.error('   Example: npm run test <your-token>');
        process.exit(1);
    }
    try {
        // Phase 1: Basic Connectivity Tests
        console.log('\n🔗 Phase 1: Basic Connectivity Tests');
        const basicTests = new BasicConnectivityTests();
        const basicResults = await basicTests.runAll(token);
        const basicPassed = basicResults.filter(r => r.success).length;
        const basicTotal = basicResults.length;
        if (basicPassed < basicTotal) {
            console.error(`\n❌ Basic connectivity tests failed (${basicPassed}/${basicTotal})`);
            console.error('   Cannot proceed with advanced tests until basic connectivity is working');
            process.exit(1);
        }
        console.log(`\n✅ Basic connectivity tests passed (${basicPassed}/${basicTotal})`);
        // Phase 2: Project Lifecycle Tests
        console.log('\n🏗️  Phase 2: Project Lifecycle Tests');
        const projectTests = new ProjectLifecycleTests();
        const projectResults = await projectTests.runAll(token);
        const projectPassed = projectResults.filter(r => r.success).length;
        const projectTotal = projectResults.length;
        if (projectPassed < projectTotal) {
            console.error(`\n❌ Project lifecycle tests failed (${projectPassed}/${projectTotal})`);
            console.error('   Some project management features may not be working correctly');
        }
        else {
            console.log(`\n✅ Project lifecycle tests passed (${projectPassed}/${projectTotal})`);
        }
        // Phase 3: Database Deployment Tests
        console.log('\n🗄️  Phase 3: Database Deployment Tests');
        const databaseTests = new DatabaseDeploymentTests();
        const databaseResults = await databaseTests.runAll(token);
        const databasePassed = databaseResults.filter(r => r.success).length;
        const databaseTotal = databaseResults.length;
        if (databasePassed < databaseTotal) {
            console.error(`\n❌ Database deployment tests failed (${databasePassed}/${databaseTotal})`);
            console.error('   Some database deployment features may not be working correctly');
        }
        else {
            console.log(`\n✅ Database deployment tests passed (${databasePassed}/${databaseTotal})`);
        }
        // Phase 4: Service Deployment Tests
        console.log('\n🚀 Phase 4: Service Deployment Tests');
        const serviceTests = new ServiceDeploymentTests();
        const serviceResults = await serviceTests.runAll(token);
        const servicePassed = serviceResults.filter(r => r.success).length;
        const serviceTotal = serviceResults.length;
        if (servicePassed < serviceTotal) {
            console.error(`\n❌ Service deployment tests failed (${servicePassed}/${serviceTotal})`);
            console.error('   Some service deployment features may not be working correctly');
        }
        else {
            console.log(`\n✅ Service deployment tests passed (${servicePassed}/${serviceTotal})`);
        }
        // Overall summary
        const totalPassed = basicPassed + projectPassed + databasePassed + servicePassed;
        const totalTests = basicTotal + projectTotal + databaseTotal + serviceTotal;
        console.log(`\n🎯 Overall Test Results`);
        console.log(`========================`);
        console.log(`✅ Total Passed: ${totalPassed}/${totalTests} tests`);
        console.log(`📈 Overall Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
        if (totalPassed === totalTests) {
            console.log(`\n🎉 All tests passed! Railway MCP Server is working perfectly!`);
        }
        else {
            console.log(`\n⚠️  ${totalTests - totalPassed} tests failed. Check output above for details.`);
        }
        // TODO: Add more test phases here
        // - Phase 5: Advanced Workflow Tests
        // - Phase 6: Error Scenario Tests
    }
    catch (error) {
        console.error('\n💥 Test suite failed with error:', error);
        process.exit(1);
    }
}
main().catch(console.error);
//# sourceMappingURL=index.js.map