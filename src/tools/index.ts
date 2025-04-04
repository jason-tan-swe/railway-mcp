import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { databaseTools } from './database.tool.js';
import { deploymentTools } from './deployment.tool.js';
import { domainTools } from './domain.tool.js';
import { projectTools } from './project.tool.js';
import { serviceTools } from './service.tool.js';
import { tcpProxyTools } from './tcpProxy.tool.js';
import { variableTools } from './variable.tool.js';
import { configTools } from './config.tool.js';
import { volumeTools } from './volume.tool.js';
import { templateTools } from './template.tool.js';

import { Tool } from '@/utils/tools.js';

export function registerAllTools(server: McpServer) {
  // Collect all tools
  const allTools = [
    ...databaseTools,
    ...deploymentTools,
    ...domainTools,
    ...projectTools,
    ...serviceTools,
    ...tcpProxyTools,
    ...variableTools,
    ...configTools,
    ...volumeTools,
    ...templateTools,
  ] as Tool[];

  // Register each tool with the server
  allTools.forEach((tool) => {
    server.tool(
      ...tool
    );
  });
} 