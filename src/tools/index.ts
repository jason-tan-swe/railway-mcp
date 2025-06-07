import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { configTools } from './config.tool.js';
import { customDomainTools } from './customDomain.tool.js';
import { databaseTools } from './database.tool.js';
import { deploymentTools } from './deployment.tool.js';
import { domainTools } from './domain.tool.js';
import { environmentTools } from './environment.tool.js';
import { gitHubTools } from './github.tool.js';
import { logsTools } from './logs.tool.js';
import { pluginTools } from './plugin.tool.js';
import { projectTools } from './project.tool.js';
import { resourceTools } from './resource.tool.js';
import { serviceTools } from './service.tool.js';
import { tcpProxyTools } from './tcpProxy.tool.js';
import { teamTools } from './team.tool.js';
import { templateTools } from './template.tool.js';
import { usageTools } from './usage.tool.js';
import { variableTools } from './variable.tool.js';
import { volumeTools } from './volume.tool.js';
import { webhookTools } from './webhook.tool.js';

import { Tool } from '@/utils/tools.js';

export function registerAllTools(server: McpServer) {
  // Collect all tools
  const allTools = [
    ...configTools,
    ...customDomainTools,
    ...databaseTools,
    ...deploymentTools,
    ...domainTools,
    ...environmentTools,
    ...gitHubTools,
    ...logsTools,
    ...pluginTools,
    ...projectTools,
    ...resourceTools,
    ...serviceTools,
    ...tcpProxyTools,
    ...teamTools,
    ...templateTools,
    ...usageTools,
    ...variableTools,
    ...volumeTools,
    ...webhookTools,
  ] as Tool[];

  // Register each tool with the server
  allTools.forEach((tool) => {
    server.tool(
      ...tool
    );
  });
} 