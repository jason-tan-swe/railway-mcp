import { RailwayMcpClient, TestResult } from './mcp-client.js';

export class BasicConnectivityTests {
  private client: RailwayMcpClient;
  private results: TestResult[] = [];

  constructor() {
    this.client = new RailwayMcpClient();
  }

  /**
   * Run all basic connectivity tests
   */
  async runAll(railwayToken?: string): Promise<TestResult[]> {
    console.log('🧪 Starting Basic Connectivity Tests');
    console.log('=====================================');

    // Test 1: Server Connection
    await this.testServerConnection(railwayToken);

    // Test 2: Tool Discovery
    await this.testToolDiscovery();

    // Test 3: Simple Tool Invocation
    await this.testSimpleToolInvocation();

    // Test 4: Tool Schema Validation
    await this.testToolSchemaValidation();

    // Cleanup
    await this.client.disconnect();

    // Print summary
    this.printSummary();

    return this.results;
  }

  /**
   * Test server connection and initialization
   */
  private async testServerConnection(railwayToken?: string): Promise<void> {
    console.log('\n📡 Test 1: Server Connection');
    console.log('-----------------------------');

    const result = await this.client.connect(railwayToken);
    this.results.push(result);

    if (result.success) {
      console.log(`✅ ${result.message} (${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.message}: ${result.error}`);
    }
  }

  /**
   * Test tool discovery and listing
   */
  private async testToolDiscovery(): Promise<void> {
    console.log('\n🔍 Test 2: Tool Discovery');
    console.log('--------------------------');

    const result = await this.client.listTools();
    this.results.push(result);

    if (result.success && result.data) {
      console.log(`✅ ${result.message} (${result.duration}ms)`);
      
      // Validate we have expected core tools
      const tools = result.data;
      const coreTools = ['project_list', 'project_create', 'project_delete', 'service_list', 'database_deploy_from_template'];
      const foundCoreTools = coreTools.filter(tool => 
        tools.some((t: any) => t.name === tool)
      );

      console.log(`   📋 Core tools found: ${foundCoreTools.length}/${coreTools.length}`);
      console.log(`   📊 Total tools available: ${tools.length}`);

      if (foundCoreTools.length < coreTools.length) {
        const missing = coreTools.filter(tool => !foundCoreTools.includes(tool));
        console.log(`   ⚠️  Missing core tools: ${missing.join(', ')}`);
      }
    } else {
      console.log(`❌ ${result.message}: ${result.error}`);
    }
  }

  /**
   * Test simple tool invocation (project_list)
   */
  private async testSimpleToolInvocation(): Promise<void> {
    console.log('\n🛠️  Test 3: Simple Tool Invocation');
    console.log('----------------------------------');

    const result = await this.client.callTool('project_list');
    this.results.push(result);

    if (result.success) {
      console.log(`✅ ${result.message} (${result.duration}ms)`);
      
      if (result.data && result.data.content) {
        const content = result.data.content[0];
        if (content && content.text) {
          const lines = content.text.split('\n').slice(0, 3);
          console.log(`   📋 Response preview: ${lines.join(' | ')}`);
        }
      }
    } else {
      console.log(`❌ ${result.message}: ${result.error}`);
    }
  }

  /**
   * Test tool schema validation with invalid parameters
   */
  private async testToolSchemaValidation(): Promise<void> {
    console.log('\n🔬 Test 4: Tool Schema Validation');
    console.log('----------------------------------');

    // Test with invalid parameters to verify schema validation
    const result = await this.client.callTool('project_info', { invalidParam: 'test' });
    this.results.push({
      success: !result.success, // We expect this to fail
      message: result.success ? 'Schema validation failed (should have rejected invalid params)' : 'Schema validation working (correctly rejected invalid params)',
      duration: result.duration,
      error: result.error
    });

    if (!result.success) {
      console.log(`✅ Schema validation working correctly (${result.duration}ms)`);
      console.log(`   🚫 Correctly rejected invalid parameters`);
    } else {
      console.log(`❌ Schema validation failed - accepted invalid parameters`);
    }
  }

  /**
   * Print test summary
   */
  private printSummary(): void {
    console.log('\n📊 Test Summary');
    console.log('================');

    const passed = this.results.filter(r => r.success).length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0) / total;

    console.log(`✅ Passed: ${passed}/${total} tests`);
    console.log(`⏱️  Average duration: ${avgDuration.toFixed(0)}ms`);
    console.log(`📈 Success rate: ${((passed/total) * 100).toFixed(1)}%`);

    if (passed === total) {
      console.log('\n🎉 All basic connectivity tests passed!');
    } else {
      console.log('\n❌ Some tests failed. Check the output above for details.');
    }
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new BasicConnectivityTests();
  const token = process.env.RAILWAY_API_TOKEN || process.argv[2];
  
  if (!token) {
    console.error('❌ Please provide Railway API token via RAILWAY_API_TOKEN environment variable or command line argument');
    process.exit(1);
  }

  tests.runAll(token).catch(console.error);
}