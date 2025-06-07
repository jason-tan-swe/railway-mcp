import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { pluginService } from "../services/plugin.service.js";

export const pluginTools = [
  createTool(
    "plugin-create",
    formatToolDescription({
      type: 'API',
      description: "Create a database plugin in a Railway project",
      bestFor: [
        "Adding databases to projects",
        "Setting up PostgreSQL, MySQL, Redis, MongoDB",
        "Creating database instances"
      ],
      notFor: [
        "Deploying custom databases (use service-create-from-image)",
        "Database templates (use template-deploy)"
      ],
      relations: {
        prerequisites: ["project_list", "environment-list"],
        nextSteps: ["plugin-get", "variable_list", "logs-plugin"],
        alternatives: ["database_deploy"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      pluginName: z.string().describe("Database type (e.g., 'postgresql', 'mysql', 'redis', 'mongodb')"),
      environmentId: z.string().optional().describe("Environment to create the plugin in"),
      friendlyName: z.string().optional().describe("Custom display name for the plugin")
    },
    async ({ projectId, pluginName, environmentId, friendlyName }) => {
      return pluginService.create(projectId, pluginName, environmentId, friendlyName);
    }
  ),

  createTool(
    "plugin-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get details about a database plugin",
      bestFor: [
        "Viewing plugin configuration",
        "Checking database status",
        "Getting connection information"
      ],
      relations: {
        prerequisites: ["plugin-create", "project_info"],
        nextSteps: ["plugin-update", "plugin-restart", "variable_list"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin")
    },
    async ({ pluginId }) => {
      return pluginService.get(pluginId);
    }
  ),

  createTool(
    "plugin-update",
    formatToolDescription({
      type: 'API',
      description: "Update a database plugin configuration",
      bestFor: [
        "Renaming plugins",
        "Enabling/disabling logs",
        "Updating plugin settings"
      ],
      relations: {
        prerequisites: ["plugin-get"],
        nextSteps: ["plugin-get", "plugin-restart"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin"),
      friendlyName: z.string().optional().describe("New display name"),
      logsEnabled: z.boolean().optional().describe("Enable or disable logs")
    },
    async ({ pluginId, friendlyName, logsEnabled }) => {
      return pluginService.update(pluginId, friendlyName, logsEnabled);
    }
  ),

  createTool(
    "plugin-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a database plugin",
      bestFor: [
        "Removing unused databases",
        "Cleaning up plugins",
        "Deleting test databases"
      ],
      notFor: [
        "Backing up data (data will be lost)"
      ],
      relations: {
        prerequisites: ["plugin-get"],
        related: ["plugin-create"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin to delete"),
      environmentId: z.string().optional().describe("Environment ID (for environment-specific deletion)")
    },
    async ({ pluginId, environmentId }) => {
      return pluginService.delete(pluginId, environmentId);
    }
  ),

  createTool(
    "plugin-restart",
    formatToolDescription({
      type: 'API',
      description: "Restart a database plugin",
      bestFor: [
        "Resolving database issues",
        "Applying configuration changes",
        "Recovering from crashes"
      ],
      relations: {
        prerequisites: ["plugin-get"],
        nextSteps: ["plugin-get", "logs-plugin"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin"),
      environmentId: z.string().describe("ID of the environment")
    },
    async ({ pluginId, environmentId }) => {
      return pluginService.restart(pluginId, environmentId);
    }
  ),

  createTool(
    "plugin-reset-credentials",
    formatToolDescription({
      type: 'API',
      description: "Reset database plugin credentials",
      bestFor: [
        "Security rotation",
        "Recovering from compromised credentials",
        "Resetting passwords"
      ],
      relations: {
        prerequisites: ["plugin-get"],
        nextSteps: ["variable_list", "service_restart"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin")
    },
    async ({ pluginId }) => {
      return pluginService.resetCredentials(pluginId);
    }
  ),

  createTool(
    "plugin-types",
    formatToolDescription({
      type: 'QUERY',
      description: "List all supported database plugin types",
      bestFor: [
        "Discovering available databases",
        "Viewing database options",
        "Understanding connection variables"
      ],
      relations: {
        nextSteps: ["plugin-create"],
        alternatives: ["database_list_types"]
      }
    }),
    {},
    async () => {
      return pluginService.listSupportedTypes();
    }
  )
];