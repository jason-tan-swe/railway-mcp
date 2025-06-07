import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { environmentService } from "../services/environment.service.js";

export const environmentTools = [
  createTool(
    "environment-create",
    formatToolDescription({
      type: 'API',
      description: "Create a new environment in a Railway project",
      bestFor: [
        "Setting up new development/staging environments",
        "Creating ephemeral environments for testing",
        "Multi-environment project setup"
      ],
      relations: {
        prerequisites: ["project_list", "project_info"],
        nextSteps: ["variable_set", "service_create_from_repo"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to create the environment in"),
      name: z.string().describe("Name for the new environment"),
      isEphemeral: z.boolean().optional().default(false).describe("Whether this is a temporary environment (default: false)")
    },
    async ({ projectId, name, isEphemeral }) => {
      return environmentService.create(projectId, name, isEphemeral);
    }
  ),

  createTool(
    "environment-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete an environment from a Railway project",
      bestFor: [
        "Cleaning up unused environments",
        "Removing temporary/ephemeral environments"
      ],
      notFor: [
        "Deleting production environments without backup"
      ],
      relations: {
        prerequisites: ["environment-list"],
        related: ["environment-create"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment to delete")
    },
    async ({ environmentId }) => {
      return environmentService.delete(environmentId);
    }
  ),

  createTool(
    "environment-update",
    formatToolDescription({
      type: 'API',
      description: "Update/rename an environment",
      bestFor: [
        "Renaming environments for clarity",
        "Updating environment configurations"
      ],
      relations: {
        prerequisites: ["environment-list", "environment-info"],
        nextSteps: ["environment-info"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment to update"),
      name: z.string().describe("New name for the environment")
    },
    async ({ environmentId, name }) => {
      return environmentService.update(environmentId, name);
    }
  ),

  createTool(
    "environment-clone",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Clone an environment, optionally including its variables",
      bestFor: [
        "Creating staging environments from production",
        "Duplicating environment configurations",
        "Setting up test environments with same variables"
      ],
      relations: {
        prerequisites: ["environment-info"],
        nextSteps: ["service_create_from_repo", "deployment_trigger"]
      }
    }),
    {
      sourceEnvironmentId: z.string().describe("ID of the environment to clone from"),
      targetProjectId: z.string().describe("ID of the project to clone to (can be same or different project)"),
      newEnvironmentName: z.string().describe("Name for the cloned environment"),
      includeVariables: z.boolean().optional().default(true).describe("Whether to copy variables from source environment (default: true)")
    },
    async ({ sourceEnvironmentId, targetProjectId, newEnvironmentName, includeVariables }) => {
      return environmentService.clone(sourceEnvironmentId, targetProjectId, newEnvironmentName, includeVariables);
    }
  ),

  createTool(
    "environment-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all environments in a Railway project",
      bestFor: [
        "Viewing all project environments",
        "Finding environment IDs",
        "Environment discovery"
      ],
      relations: {
        prerequisites: ["project_info"],
        nextSteps: ["environment-info", "variable_list", "service_list"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      includeEphemeral: z.boolean().optional().default(true).describe("Whether to include ephemeral/temporary environments (default: true)")
    },
    async ({ projectId, includeEphemeral }) => {
      return environmentService.list(projectId, includeEphemeral);
    }
  ),

  createTool(
    "environment-info",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a specific environment",
      bestFor: [
        "Viewing environment details",
        "Checking environment status"
      ],
      relations: {
        prerequisites: ["environment-list"],
        nextSteps: ["variable_list", "service_list", "deployment_list"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment")
    },
    async ({ environmentId }) => {
      return environmentService.get(environmentId);
    }
  ),

  createTool(
    "environment-deploy",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Trigger deployment for all services or a specific service in an environment",
      bestFor: [
        "Deploying all services in an environment",
        "Redeploying after configuration changes",
        "Environment-wide deployments"
      ],
      relations: {
        prerequisites: ["environment-info"],
        nextSteps: ["deployment_list", "deployment_logs"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().optional().describe("ID of a specific service to deploy (optional, if not provided all services will be deployed)")
    },
    async ({ environmentId, serviceId }) => {
      return environmentService.triggerDeploy(environmentId, serviceId);
    }
  )
];