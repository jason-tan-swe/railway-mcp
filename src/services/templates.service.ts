import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import Fuse from 'fuse.js';

export class TemplatesService extends BaseService {

  public constructor() {
    super();
  }

  async listTemplates(searchQuery?: string) {
    try {
      let templates = await this.client.templates.listTemplates();

      // If search query is provided, filter templates by name and description
      if (searchQuery) {
        const fuse = new Fuse(templates, {
          keys: [{
            name: 'name',
            weight: 3,
          }, {
            name: 'description',
            weight: 2,
          }],
          threshold: 0.3
        });
        templates = fuse.search(searchQuery).map(result => result.item);
      }
      
      // Group templates by category
      const categorizedTemplates = templates.reduce((acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push(template);
        return acc;
      }, {} as Record<string, typeof templates>);

      const formattedTemplates = Object.entries(categorizedTemplates)
        .map(([category, templates]) => {
          // Sort templates by projects in descending order
          const sortedTemplates = [...templates].sort((a, b) => b.projects - a.projects);
          
          return `
            📁 ${category}
            ${sortedTemplates.map(template => {
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
                Projects: ${template.projects}
                Services:
                ${services}`;
            }).join('\n')}
        `;
        })
        .join('\n');

      return createSuccessResponse({
        text: `Available templates:\n${formattedTemplates}`,
        data: categorizedTemplates
      });
    } catch (error) {
      return createErrorResponse(`Error listing templates: ${formatError(error)}`);
    }
  }

  async deployTemplate(
    projectId: string,
    templateId: string,
    environmentId: string,
    teamId?: string,
  ) {
    try {
      // Get the template
      const templates = await this.client.templates.listTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) {
        return createErrorResponse(`Template not found: ${templateId}`);
      }

      // Deploy the template
      const response = await this.client.templates.deployTemplate(environmentId, projectId, template.serializedConfig, templateId, teamId);

      return createSuccessResponse({
        text: `Created new service "${template.name}" from template ${template.name} in project ${projectId}. Monitoring workflow status with ID: ${response.workflowId}`,
        data: response
      });
    } catch (error) {
      return createErrorResponse(`Error creating service from template: ${formatError(error)}`);
    }
  }

  async getWorkflowStatus(workflowId: string) {
    const response = await this.client.templates.getWorkflowStatus(workflowId);

    if (response.error) {
      return createErrorResponse(`Error with workflow ${workflowId}: ${response.error}`);
    }

    if (response.status.toLowerCase() === 'complete') {
      return createSuccessResponse({
        text: `Workflow ${workflowId} completed successfully`,
        data: response
      });
    }

    return createSuccessResponse({
      text: `Workflow ${workflowId} is still running. Status: ${response.status}`,
      data: response
    });
  }
}

// Initialize and export the singleton instance
export const templatesService = new TemplatesService(); 