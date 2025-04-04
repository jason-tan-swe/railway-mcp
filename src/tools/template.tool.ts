import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { templatesService } from '@/services/templates.service.js';

export const templateTools = [
  createTool(
    "template_list",
    formatToolDescription({
      type: 'API',
      description: "List all available templates on Railway",
      bestFor: [
        "Discovering available templates",
        "Planning service deployments",
        "Finding template IDs and sources"
      ],
      notFor: [
        "Listing existing services",
        "Getting service details"
      ],
      relations: {
        nextSteps: ["service_create_from_template"],
        alternatives: ["service_create_from_repo", "service_create_from_image"],
        related: ["database_list_types"]
      }
    }),
    {},
    async () => {
      return templatesService.listTemplates();
    }
  ),

  createTool(
    "service_create_from_template",
    formatToolDescription({
      type: 'API',
      description: "Create a new service from a template",
      bestFor: [
        "Starting new services from templates",
        "Quick service deployment",
        "Using pre-configured templates"
      ],
      notFor: [
        "Custom service configurations",
        "Database deployments (use database_deploy)",
        "GitHub repository deployments (use service_create_from_repo)"
      ],
      relations: {
        prerequisites: ["template_list"],
        alternatives: ["service_create_from_repo", "service_create_from_image", "database_deploy"],
        nextSteps: ["service_info", "variable_list"],
        related: ["service_update", "deployment_trigger"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to create the service in"),
      templateId: z.string().describe("ID of the template to use"),
      environmentId: z.string().describe("ID of the environment to deploy to"),
      name: z.string().optional().describe("Optional custom name for the service")
    },
    async ({ projectId, templateId, environmentId, name }: { 
      projectId: string;
      templateId: string;
      environmentId: string;
      name?: string;
    }) => {
      return templatesService.createServiceFromTemplate(projectId, templateId, environmentId, name);
    }
  )
]; 