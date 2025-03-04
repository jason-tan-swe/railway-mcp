import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { databaseService } from '@/services/database.service.js';
import { DatabaseType } from '@/types.js';

export const databaseTools = [
  createTool(
    "database-list-types",
    "List all available database types that can be deployed",
    {},
    async () => {
      return databaseService.listDatabaseTypes();
    }
  ),

  createTool(
    "database-deploy",
    "Deploy a database service",
    {
      projectId: z.string().describe("ID of the project to deploy the database in"),
      type: z.nativeEnum(DatabaseType).describe("Type of database to deploy"),
      name: z.string().optional().describe("Custom name for the database service (optional)")
    },
    async ({ projectId, type, name }) => {
      return databaseService.createDatabase(projectId, type, name);
    }
  )
]; 