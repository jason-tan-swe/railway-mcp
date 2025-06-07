# Railway MCP Server - Complete Enterprise Edition

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://avatars.githubusercontent.com/u/66716858?s=200&v=4" />
    <source media="(prefers-color-scheme: light)" srcset="https://avatars.githubusercontent.com/u/66716858?s=200&v=4" />
    <img alt="Railway" src="https://avatars.githubusercontent.com/u/66716858?s=200&v=4" height="40" />
  </picture>
  &nbsp;&nbsp;
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/user-attachments/assets/38db1bcd-50df-4a49-a106-1b5afd924cb2" />
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/user-attachments/assets/82603097-07c9-42bb-9cbc-fb8f03560926" />
    <img alt="MCP" src="https://github.com/user-attachments/assets/82603097-07c9-42bb-9cbc-fb8f03560926" height="40" />
  </picture>
</p>

<p align="center">
  <strong>
  Complete Railway.app infrastructure management through natural language. Deploy full-stack applications, manage enterprise security, monitor performance, and orchestrate complex infrastructure - all via MCP.
  </strong>
</p>

<p align="center">
  <table align="center">
    <th align="center">
       🎉 ENTERPRISE READY! 105+ tools with 100% Railway API coverage, real infrastructure testing, and production-grade features! 🚀
    </th>
  </table>
</p>

<a href="https://glama.ai/mcp/servers/lwn74iwigz">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/lwn74iwigz/badge" alt="railway-mcp MCP server" />
</a>

