import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { projectService } from '@/services/project.service.js';

export const projectTools = [
  createTool(
    "project_list",
    "List all projects",
    {},
    async () => {
      return projectService.listProjects();
    }
  ),

  createTool(
    "project_info",
    "Get detailed information about a specific project",
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({projectId}) => {
      return projectService.getProject(projectId);
    }
  ),

  createTool(
    "project_create",
    "Create a new project",
    {
      name: z.string().describe("Name of the project"),
      teamId: z.string().optional().describe("ID of the team to create the project in (optional)")
    },
    async ({name, teamId}) => {
      return projectService.createProject(name, teamId);
    }
  ),

  createTool(
    "project_delete",
    "Delete a project",
    {
      projectId: z.string().describe("ID of the project to delete")
    },
    async ({projectId}) => {
      return projectService.deleteProject(projectId);
    }
  ),

  createTool(
    "project_environments",
    "List all environments in a project",
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({projectId}) => {
      return projectService.listEnvironments(projectId);
    }
  )
]; 