import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class EnvironmentService extends BaseService {
  constructor() {
    super();
  }

  async create(projectId: string, name: string, isEphemeral: boolean = false) {
    try {
      const environment = await this.client.environments.create(projectId, name, isEphemeral);
      
      return createSuccessResponse({
        text: `Environment '${environment.name}' created successfully`,
        data: {
          id: environment.id,
          name: environment.name,
          projectId: environment.projectId,
          isEphemeral: environment.isEphemeral,
          createdAt: environment.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create environment: ${formatError(error)}`);
    }
  }

  async delete(environmentId: string) {
    try {
      const success = await this.client.environments.delete(environmentId);
      
      if (success) {
        return createSuccessResponse({ text: "Environment deleted successfully" });
      } else {
        return createErrorResponse("Failed to delete environment");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete environment: ${formatError(error)}`);
    }
  }

  async update(environmentId: string, name: string) {
    try {
      const environment = await this.client.environments.rename(environmentId, name);
      
      return createSuccessResponse({
        text: `Environment renamed to '${environment.name}'`,
        data: {
          id: environment.id,
          name: environment.name,
          projectId: environment.projectId,
          updatedAt: environment.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update environment: ${formatError(error)}`);
    }
  }

  async clone(sourceEnvironmentId: string, targetProjectId: string, newEnvironmentName: string, includeVariables: boolean = true) {
    try {
      // First, get the source environment details
      const sourceEnv = await this.client.environments.get(sourceEnvironmentId);
      
      // Create the new environment
      const newEnv = await this.client.environments.create(
        targetProjectId,
        newEnvironmentName,
        sourceEnv.isEphemeral
      );

      let variablesCopied = 0;

      // If requested, copy variables from source to target
      if (includeVariables) {
        try {
          const variablesMap = await this.client.variables.getVariables(
            sourceEnv.projectId,
            sourceEnvironmentId,
            undefined
          );
          const variables = Object.entries(variablesMap).map(([name, value]) => ({ name, value }));

          // Copy each variable to the new environment
          for (const variable of variables) {
            await this.client.variables.upsertVariable({
              projectId: targetProjectId,
              environmentId: newEnv.id,
              serviceId: undefined,
              name: variable.name,
              value: variable.value
            });
            variablesCopied++;
          }
        } catch (varError) {
          console.error("Error copying variables:", varError);
          // Continue even if variable copy fails
        }
      }

      return createSuccessResponse({
        text: `Environment '${newEnv.name}' cloned successfully${includeVariables ? ` with ${variablesCopied} variables` : ''}`,
        data: {
          id: newEnv.id,
          name: newEnv.name,
          projectId: newEnv.projectId,
          sourceEnvironmentId: sourceEnvironmentId,
          variablesCopied: variablesCopied
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to clone environment: ${formatError(error)}`);
    }
  }

  async list(projectId: string, includeEphemeral: boolean = true) {
    try {
      const environments = await this.client.environments.list(
        projectId,
        includeEphemeral ? undefined : false
      );

      const formattedEnvironments = environments.map(env => ({
        id: env.id,
        name: env.name,
        isEphemeral: env.isEphemeral,
        createdAt: env.createdAt,
        updatedAt: env.updatedAt
      }));

      return createSuccessResponse({
        text: `Found ${environments.length} environment(s)`,
        data: formattedEnvironments
      });
    } catch (error) {
      return createErrorResponse(`Failed to list environments: ${formatError(error)}`);
    }
  }

  async get(environmentId: string) {
    try {
      const environment = await this.client.environments.get(environmentId);
      
      return createSuccessResponse({
        text: `Environment '${environment.name}' retrieved`,
        data: {
          id: environment.id,
          name: environment.name,
          projectId: environment.projectId,
          isEphemeral: environment.isEphemeral,
          createdAt: environment.createdAt,
          updatedAt: environment.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get environment: ${formatError(error)}`);
    }
  }

  async triggerDeploy(environmentId: string, serviceId?: string) {
    try {
      const success = await this.client.environments.triggerDeploy(environmentId, serviceId);
      
      if (success) {
        return createSuccessResponse({
          text: serviceId 
            ? "Deployment triggered for service in environment"
            : "Deployment triggered for all services in environment"
        });
      } else {
        return createErrorResponse("Failed to trigger deployment");
      }
    } catch (error) {
      return createErrorResponse(`Failed to trigger deployment: ${formatError(error)}`);
    }
  }
}

export const environmentService = new EnvironmentService();