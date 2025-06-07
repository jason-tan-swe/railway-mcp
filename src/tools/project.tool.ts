import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { projectService } from '@/services/project.service.js';

export const projectTools = [
  createTool(
    "project_list",
    formatToolDescription({
      type: 'API',
      description: "List all projects in your Railway account",
      bestFor: [
        "Getting an overview of all projects",
        "Finding project IDs",
        "Project discovery and management"
      ],
      relations: {
        nextSteps: ["project_info", "service_list"],
        related: ["project_create", "project_delete"]
      }
    }),
    {},
    async () => {
      return projectService.listProjects();
    }
  ),

  createTool(
    "project_info",
    formatToolDescription({
      type: 'API',
      description: "Get detailed information about a specific Railway project",
      bestFor: [
        "Viewing project details and status",
        "Checking environments and services",
        "Project configuration review"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["service_list", "variable_list"],
        related: ["project_update", "project_delete"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to get information about")
    },
    async ({ projectId }) => {
      return projectService.getProject(projectId);
    }
  ),

  createTool(
    "project_create",
    formatToolDescription({
      type: 'API',
      description: "Create a new Railway project",
      bestFor: [
        "Starting new applications",
        "Setting up development environments",
        "Creating project spaces"
      ],
      notFor: [
        "Duplicating existing projects",
      ],
      relations: {
        nextSteps: [
          "service_create_from_repo",
          "service_create_from_image",
          "database_deploy"
        ],
        related: ["project_delete", "project_update"]
      }
    }),
    {
      name: z.string().describe("Name for the new project"),
      teamId: z.string().optional().describe("Optional team ID to create the project under")
    },
    async ({ name, teamId }) => {
      return projectService.createProject(name, teamId);
    }
  ),

  createTool(
    "project_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a Railway project and all its resources",
      bestFor: [
        "Removing unused projects",
        "Cleaning up test projects",
      ],
      notFor: [
        "Temporary project deactivation",
        "Service-level cleanup (use service_delete)"
      ],
      relations: {
        prerequisites: ["project_list", "project_info"],
        alternatives: ["service_delete"],
        related: ["project_create"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to delete")
    },
    async ({ projectId }) => {
      return projectService.deleteProject(projectId);
    }
  ),

  createTool(
    "project_delete_batch",
    formatToolDescription({
      type: 'API',
      description: "Delete multiple Railway projects in batch",
      bestFor: [
        "Bulk cleanup of test projects",
        "Removing multiple unused projects efficiently",
      ],
      notFor: [
        "Single project deletion (use project_delete)",
        "Production project cleanup"
      ],
      relations: {
        prerequisites: ["project_list"],
        related: ["project_delete", "project_create"]
      }
    }),
    {
      projectIds: z.array(z.string()).describe("Array of project IDs to delete")
    },
    async ({ projectIds }) => {
      return projectService.deleteProjects(projectIds);
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