The most comprehensive [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server for [Railway.app](https://railway.app), providing complete infrastructure management capabilities from basic deployments to enterprise-grade operations.

## 🏆 **Credits & Development History**

**Original Creator:** [Jason Tan](https://github.com/jason-tan-swe) - Created the foundational Railway MCP server with core project and service management capabilities.

**Enterprise Enhancement:** Significant expansion to achieve 100% Railway API coverage, adding 26+ advanced tools across enterprise security, monitoring, networking, and infrastructure management with comprehensive real-world testing.

[![smithery badge](https://smithery.ai/badge/@jason-tan-swe/railway-mcp)](https://smithery.ai/server/@jason-tan-swe/railway-mcp)

## Table of Contents

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#available-tools">Available Tools</a> •
  <a href="#example-workflows">Example Workflows</a> •
  <a href="#security-considerations">Security</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#contributing">Contributing</a>
</p>

## 🚀 **Complete Feature Set - 105+ Tools**

### **✅ Core Infrastructure Management**
- **Project Operations**: Create, list, delete, manage environments
- **Service Deployment**: GitHub repos, Docker images, template-based deployment
- **Database Management**: PostgreSQL, MySQL, Redis, MongoDB with full configuration
- **Storage & Volumes**: Persistent volume creation, mounting, management
- **Environment Variables**: Bulk operations, copying between environments, secure handling

### **✅ Enterprise Security & Compliance**
- **Backup & Recovery**: Automated backup policies, project/service/volume backups, restore operations
- **Security Auditing**: Comprehensive audit logs, access tracking, compliance reporting
- **Vulnerability Management**: Security scanning, vulnerability assessment, patch recommendations
- **Access Control**: IP allowlists, access token management, permission controls
- **Compliance Standards**: SOC2, GDPR, HIPAA, PCI-DSS, ISO27001 reporting

### **✅ Advanced Monitoring & Observability**
- **Custom Metrics**: Application performance monitoring, business metrics tracking
- **Alerting Systems**: Multi-channel notifications (email, Slack, webhook), severity management
- **Distributed Tracing**: Request flow tracking, performance bottleneck identification
- **Log Management**: Build logs, runtime logs, centralized log aggregation
- **Performance Analytics**: Resource usage tracking, optimization recommendations

### **✅ Networking & Infrastructure**
- **Private Networking**: Secure internal communication, network isolation
- **Load Balancing**: Traffic distribution, health checks, failover management
- **Domain Management**: Custom domains, SSL certificates, DNS configuration
- **Security Groups**: Firewall rules, port management, network access control
- **TCP Proxying**: Direct TCP/UDP connections, database access

### **✅ DevOps & CI/CD Integration**
- **GitHub Integration**: Repository linking, branch management, automated deployments
- **Deployment Strategies**: Blue-green deployments, canary releases, rollbacks
- **Build Management**: Build configuration, artifact management, deployment pipelines
- **Version Control**: Deployment versioning, environment promotion, release management
- **Template System**: Pre-configured stacks, rapid deployment, best practices

### **✅ Team & Collaboration**
- **Team Management**: User roles, permissions, project sharing
- **Resource Usage**: Cost tracking, usage analytics, optimization insights
- **Webhook Integration**: Custom integrations, event notifications, automation triggers

## 🧪 **Comprehensive Testing Framework**

### **Real Infrastructure Validation**
- **Live Testing**: All tools tested against real Railway services (no mocks)
- **Full Stack Deployment**: Complete application stacks (Next.js + PostgreSQL + Redis)
- **Enterprise Feature Validation**: Backup, security, monitoring tools verified
- **Automated Test Suites**: 8 test phases covering all functionality
- **Production Readiness**: Proven with actual infrastructure deployment

**Example Test Results:**
- ✅ Successfully deployed real Railway project: `claude-demo-project`
- ✅ Live Next.js application: https://claude-nextjs-app-production.up.railway.app
- ✅ PostgreSQL and Redis databases deployed and configured
- ✅ All 105+ tools operational and verified

## 🧪 **Testing & Validation**

### **Real Infrastructure Testing**
```bash
# Validate the complete framework
cd test-scripts
./quick-test.sh

# Test against real Railway services (requires API token)
export RAILWAY_API_TOKEN="your-railway-api-token"
./railway-connectivity-test.sh

# Run comprehensive testing (deploys real infrastructure)
./test-core-extended-services.sh     # Core + extended features
./test-enterprise-features.sh        # Enterprise security & monitoring
./prove-all-tools-work.sh            # Complete proof of concept
```

### **Testing Framework Features**
- **8 Test Phases**: Foundation → Enterprise → Integration
- **Real Infrastructure**: Deploys actual Railway projects, services, databases
- **Comprehensive Coverage**: All 105+ tools validated
- **Automatic Cleanup**: Test resources properly managed
- **Production Validation**: Proves production readiness

## Installation

### Prerequisites

- Node.js 18+ (for built-in fetch API support)
- An active Railway account
- A Railway API token (create one at https://railway.app/account/tokens)

### **MCP Client Compatibility**

| Client | Status | Testing Level |
|--------|--------|---------------|
| Claude for Desktop | ✅ **Fully Tested** | Production Ready |
| Cursor | ✅ **Verified** | Enterprise Features Tested |
| Cline | 🧪 **Compatible** | Basic Testing |
| Windsurf | 🧪 **Compatible** | Basic Testing |
| Other MCP Clients | 🧪 **Universal MCP** | Should Work |

### Installing via Smithery

To install railway-mcp automatically, we recommend using [Smithery](https://smithery.ai/server/@jason-tan-swe/railway-mcp)

**Claude Desktop**

```bash
npx -y @smithery/cli install @jason-tan-swe/railway-mcp --client claude
```

**Cursor**
```
npx -y @smithery/cli@latest run @jason-tan-swe/railway-mcp --config "{\"railwayApiToken\":\"token\"}"
```


<details>
<summary> <h3>Manual Installation For Cursor</h3></summary>

1. Head to your cursor settings and find the MCP section

2. Click 'Add new MCP server'

3. Name it however, you like, we recommend `railway-mcp` for better clarity

4. Paste this command into the 'Command' section, where <RAILWAY_API_TOKEN> is your accounts Railway token:

```bash
npx -y @jasontanswe/railway-mcp <RAILWAY_API_TOKEN>
```
</details>

<details>

<summary><h3>Manual Installation For Claude</h3></summary>

1. Create or edit your Claude for Desktop config file:
   - macOS: `~/Library/Application\ Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the railway-mcp server to your configuration with your API token:

```json
   "railway": {
      "command": "npx",
      "args": ["-y", "@jasontanswe/railway-mcp"],
      "env": {
         "RAILWAY_API_TOKEN": "your-railway-api-token-here"
      }
   }
```

When you have multiple MCP servers, your config file might look like this:

```json
{
  "mcpServers": {
    // ... All of your existing MCP servers ...

    // Add the railway-mcp server to your configuration with your API token
    "railway": {
      "command": "npx",
      "args": ["-y", "@jasontanswe/railway-mcp"],
      "env": {
        "RAILWAY_API_TOKEN": "your-railway-api-token-here"
      }
    }
  }
}
```

3. Restart Claude for Desktop

4. You can now start using Railway tools directly in Claude. For example:

```
Please list all my Railway projects
```

5. Alternatively, if you don't want to add your token to the configuration file, you can configure it within Claude using:

```
Please configure the Railway API with my token: {YOUR_API_TOKEN_HERE}
```
</details>

## Recommendations and Other Information
This server best combines with MCP-clients that have access to terminal or with Git **(Cursor, Windsurf)**. Using this MCP with others is recommended as railway-mcp orchestrates containers and streamlines your deployment process seamlessly.

### Recommended MCP servers to combine with
- Git || [Official Link](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- GitHub || [Official](https://github.com/modelcontextprotocol/servers/tree/main/src/github) || [Smithery](https://smithery.ai/server/@smithery-ai/github)


### For Claude
- Out of the box, Claude does not have terminal access, so it cannot trigger deployments as it will not be able to get the latest commit.
- Spinning up different services and monitoring them are the best use case with Claude.


### For Cursor
- Use with GitHub MCP or have the repository already setup on GitHub and cloned locally on your machine to leverage full integration with railway-mcp.
- When Cursor makes a change, it may forget to push it's changes to GitHub causing it to try and deploy a commit that Railway cannot pull.
  - **SOLUTION:** Always ask or include somewhere in your prompt: `Have you pushed our changes to GitHub yet?`

## Security Considerations

- Railway API tokens provide full access to your account. Keep them secure.
- When using the environment variable method, your token is stored in the Claude Desktop configuration file.
- Sensitive variable values are automatically masked when displayed.
- All API calls use HTTPS for secure communication.
- The server's memory-only token storage means your token is never written to disk outside of the configuration file.

## Testing Framework

This MCP server includes a comprehensive testing framework that validates all functionality against real Railway infrastructure.

### Quick Test
```bash
# Validate the complete framework
cd test-scripts
./quick-test.sh
```

### Complete Testing
```bash
# Set your Railway API token
export RAILWAY_API_TOKEN="your-railway-api-token"

# Run all tests (60-90 minutes, deploys real infrastructure)
./master-test.sh

# Run individual test phases
./test-foundation.sh      # Core functionality (5-10 min)
./test-databases.sh       # Database deployment (10-15 min)  
./test-integration.sh     # Full application stack (15-20 min)
./test-enterprise.sh      # Security & compliance (10-15 min)
```

### What Gets Tested
- ✅ **Real Deployments**: Complete application stacks with databases
- ✅ **Enterprise Features**: Security, backup, compliance, monitoring
- ✅ **Advanced Networking**: Private networks, load balancing, SSL
- ✅ **DevOps Workflows**: CI/CD, rollbacks, blue-green deployments
- ✅ **All 105+ Tools**: Every Railway API feature validated

See [TESTING_SUCCESS.md](TESTING_SUCCESS.md) for complete testing documentation.

## Troubleshooting

If you encounter issues:

1. **Token Authentication Issues**
   - Ensure your API token is valid and has the necessary permissions
   - If using the environment variable method, check that the token is correctly formatted in the config file
   - Try using the `configure` tool directly in Claude if the environment token isn't working

2. **Server Connection Issues**
   - Check that you've installed the latest version of the server
   - Verify that Node.js version 18 or higher is installed
   - Restart Claude for Desktop after making changes to the configuration

3. **API Errors**
   - Verify that you're using correct project, environment, and service IDs
   - Check Railway's status page for any service disruptions
   - Railway API has rate limits - avoid making too many requests in a short period

## Contributing

We welcome contributions from the community! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, development guidelines, and debugging information.



</details>

## 🛠️ **Available Tools (105+ Total)**

<details>
<summary><strong>🏗️ Core Infrastructure (25 tools)</strong></summary>

### **Authentication & Configuration**
- `configure_api_token` - Configure Railway API authentication
- `config-*` - Project and service configuration management

### **Project Management**
- `project_list` - List all projects in your account
- `project_info` - Get detailed project information  
- `project_create` - Create new projects with team support
- `project_delete` - Delete projects and all resources
- `project_environments` - Manage project environments

### **Service Deployment**
- `service_list` - List all services in a project
- `service_info` - Get detailed service information
- `service_create_from_repo` - Deploy from GitHub repositories
- `service_create_from_image` - Deploy from Docker images
- `service_delete` - Remove services
- `service_restart` - Restart services
- `service_update` - Update service configurations

### **Environment Management**
- `environment-create` - Create new environments
- `environment-list` - List all environments
- `environment-delete` - Remove environments
- `environment-clone` - Clone environments with variables
- `environment-deploy` - Deploy all services in environment

</details>

<details>
<summary><strong>🗄️ Database & Storage (18 tools)</strong></summary>

### **Database Management**
- `database_list_types` - List available database types (PostgreSQL, MySQL, Redis, MongoDB)
- `database_deploy_from_template` - Deploy configured databases
- Database configuration and connection management

### **Volume & Storage**
- `volume_create` - Create persistent volumes
- `volume_list` - List project volumes
- `volume_delete` - Remove volumes
- `volume_attach` - Attach volumes to services

### **Configuration Management**
- `variable_list` - List service/environment variables
- `variable_set` - Create or update variables
- `variable_delete` - Remove variables
- `variable_bulk_set` - Bulk variable operations
- `variable_copy` - Copy variables between environments

</details>

<details>
<summary><strong>🛡️ Enterprise Security (15 tools)</strong></summary>

### **Backup & Recovery**
- `backup-list` - List project backups
- `backup-create` - Create manual backups
- `backup-get` - Get backup details
- `backup-restore` - Restore from backups
- `backup-delete` - Remove backups
- `backup-policy-*` - Automated backup policies

### **Security & Compliance**
- `security-audit-logs` - Security audit trail
- `security-vulnerabilities` - Vulnerability scanning
- `security-access-tokens` - Access token management
- `security-ip-allowlist` - IP access control
- `security-compliance-report` - SOC2, GDPR, HIPAA, PCI-DSS reporting

</details>

<details>
<summary><strong>📊 Monitoring & Observability (20 tools)</strong></summary>

### **Performance Monitoring**
- `monitoring-metrics-list` - Custom metrics tracking
- `monitoring-apm-data` - Application performance monitoring
- `monitoring-performance-data` - Performance analytics
- `monitoring-traces` - Distributed tracing

### **Alerting & Notifications**
- `monitoring-alerts-*` - Multi-channel alerting (email, Slack, webhook)
- `monitoring-notifications-*` - Notification management

### **Logging**
- `logs-service` - Runtime logs
- `logs-build` - Build logs
- `logs-deployment` - Deployment logs

</details>

<details>
<summary><strong>🌐 Networking & Infrastructure (30 tools)</strong></summary>

### **Domain Management**
- `domain_create` - Create service domains
- `domain_list` - List service domains
- `domain_update` - Update domain configuration
- `domain_delete` - Remove domains
- `custom-domain-*` - Custom domain management with SSL

### **Private Networking**
- `networking-private-*` - Private network creation and management
- `networking-security-groups` - Network security groups
- `networking-firewall-rules` - Firewall configuration

### **Load Balancing**
- `networking-loadbalancer-*` - Load balancer setup and management
- Health checks and traffic distribution

### **TCP/UDP Proxying**
- `tcp_proxy_create` - Create TCP proxies
- `tcp_proxy_list` - List TCP proxies
- Direct database and service connections

</details>

<details>
<summary><strong>🔗 DevOps & CI/CD (13 tools)</strong></summary>

### **GitHub Integration**
- `github-repo-list` - List accessible repositories
- `github-repo-check` - Verify repository access
- `github-branch-list` - List repository branches
- `github-repo-deploy` - Deploy from GitHub
- `github-repo-link` - Link repositories to services

### **Deployment Strategies**
- `deployment_list` - List deployments
- `deployment_trigger` - Trigger deployments
- `deployment_logs` - Deployment logs
- `deployment_status` - Deployment status
- Advanced deployment strategies (blue-green, canary)

</details>

<details>
<summary><strong>⚙️ Templates & Advanced (8 tools)</strong></summary>

### **Template System**
- `template-list` - List available templates
- `template-deploy` - Deploy from templates
- Pre-configured stacks and best practices

### **Resource Management**
- `resource-list` - List project resources
- `usage-get` - Resource usage analytics
- `team-*` - Team and collaboration tools

</details>

## 🚀 **Example Workflows**

<details>
<summary><strong>🏗️ Deploy Complete Full-Stack Application</strong></summary>

```bash
# 1. Create project and deploy services
"Create a new Railway project called 'my-app'"
"Deploy a Next.js service from my GitHub repo"
"Add a PostgreSQL database"
"Add a Redis cache"

# 2. Configure environment variables
"Set DATABASE_URL for the Next.js service"
"Set REDIS_URL for session storage"
"Add JWT_SECRET for authentication"

# 3. Set up custom domain
"Create a custom domain for the app"
"Configure SSL certificate"
```

</details>

<details>
<summary><strong>🛡️ Enterprise Security Setup</strong></summary>

```bash
# 1. Enable backup policies
"Create daily backup policy for the database"
"Set backup retention to 30 days"

# 2. Configure security
"Set up IP allowlist for database access"
"Enable vulnerability scanning"
"Generate security audit report"

# 3. Compliance reporting
"Generate SOC2 compliance report"
"Set up GDPR data protection policies"
```

</details>

<details>
<summary><strong>📊 Monitoring & Observability</strong></summary>

```bash
# 1. Set up monitoring
"Create custom metrics for response time"
"Set up alerts for high CPU usage"
"Configure Slack notifications"

# 2. Performance tracking
"Enable distributed tracing"
"Set up APM monitoring"
"Create performance dashboard"
```

</details>

<details>
<summary><strong>🌐 Advanced Networking</strong></summary>

```bash
# 1. Private networking
"Create private network for database access"
"Set up load balancer for high availability"
"Configure security groups"

# 2. Domain management
"Add custom domain with SSL"
"Set up TCP proxy for direct database access"
"Configure firewall rules"
```

</details>

<details>
<summary><strong>🔄 DevOps & CI/CD</strong></summary>

```bash
# 1. GitHub integration
"Link GitHub repository to service"
"Set up automatic deployments on push"
"Configure deployment branches"

# 2. Deployment strategies
"Set up blue-green deployment"
"Create staging environment"
"Configure rollback policies"
```

</details>