import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';

export class TemplatesService extends BaseService {
  public constructor() {
    super();
  }

  async listTemplates() {
    try {
      const templates = await this.client.templates.listTemplates();
      
      // Group templates by category
      const categorizedTemplates = templates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      }, {} as Record<string, typeof templates>);

      const formattedTemplates = Object.entries(categorizedTemplates)
        .map(([category, templates]) => `
            📁 ${category}
            ${templates.map(template => {
              const services = Object.entries(template.serializedConfig.services)
                .map(([id, service]) => `
                    Service: ${service.name}
                    ${service.icon ? `Icon: ${service.icon}` : ''}
                    Source: ${service.source?.image || service.source?.repo || 'N/A'}
                    Variables: ${Object.keys(service.variables || {}).length} configured
                    Networking: ${service.networking?.tcpProxies ? 'TCP Proxy enabled' : 'No TCP Proxy'}, ${Object.keys(service.networking?.serviceDomains || {}).length} domains
                    Volumes: ${Object.keys(service.volumeMounts || {}).length} mounts`
                ).join('\n');

              return `  📦 ${template.name}
                ID: ${template.id}
                Description: ${template.description}
                Services:
                ${services}`;
            }).join('\n')}
        `).join('\n');

      return createSuccessResponse({
        text: `Available templates:\n${formattedTemplates}`,
        data: categorizedTemplates
      });
    } catch (error) {
      return createErrorResponse(`Error listing templates: ${formatError(error)}`);
    }
  }

  async createServiceFromTemplate(
    projectId: string,
    templateId: string,
    environmentId: string,
    name?: string
  ) {
    try {
      const templates = await this.client.templates.listTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return createErrorResponse(`Template not found: ${templateId}`);
      }

      // Get the first service from the template
      const [serviceId, serviceConfig] = Object.entries(template.serializedConfig.services)[0];
      
      const serviceInput = {
        projectId,
        name: name || serviceConfig.name,
        source: {
          repo: serviceConfig.source?.repo,
          image: serviceConfig.source?.image
        }
      };

      const service = await this.client.services.createService(serviceInput);

      // If there are template variables, set them
      if (serviceConfig.variables) {
        const variables = Object.entries(serviceConfig.variables).map(([name, config]) => ({
          projectId,
          environmentId,
          serviceId: service.id,
          name,
          value: config.defaultValue.replace(/\$\{\{\s*secret\((\d+)(?:,\s*"[^"]*")?\)\s*\}\}/, () => 
            Math.random().toString(36).substring(2, 15)
          )
        }));

        await this.client.variables.upsertVariables(variables);
      }

      return createSuccessResponse({
        text: `Created new service "${service.name}" from template ${template.name} (ID: ${service.id})`,
        data: service
      });
    } catch (error) {
      return createErrorResponse(`Error creating service from template: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const templatesService = new TemplatesService(); 