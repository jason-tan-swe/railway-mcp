import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { variableService } from '@/services/variable.service.js';

export const variableTools = [
  createTool(
    "variable_list",
    "List variables for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted lists shared variables)")
    },
    async ({ projectId, environmentId, serviceId }) => {
      return variableService.listVariables(projectId, environmentId, serviceId);
    }
  ),

  createTool(
    "variable_set",
    "Create or update a variable for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
      name: z.string().describe("Name of the variable"),
      value: z.string().describe("Value of the variable"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted creates/updates a shared variable)")
    },
    async ({ projectId, environmentId, name, value, serviceId }) => {
      return variableService.upsertVariable(projectId, environmentId, name, value, serviceId);
    }
  ),

  createTool(
    "variable_delete",
    "Delete a variable for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
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
    "Bulk update variables for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
      variables: z.record(z.string()).describe("Object mapping variable names to values"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted updates shared variables)")
    },
    async ({ projectId, environmentId, variables, serviceId }) => {
      return variableService.bulkUpsertVariables(projectId, environmentId, variables, serviceId);
    }
  ),

  // TODO: Test this
  createTool(
    "variable_copy",
    "Copy variables from one environment to another",
    {
      projectId: z.string().describe("ID of the project"),
      sourceEnvironmentId: z.string().describe("ID of the source environment"),
      targetEnvironmentId: z.string().describe("ID of the target environment"),
      serviceId: z.string().optional().describe("ID of the service (optional, if omitted copies shared variables)"),
      overwrite: z.boolean().optional().default(false).describe("Whether to overwrite existing variables in the target environment")
    },
    async ({ projectId, sourceEnvironmentId, targetEnvironmentId, serviceId, overwrite = false }) => {
      return variableService.copyVariables(projectId, sourceEnvironmentId, targetEnvironmentId, serviceId, overwrite);
    }
  )
]; 