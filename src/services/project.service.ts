import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export class ProjectService extends BaseService {

  public constructor() {
    super();
  }

  async listProjects() {
    try {
      const projects = await this.client.projects.listProjects();

      if (projects.length === 0) {
        return createSuccessResponse({
          text: "No projects found.",
          data: []
        });
      }

      const projectDetails = projects.map(project => {
        const environments = project.environments?.edges?.length || 0;
        const services = project.services?.edges?.length || 0;

        return `📁 ${project.name} (ID: ${project.id})
Description: ${project.description || 'No description'}
Environments: ${environments}
${environments > 0 ? `${project.environments.edges.map(edge => `- ${edge.node.name} (${edge.node.id})`).join('\n')}` : ''}
Services: ${services}
${services > 0 ? `${project.services.edges.map(edge => `- ${edge.node.name} (${edge.node.id})`).join('\n')}` : ''}
Created: ${new Date(project.createdAt).toLocaleString()}`;
      });

      return createSuccessResponse({
        text: `Projects:\n\n${projectDetails.join('\n\n')}`,
        data: projects
      });
    } catch (error) {
      return createErrorResponse(`Error listing projects: ${formatError(error)}`);
    }
  }

  async getProject(projectId: string): Promise<CallToolResult> {
    try {
      const project = await this.client.projects.getProject(projectId);

      if (!project) {
        return createErrorResponse("Project not found.");
      }

      const environments = project.environments?.edges?.map(edge => edge.node) || [];
      const services = project.services?.edges?.map(edge => edge.node) || [];

      const environmentList = environments.map(env => 
        `  🌍 ${env.name} (ID: ${env.id})`
      ).join('\n');

      const serviceList = services.map(svc =>
        `  🚀 ${svc.name} (ID: ${svc.id})`
      ).join('\n');

      const info = `📁 Project: ${project.name} (ID: ${project.id})
Description: ${project.description || 'No description'}
Created: ${new Date(project.createdAt).toLocaleString()}
Subscription: ${project.subscriptionType || 'Free'}

Environments:
${environmentList || '  No environments'}

Services:
${serviceList || '  No services'}`;

      return createSuccessResponse({
        text: info,
        data: { project, environments, services }
      });
    } catch (error) {
      return createErrorResponse(`Error getting project details: ${formatError(error)}`);
    }
  }

  async createProject(name: string, teamId?: string): Promise<CallToolResult> {
    try {
      const project = await this.client.projects.createProject(name, teamId);

      return createSuccessResponse({
        text: `Created new project "${project.name}" (ID: ${project.id})`,
        data: project
      });
    } catch (error) {
      return createErrorResponse(`Error creating project: ${formatError(error)}`);
    }
  }

  async deleteProject(projectId: string): Promise<CallToolResult> {
    try {
      await this.client.projects.deleteProject(projectId);
      return createSuccessResponse({
        text: "Project deleted successfully"
      });
    } catch (error) {
      return createErrorResponse(`Error deleting project: ${formatError(error)}`);
    }
  }

  async listEnvironments(projectId: string) {
    try {
      const environments = await this.client.projects.listEnvironments(projectId);

      if (environments.length === 0) {
        return createSuccessResponse({
          text: "No environments found in this project.",
          data: []
        });
      }

      const environmentDetails = environments.map(env => 
        `🌍 ${env.name} (ID: ${env.id})
Created: ${new Date(env.createdAt).toLocaleString()}
${env.isEphemeral ? '(Ephemeral)' : '(Permanent)'}
${env.unmergedChangesCount ? `Unmerged Changes: ${env.unmergedChangesCount}` : ''}`
      );

      return createSuccessResponse({
        text: `Environments in project:\n\n${environmentDetails.join('\n\n')}`,
        data: environments
      });
    } catch (error) {
      return createErrorResponse(`Error listing environments: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const projectService = new ProjectService();
