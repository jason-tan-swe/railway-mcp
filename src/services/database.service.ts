import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { RegionCode } from '@/types.js';

interface DatabaseTemplate {
  id: string;
  name: string;
  description: string;
  category?: string;
  serializedConfig: {
    services: Record<string, {
      name?: string;
      source?: {
        image: string;
      };
      networking?: {
        tcpProxies?: Record<string, {
          port?: number;
        }>;
      };
      variables?: Record<string, {
        defaultValue: string;
      }>;
      volumeMounts?: Record<string, {
        mountPath: string;
      }>;
    }>;
  };
}

export class DatabaseService extends BaseService {
  public constructor() {
    super();
  }

  async listDatabaseTypes() {
    try {
      const templates = await this.client.templates.listTemplates() as DatabaseTemplate[];
      
      // Filter templates by Storage category and group by subcategory
      const categorizedDatabases = templates
        .filter(template => template.category?.toLowerCase().includes('storage') || template.category?.toLowerCase().includes('database'))
        .reduce((acc, template) => {
          const services = Object.entries(template.serializedConfig.services);
          if (services.length === 0) return acc;
          
          // We only care about the first service since database templates should only have one
          const [_, service] = services[0];
          if (!service.source?.image) return acc;

          const category = template.category || 'Uncategorized';
          if (!acc[category]) {
            acc[category] = [];
          }

          acc[category].push(template);

          return acc;
        }, {} as Record<string, Array<DatabaseTemplate>>);

      const formattedDatabases = Object.entries(categorizedDatabases)
        .map(([category, databases]) => `
📁 ${category}
${databases.map(db => `  💾 ${db.name}
     Id: ${db.id}
     Description: ${db.description}`).join('\n')}
`).join('\n');

      return createSuccessResponse({
        text: `Available database types:\n${formattedDatabases}`,
        data: categorizedDatabases
      });
    } catch (error) {
      return createErrorResponse(`Error listing database types: ${formatError(error)}`);
    }
  }

  async createDatabaseFromTemplate(projectId: string, id: string, region: RegionCode, environmentId: string, name?: string){
    try {
      // Get the database template
      const templates = await this.client.templates.listTemplates() as DatabaseTemplate[];
      const template = templates
        .filter(t => t.category?.toLowerCase().includes('storage') || t.category?.toLowerCase().includes('database'))
        .find(t => t.id === id);
      
      if (!template) {
        return createErrorResponse(`Unsupported database`);
      }

      // Get the first service from the template (database templates should only have one)
      const services = Object.entries(template.serializedConfig.services);
      if (services.length === 0) {
        return createErrorResponse(`Invalid database template: No services found`);
      }

      const [_, serviceConfig] = services[0];
      if (!serviceConfig.source?.image) {
        return createErrorResponse(`Invalid database template: No image source found`);
      }

      // Create the database service using the template's image
      const service = await this.client.services.createService({
        projectId,
        name: name || serviceConfig.name || template.name,
        source: {
          image: serviceConfig.source.image
        }
      });

      // If there are variables in the template, set them
      if (serviceConfig.variables) {
        const variables = Object.entries(serviceConfig.variables).map(([name, config]) => ({
          projectId,
          environmentId,
          serviceId: service.id,
          name,
          value: config.defaultValue
        }));

        await this.client.variables.upsertVariables(variables);
      }

      // Update the service instance to use the specified region
      const serviceInstance = await this.client.services.getServiceInstance(service.id, environmentId);
      if (!serviceInstance) {
        return createErrorResponse(`Service instance not found.`);
      }

      const hasUpdatedServiceInstance = await this.client.services.updateServiceInstance(service.id, environmentId, { region });
      if (!hasUpdatedServiceInstance) {
        return createErrorResponse(`Error updating service instance: Failed to update service instance of ${service.id} in environment ${environmentId}`);
      }
      
      // Setup TCP Proxy if specified in the template
      const port = (() => {
        if (!serviceConfig.networking?.tcpProxies) return 5432;
        const proxyConfigs = Object.values(serviceConfig.networking.tcpProxies);
        if (proxyConfigs.length === 0) return 5432;
        const firstProxy = proxyConfigs[0];
        return firstProxy.port ?? 5432;
      })();

      const proxy = await this.client.tcpProxies.tcpProxyCreate({
        environmentId: environmentId,
        serviceId: service.id,
        applicationPort: port
      });
      if (!proxy) {
        return createErrorResponse(`Error creating proxy: Failed to create proxy for ${service.id} in environment ${environmentId}`);
      }

      // Setup Volume if specified in the template
      const mountPath = Object.values(serviceConfig.volumeMounts || {})[0]?.mountPath || "/data";
      const volume = await this.client.volumes.createVolume({
        projectId,
        environmentId,
        serviceId: service.id,
        mountPath
      });
      if (!volume) {
        return createErrorResponse(`Error creating volume: Failed to create volume for ${service.id} in environment ${environmentId}`);
      }
      
      return createSuccessResponse({
        text: `Created new ${template.name} service "${service.name}" (ID: ${service.id})\n` +
              `Using image: ${serviceConfig.source.image}`,
        data: service
      });
    } catch (error) {
      return createErrorResponse(`Error creating database: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const databaseService = new DatabaseService();
