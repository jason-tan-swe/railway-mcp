import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class TemplateService extends BaseService {
  constructor() {
    super();
  }

  async list(category?: string, tags?: string[]) {
    try {
      let templates;
      
      if (category) {
        templates = await this.client.templates.searchByCategory(category);
      } else if (tags && tags.length > 0) {
        templates = await this.client.templates.searchByTags(tags);
      } else {
        templates = await this.client.templates.list();
      }

      const groupedByCategory = templates.reduce((acc, template) => {
        const cat = template.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push({
          name: template.name,
          code: template.code,
          description: template.description,
          tags: template.tags || [],
          languages: template.languages || []
        });
        return acc;
      }, {} as Record<string, any[]>);

      return createSuccessResponse({
        text: `Found ${templates.length} template(s)`,
        data: {
          totalCount: templates.length,
          byCategory: groupedByCategory,
          templates: templates.map(t => ({
            name: t.name,
            code: t.code,
            description: t.description,
            category: t.category,
            tags: t.tags || [],
            languages: t.languages || [],
            isApproved: t.isApproved
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list templates: ${formatError(error)}`);
    }
  }

  async get(code: string) {
    try {
      const template = await this.client.templates.get(code);
      
      return createSuccessResponse({
        text: `Retrieved template '${template.name}'`,
        data: {
          id: template.id,
          name: template.name,
          code: template.code,
          description: template.description,
          category: template.category,
          tags: template.tags || [],
          languages: template.languages || [],
          readme: template.readme,
          isApproved: template.isApproved,
          activeProjects: template.activeProjects,
          services: (template as any).services || []
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get template: ${formatError(error)}`);
    }
  }

  async getUserTemplates() {
    try {
      const templates = await this.client.templates.getUserTemplates();
      
      return createSuccessResponse({
        text: `Found ${templates.length} user template(s)`,
        data: {
          totalCount: templates.length,
          templates: templates.map(t => ({
            id: t.id,
            name: t.name,
            code: t.code,
            description: t.description,
            status: t.status,
            createdAt: t.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get user templates: ${formatError(error)}`);
    }
  }

  async deploy(options: {
    templateCode?: string;
    projectName?: string;
    projectId?: string;
    environmentId?: string;
    services?: Record<string, any>;
  }) {
    try {
      if (!options.templateCode && !options.projectId) {
        return createErrorResponse("Either templateCode or projectId must be provided");
      }

      const result = await this.client.templates.deploy({
        templateCode: options.templateCode,
        projectName: options.projectName,
        projectId: options.projectId,
        environmentId: options.environmentId,
        services: options.services
      });

      return createSuccessResponse({
        text: `Template deployed successfully`,
        data: {
          projectId: result.projectId,
          workflowId: result.workflowId,
          nextSteps: [
            "Use project_info to view the deployed project",
            "Use service_list to see created services",
            "Use deployment_list to monitor deployment progress"
          ]
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to deploy template: ${formatError(error)}`);
    }
  }

  async generate(projectId: string) {
    try {
      const templateCode = await this.client.templates.generate(projectId);
      
      return createSuccessResponse({
        text: `Template generated for project`,
        data: {
          projectId,
          templateCode,
          nextSteps: [
            `Use template-get with code '${templateCode}' to view the template`,
            "Use template-deploy to deploy this template to a new project"
          ]
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to generate template: ${formatError(error)}`);
    }
  }
}

export const templateService = new TemplateService();