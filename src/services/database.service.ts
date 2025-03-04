import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DATABASE_CONFIGS, DatabaseType } from '@/types.js';

export class DatabaseService extends BaseService {
  public constructor() {
    super();
  }

  async listDatabaseTypes() {
    try {
      // Group databases by category
      const categorizedDatabases = Object.entries(DATABASE_CONFIGS).reduce((acc, [type, config]) => {
        if (!acc[config.category]) {
          acc[config.category] = [];
        }
        acc[config.category].push({ type, ...config });
        return acc;
      }, {} as Record<string, Array<{ type: string } & typeof DATABASE_CONFIGS[keyof typeof DATABASE_CONFIGS]>>);

      const formattedDatabases = Object.entries(categorizedDatabases)
        .map(([category, databases]) => `
📁 ${category}
${databases.map(db => `  💾 ${db.defaultName}
     Type: ${db.type}
     Description: ${db.description}
     Image: ${db.source}`).join('\n')}
`).join('\n');

      return createSuccessResponse({
        text: `Available database types:\n${formattedDatabases}`,
        data: categorizedDatabases
      });
    } catch (error) {
      return createErrorResponse(`Error listing database types: ${formatError(error)}`);
    }
  }

  async createDatabase(projectId: string, type: DatabaseType, environmentId: string, name?: string): Promise<CallToolResult> {
    try {
      const dbConfig = DATABASE_CONFIGS[type];
      if (!dbConfig) {
        return createErrorResponse(`Unsupported database type: ${type}`);
      }

      // Create the database service using the image
      const service = await this.client.services.createService({
        projectId,
        name: name || dbConfig.defaultName,
        source: {
          image: dbConfig.source
        }
      });

      // If there are default variables, set them
      if (dbConfig.variables) {
        await this.client.variables.upsertVariables(
          Object.entries(dbConfig.variables).map(([name, value]) => ({
            projectId,
            environmentId,
            serviceId: service.id,
            name,
            value
          }))
        );
      }
      
      // Setup Proxy
      await this.client.tcpProxies.tcpProxyCreate({
        environmentId: environmentId,
        serviceId: service.id,
        applicationPort: dbConfig.port
      });

      // TODO: Setup Volume

      return createSuccessResponse({
        text: `Created new ${dbConfig.defaultName} service "${service.name}" (ID: ${service.id})\n` +
              `Using image: ${dbConfig.source}`,
        data: service
      });
    } catch (error) {
      return createErrorResponse(`Error creating database: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const databaseService = new DatabaseService();
