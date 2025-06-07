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
];