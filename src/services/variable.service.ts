import { BaseService } from '@/services/base.service.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';

export class VariableService extends BaseService {

  public constructor() {
    super();
  }

  async listVariables(projectId: string, environmentId: string, serviceId?: string) {
    try {
      const variables = await this.client.variables.getVariables(projectId, environmentId, serviceId);
      
      if (Object.keys(variables).length === 0) {
        return createSuccessResponse({
          text: serviceId
            ? "No variables found for this service in this environment."
            : "No shared variables found in this environment.",
          data: {}
        });
      }

      const context = serviceId ? "service variables" : "shared environment variables";
      const formattedVars = Object.entries(variables)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      return createSuccessResponse({
        text: `Current ${context}:\n\n${formattedVars}`,
        data: variables
      });
    } catch (error) {
      return createErrorResponse(`Error listing variables: ${formatError(error)}`);
    }
  }

  async upsertVariable(projectId: string, environmentId: string, name: string, value: string, serviceId?: string) {
    try {
      await this.client.variables.upsertVariable({
        projectId,
        environmentId,
        name,
        value,
        serviceId
      });

      const variableType = serviceId ? "service variable" : "shared environment variable";
      return createSuccessResponse({
        text: `Successfully set ${variableType} "${name}"`
      });
    } catch (error) {
      return createErrorResponse(`Error setting variable: ${formatError(error)}`);
    }
  }

  async deleteVariable(projectId: string, environmentId: string, name: string, serviceId?: string) {
    try {
      await this.client.variables.deleteVariable({
        projectId,
        environmentId,
        name,
        serviceId
      });

      const variableType = serviceId ? "service variable" : "shared environment variable";
      return createSuccessResponse({
        text: `Successfully deleted ${variableType} "${name}"`
      });
    } catch (error) {
      return createErrorResponse(`Error deleting variable: ${formatError(error)}`);
    }
  }

  async bulkUpsertVariables(projectId: string, environmentId: string, variables: Record<string, string>, serviceId?: string) {
    try {
      const inputs = Object.entries(variables).map(([name, value]) => ({
        projectId,
        environmentId,
        name,
        value,
        serviceId
      }));

      await this.client.variables.upsertVariables(inputs);

      const variableType = serviceId ? "service variables" : "shared environment variables";
      return createSuccessResponse({
        text: `Successfully updated ${inputs.length} ${variableType}`
      });
    } catch (error) {
      return createErrorResponse(`Error updating variables: ${formatError(error)}`);
    }
  }

  async copyVariables(projectId: string, sourceEnvironmentId: string, targetEnvironmentId: string, serviceId?: string, overwrite: boolean = false) {
    try {
      // Get variables from source environment
      const sourceVars = await this.client.variables.getVariables(projectId, sourceEnvironmentId, serviceId);

      if (Object.keys(sourceVars).length === 0) {
        return createSuccessResponse({
          text: "No variables found in source environment to copy.",
          data: { copied: 0 }
        });
      }

      // Get variables from target environment
      const targetVars = await this.client.variables.getVariables(projectId, targetEnvironmentId, serviceId);

      // If not overwriting, filter out variables that already exist in target
      const varsToSet = overwrite
        ? sourceVars
        : Object.fromEntries(
            Object.entries(sourceVars).filter(([key]) => !(key in targetVars))
          );

      if (Object.keys(varsToSet).length === 0) {
        return createSuccessResponse({
          text: "All variables already exist in target environment.",
          data: { copied: 0 }
        });
      }

      // Bulk update the variables
      await this.bulkUpsertVariables(projectId, targetEnvironmentId, varsToSet, serviceId);

      const variableType = serviceId ? "service variables" : "shared environment variables";
      return createSuccessResponse({
        text: `Successfully copied ${Object.keys(varsToSet).length} ${variableType} to target environment`,
        data: { copied: Object.keys(varsToSet).length }
      });
    } catch (error) {
      return createErrorResponse(`Error copying variables: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const variableService = new VariableService();
