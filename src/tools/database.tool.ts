// src/tools/database.tool.ts
import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { databaseService } from '@/services/database.service.js';
import { DatabaseType, RegionCodeSchema } from '@/types.js';

export const databaseTools = [
  createTool(
    "database_list_types",
    formatToolDescription({
      type: 'QUERY',
      description: "List all available database types that can be deployed using Railway's official templates",
      bestFor: [
        "Discovering supported database types",
        "Planning database deployments",
        "Checking template availability"
      ],
      notFor: [
        "Listing existing databases",
        "Getting database connection details"
      ],
      relations: {
        nextSteps: ["database_deploy"],
        alternatives: ["service_create_from_image"],
        related: ["database_deploy", "service_create_from_image"]
      }
    }),
    {},
    async () => {
      return databaseService.listDatabaseTypes();
    }
  ),

  createTool(
    "database_deploy_from_template",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Deploy a pre-configured database using Railway's official templates and best practices",
      bestFor: [
        "Standard database deployments",
        "Quick setup with security defaults",
        "Common database types (PostgreSQL, MongoDB, Redis)"
      ],
      notFor: [
        "Custom database versions",
        "Complex configurations",
        "Unsupported database types"
      ],
      relations: {
        prerequisites: ["database_list_types"],
        alternatives: ["service_create_from_image"],
        nextSteps: ["variable_list", "service_info"],
        related: ["volume_create", "service_update"]
      }
    }),
    {
      projectId: z.string().describe(
        "ID of the project where the database will be deployed"
      ),
      type: z.nativeEnum(DatabaseType).describe(
        "Type of database to deploy (e.g., postgresql, mongodb, redis). Use service_create_from_image for other types."
      ),
      region: RegionCodeSchema.describe(
        "Region where the database should be deployed"
      ),
      environmentId: z.string().describe(
        "Environment ID where the database will be deployed (usually obtained from project_info)"
      ),
      name: z.string().optional().describe(
        "Optional custom name for the database service. Default: {type}-database"
      )
    },
    async ({ projectId, type, environmentId, region, name }) => {
      return databaseService.createDatabaseFromTemplate(projectId, type, region, environmentId, name);
    }
  )
];