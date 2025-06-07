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
    {
      searchQuery: z.string().optional().describe("Optional search query to filter templates by name and description"),
    },
    async ({ searchQuery }) => {
      return templatesService.listTemplates(searchQuery);
    }
  ),

  createTool(
    "template_deploy",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Deploy a new service from a template",
      bestFor: [
        "Starting new services from templates",
        "Quick service deployment",
        "Using pre-configured templates"
      ],
      notFor: [
        "Custom service configurations",
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
      teamId: z.string().optional().describe("ID of the team to create the service in (if not provided, will use the default team)")
    },
    async ({ projectId, templateId, environmentId, teamId }: { 
      projectId: string;
      templateId: string;
      environmentId: string;
      teamId?: string;
    }) => {
      return templatesService.deployTemplate(projectId, templateId, environmentId, teamId);
    }
  ),
  createTool(
    "template_get_workflow_status",
    formatToolDescription({
      type: 'API',
      description: "Get the status of a workflow",
      bestFor: ["Checking workflow status"],
      notFor: ["Creating new services"],
      relations: {
        nextSteps: ["service_info"],
        related: ["template_list, template_deploy"]
      }
    }),
    {
      workflowId: z.string().describe("ID of the workflow to get the status of")
    },
    async ({ workflowId }) => {
      return templatesService.getWorkflowStatus(workflowId);
    }
  ),
];