import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { variableService } from '@/services/variable.service.js';

export const variableTools = [
  createTool(
    "list_service_variables",
    formatToolDescription({
      type: 'API',
      description: "List all environment variables for a service",
      bestFor: [
        "Viewing service configuration",
        "Auditing environment variables",
        "Checking connection strings"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["variable_set", "variable_delete"],
        related: ["service_info", "variable_bulk_set"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      environmentId: z.string().describe("ID of the environment to list variables from (usually obtained from service_list)"),
      serviceId: z.string().optional().describe("Optional: ID of the service to list variables for, if not provided, shared variables across all services will be listed")
    },
    async ({ projectId, environmentId, serviceId }) => {
      return variableService.listVariables(projectId, environmentId, serviceId);
    }
  ),

  createTool(
    "variable_set",
    formatToolDescription({
      type: 'API',
      description: "Create or update an environment variable",
      bestFor: [
        "Setting configuration values",
        "Updating connection strings",
        "Managing service secrets"
      ],
      notFor: [
        "Bulk variable updates (use variable_bulk_set)",
        "Temporary configuration changes"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_trigger", "service_restart"],
        alternatives: ["variable_bulk_set"],
        related: ["variable_list", "variable_delete"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      environmentId: z.string().describe("ID of the environment for the variable (usually obtained from service_list)"),
      name: z.string().describe("Name of the environment variable"),
      value: z.string().describe("Value to set for the variable"),
      serviceId: z.string().optional().describe("Optional: ID of the service for the variable, if omitted creates/updates a shared variable")
    },
    async ({ projectId, environmentId, name, value, serviceId }) => {
      return variableService.upsertVariable(projectId, environmentId, name, value, serviceId);
    }
  ),

  createTool(
    "variable_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a variable for a service in a specific environment",
      bestFor: [
        "Removing unused configuration",
        "Security cleanup",
        "Configuration management"
      ],
      notFor: [
        "Temporary variable disabling",
        "Bulk variable removal"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_trigger", "service_restart"],
        related: ["variable_list", "variable_set"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment to delete the variable from (usually obtained from service_list)"),
      name: z.string().describe("Name of the variable to delete"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted deletes a shared variable)")
    },
    async ({ projectId, environmentId, name, serviceId }) => {
      return variableService.deleteVariable(projectId, environmentId, name, serviceId);
    }
  ),

  // TODO: Test this better
  createTool(
    "variable_bulk_set",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Create or update multiple environment variables at once",
      bestFor: [
        "Migrating configuration between services",
        "Initial service setup",
        "Bulk configuration updates"
      ],
      notFor: [
        "Single variable updates (use variable_set)",
        "Temporary configuration changes"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_trigger", "service_restart"],
        alternatives: ["variable_set"],
        related: ["variable_list", "service_update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      environmentId: z.string().describe("ID of the environment for the variables (usually obtained from service_list)"),
      variables: z.record(z.string()).describe("Object mapping variable names to values"),
      serviceId: z.string().optional().describe("Optional: ID of the service for the variables, if omitted updates shared variables)")
    },
    async ({ projectId, environmentId, variables, serviceId }) => {
      return variableService.bulkUpsertVariables(projectId, environmentId, variables, serviceId);
    }
  ),

  // TODO: Test this
  createTool(
    "variable_copy",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Copy variables from one environment to another",
      bestFor: [
        "Environment migration",
        "Configuration sharing",
        "Environment duplication"
      ],
      notFor: [
        "Single variable updates (use variable_set)",
        "Temporary configuration changes"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_trigger", "service_restart"],
        alternatives: ["variable_set"],
        related: ["variable_list", "service_update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      sourceEnvironmentId: z.string().describe("ID of the source environment (usually obtained from project_info)"),
      targetEnvironmentId: z.string().describe("ID of the target environment (usually obtained from project_info)"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted copies shared variables)"),
      overwrite: z.boolean().optional().default(false).describe("Whether to overwrite existing variables in the target environment")
    },
    async ({ projectId, sourceEnvironmentId, targetEnvironmentId, serviceId, overwrite = false }) => {
      return variableService.copyVariables(projectId, sourceEnvironmentId, targetEnvironmentId, serviceId, overwrite);
    }
  )
]; 