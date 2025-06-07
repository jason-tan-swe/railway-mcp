import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { templateService } from "../services/template.service.js";

export const templateTools = [
  createTool(
    "template-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List available Railway templates",
      bestFor: [
        "Browsing pre-built application templates",
        "Finding starter projects",
        "Discovering deployment patterns"
      ],
      relations: {
        nextSteps: ["template-get", "template-deploy"],
        related: ["template-search"]
      }
    }),
    {
      category: z.string().optional().describe("Filter by category (e.g., 'Databases', 'Web Frameworks')"),
      tags: z.array(z.string()).optional().describe("Filter by tags (e.g., ['nodejs', 'postgres'])")
    },
    async ({ category, tags }) => {
      return templateService.list(category, tags);
    }
  ),

  createTool(
    "template-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a specific template",
      bestFor: [
        "Viewing template details before deployment",
        "Understanding template services and configuration",
        "Reading template documentation"
      ],
      relations: {
        prerequisites: ["template-list"],
        nextSteps: ["template-deploy"]
      }
    }),
    {
      code: z.string().describe("Template code (e.g., 'django', 'nextjs-prisma')")
    },
    async ({ code }) => {
      return templateService.get(code);
    }
  ),

  createTool(
    "template-user-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List templates created by the current user",
      bestFor: [
        "Managing your own templates",
        "Viewing template status",
        "Finding templates to update"
      ],
      relations: {
        nextSteps: ["template-get", "template-generate"],
        related: ["project_list"]
      }
    }),
    {},
    async () => {
      return templateService.getUserTemplates();
    }
  ),

  createTool(
    "template-deploy",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Deploy a Railway template to create a new project",
      bestFor: [
        "Quick project setup from templates",
        "Deploying pre-configured stacks",
        "Creating projects with multiple services"
      ],
      notFor: [
        "Deploying to existing projects (templates create new projects)",
        "Single service deployments (use service-create instead)"
      ],
      relations: {
        prerequisites: ["template-list", "template-get"],
        nextSteps: ["project_info", "service_list", "deployment_list"],
        alternatives: ["github-repo-deploy", "service-create-from-repo"]
      }
    }),
    {
      templateCode: z.string().describe("Template code to deploy (e.g., 'django', 'nextjs-prisma')"),
      projectName: z.string().optional().describe("Name for the new project (auto-generated if not provided)"),
      environmentId: z.string().optional().describe("Environment to deploy to"),
      services: z.record(z.any()).optional().describe("Service configuration overrides")
    },
    async ({ templateCode, projectName, environmentId, services }) => {
      return templateService.deploy({
        templateCode,
        projectName,
        environmentId,
        services
      });
    }
  ),

  createTool(
    "template-generate",
    formatToolDescription({
      type: 'API',
      description: "Generate a template from an existing project",
      bestFor: [
        "Creating reusable templates from your projects",
        "Sharing project configurations",
        "Building custom starters"
      ],
      relations: {
        prerequisites: ["project_info"],
        nextSteps: ["template-user-list", "template-get"],
        related: ["project_list"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to generate a template from")
    },
    async ({ projectId }) => {
      return templateService.generate(projectId);
    }
  ),

  createTool(
    "template-search",
    formatToolDescription({
      type: 'QUERY',
      description: "Search templates by category or tags",
      bestFor: [
        "Finding templates for specific technologies",
        "Discovering templates by use case",
        "Filtering templates by stack"
      ],
      relations: {
        nextSteps: ["template-get", "template-deploy"],
        alternatives: ["template-list"]
      }
    }),
    {
      category: z.string().optional().describe("Category to search (e.g., 'Databases', 'APIs')"),
      tags: z.array(z.string()).optional().describe("Tags to search for (e.g., ['python', 'redis'])")
    },
    async ({ category, tags }) => {
      if (!category && (!tags || tags.length === 0)) {
        return templateService.list();
      }
      return templateService.list(category, tags);
    }
  )
];