import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { DATABASE_CONFIGS, DatabaseType, RegionCode } from '@/types.js';

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
        acc[config.category].push({ ...config, type: type as any });
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

  async createDatabaseFromTemplate(projectId: string, type: DatabaseType, region: RegionCode, environmentId: string, name?: string): Promise<CallToolResult> {
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


      /* 
      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL
      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL
      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL

      // TODO: Check that the service is NOT running on Metal
      // Apparently it gives this weird bug where volume
      // cannot mount on service if service is running on Metal

      // Update the service instance to use CLOUD over METAL 
      // using the region property and updating to [us-east4, us-east4-eqdc4a, us-west1, us-west2] for ServiceInstances
      // We don't need to update the volume for this, since it'll automatically use the region of the service instance
      // This is temporary until Railway has fully migrated support for Volumes to Metal

      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL
      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL
      TEMPORARY UNTIL RAILWAY HAS FULLY MIGRATED TO METAL
      */
      const serviceInstance = await this.client.services.getServiceInstance(service.id, environmentId);
      if (!serviceInstance) {
        return createErrorResponse(`Service instance not found.`);
      }

      // For now, let's auto-update the service instance to use CLOUD over METAL
      // using the region property and updating to [us-east4, us-east4-eqdc4a, us-west1, us-west2] for ServiceInstances ** WE MAKE ASSUMPTION THAT MOST PEOPLE ARE IN US -- I APOLOGIZE FOR THIS
      // We don't need to update the volume for this, since it'll automatically use the region of the service instance
      // This is temporary until Railway has fully migrated support for Volumes to Metal to which we don't need to do this anymore
      const hasUpdatedServiceInstance = await this.client.services.updateServiceInstance(service.id, environmentId, { region });
      if (!hasUpdatedServiceInstance) {
        return createErrorResponse(`Error updating service instance: Failed to update service instance of ${service.id} in environment ${environmentId}`);
      }
      
      // Setup Proxy
      const proxy = await this.client.tcpProxies.tcpProxyCreate({
        environmentId: environmentId,
        serviceId: service.id,
        applicationPort: dbConfig.port
      });
      if (!proxy) {
        return createErrorResponse(`Error creating proxy: Failed to create proxy for ${service.id} in environment ${environmentId}`);
      }

      // Setup Volume
      const volume = await this.client.volumes.createVolume({
        projectId,
        environmentId,
        mountPath: "/data", // TODO: Make this configurable
        name: `${service.name}-volume-${Date.now()}`
      });
      if (!volume) {
        return createErrorResponse(`Error creating volume: Failed to create volume for ${service.id} in environment ${environmentId}`);
      }
      
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
