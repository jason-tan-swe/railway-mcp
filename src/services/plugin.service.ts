import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";
import { DATABASE_CONFIGS, DatabaseType } from "../types.js";

export class PluginService extends BaseService {
  constructor() {
    super();
  }

  async create(projectId: string, pluginName: string, environmentId?: string, friendlyName?: string) {
    try {
      // Validate plugin name against supported databases
      const dbConfig = Object.values(DATABASE_CONFIGS).find(
        config => config.name.toLowerCase() === pluginName.toLowerCase() ||
                  config.type === pluginName.toLowerCase()
      );

      if (!dbConfig) {
        return createErrorResponse(
          `Unsupported plugin type: ${pluginName}. Supported types: ${Object.keys(DATABASE_CONFIGS).join(', ')}`
        );
      }

      const plugin = await this.client.plugins.create({
        projectId,
        name: pluginName,
        environmentId,
        friendlyName: friendlyName || dbConfig.name
      });

      return createSuccessResponse({
        text: `${dbConfig.name} plugin created successfully`,
        data: {
          id: plugin.id,
          name: plugin.name,
          friendlyName: plugin.friendlyName,
          status: plugin.status,
          type: dbConfig.type,
          category: dbConfig.category,
          connectionInfo: {
            defaultPort: dbConfig.defaultPort,
            variables: dbConfig.variables,
            connectionStringPattern: dbConfig.connectionStringPattern
          }
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create plugin: ${formatError(error)}`);
    }
  }

  async get(pluginId: string) {
    try {
      const plugin = await this.client.plugins.get(pluginId);
      
      // Try to determine the database type
      const dbConfig = Object.values(DATABASE_CONFIGS).find(
        config => config.name.toLowerCase() === plugin.name.toLowerCase()
      );

      return createSuccessResponse({
        text: `Retrieved ${plugin.friendlyName || plugin.name} plugin`,
        data: {
          id: plugin.id,
          name: plugin.name,
          friendlyName: plugin.friendlyName,
          status: plugin.status,
          logsEnabled: plugin.logsEnabled,
          createdAt: plugin.createdAt,
          ...(dbConfig && {
            type: dbConfig.type,
            category: dbConfig.category,
            connectionInfo: {
              defaultPort: dbConfig.defaultPort,
              variables: dbConfig.variables
            }
          })
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get plugin: ${formatError(error)}`);
    }
  }

  async update(pluginId: string, friendlyName?: string, logsEnabled?: boolean) {
    try {
      const plugin = await this.client.plugins.update(pluginId, {
        friendlyName,
        logsEnabled
      });

      return createSuccessResponse({
        text: `Plugin updated successfully`,
        data: {
          id: plugin.id,
          name: plugin.name,
          friendlyName: plugin.friendlyName,
          logsEnabled: plugin.logsEnabled
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update plugin: ${formatError(error)}`);
    }
  }

  async delete(pluginId: string, environmentId?: string) {
    try {
      const success = await this.client.plugins.delete(pluginId, environmentId);
      
      if (success) {
        return createSuccessResponse({
          text: "Plugin deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete plugin");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete plugin: ${formatError(error)}`);
    }
  }

  async restart(pluginId: string, environmentId: string) {
    try {
      const plugin = await this.client.plugins.restart(pluginId, environmentId);
      
      return createSuccessResponse({
        text: `Plugin restarted successfully`,
        data: {
          id: plugin.id,
          name: plugin.name,
          status: plugin.status
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to restart plugin: ${formatError(error)}`);
    }
  }

  async resetCredentials(pluginId: string) {
    try {
      const success = await this.client.plugins.resetCredentials(pluginId);
      
      if (success) {
        return createSuccessResponse({
          text: "Plugin credentials reset successfully. New credentials will be available in environment variables."
        });
      } else {
        return createErrorResponse("Failed to reset plugin credentials");
      }
    } catch (error) {
      return createErrorResponse(`Failed to reset plugin credentials: ${formatError(error)}`);
    }
  }

  async listSupportedTypes() {
    try {
      const databases = Object.entries(DATABASE_CONFIGS).map(([key, config]) => ({
        type: config.type,
        name: config.name,
        category: config.category,
        description: config.description,
        defaultPort: config.defaultPort,
        variables: config.variables
      }));

      const byCategory = databases.reduce((acc, db) => {
        if (!acc[db.category]) acc[db.category] = [];
        acc[db.category].push(db);
        return acc;
      }, {} as Record<string, typeof databases>);

      return createSuccessResponse({
        text: `${databases.length} database types supported`,
        data: {
          totalCount: databases.length,
          byCategory,
          databases
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list supported plugin types: ${formatError(error)}`);
    }
  }
}

export const pluginService = new PluginService();