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
            ${templates.map(template => `  📦 ${template.name}
                ID: ${template.id}
                Description: ${template.description}
                Source: ${template.source.repo || template.source.image}`).join('\n')}
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

      const serviceInput = {
        projectId,
        name: name || template.name,
        source: template.source
      };

      const service = await this.client.services.createService(serviceInput);

      // If there are template variables, set them
      if (template.variables) {
        const variables = Object.entries(template.variables).map(([name, value]) => ({
          projectId,
          environmentId,
          serviceId: service.id,
          name,
          value: value.replace('${random_string}', Math.random().toString(36).substring(7))
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