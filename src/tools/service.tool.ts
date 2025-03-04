import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { serviceService } from '@/services/service.service.js';

export const serviceTools = [
  createTool(
    "service-list",
    "List all services in a specific project",
    {
      projectId: z.string().describe("ID of the project to list services for")
    },
    async ({ projectId }) => {
      return serviceService.listServices(projectId);
    }
  ),

  createTool(
    "service-info",
    "Get detailed information about a specific service",
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
      environmentId: z.string().describe("ID of the environment")
    },
    async ({ projectId, serviceId, environmentId }) => {
      return serviceService.getServiceInfo(projectId, serviceId, environmentId);
    }
  ),

  createTool(
    "service-create-from-repo",
    "Create a new service in a project from a GitHub repository, format as 'owner/repo'",
    {
      projectId: z.string().describe("ID of the project to create the service in"),
      repo: z.string().describe("GitHub repository URL, format as 'owner/repo'"),
      name: z.string().optional().describe("Custom name for the service (optional)")
    },
    async ({ projectId, repo, name }) => {
      return serviceService.createServiceFromRepo(projectId, repo, name);
    }
  ),

  createTool(
    "service-create-from-image",
    "Create a new service in a project from a Docker image",
    {
      projectId: z.string().describe("ID of the project to create the service in"),
      image: z.string().describe("Docker image name"),
      name: z.string().optional().describe("Custom name for the service (optional)")
    },
    async ({ projectId, image, name }) => {
      return serviceService.createServiceFromImage(projectId, image, name);
    }
  ),

  // TODO: Add validation for config
  // TODO: Test this
  createTool(
    "service-update",
    "Update service configuration",
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
      environmentId: z.string().describe("ID of the environment"),
      config: z.object({
        buildCommand: z.string().optional(),
        startCommand: z.string().optional(),
        rootDirectory: z.string().optional(),
        healthcheckPath: z.string().optional(),
        numReplicas: z.number().optional(),
        sleepApplication: z.boolean().optional()
      }).describe("Service configuration options")
    },
    async ({ projectId, serviceId, environmentId, config }) => {
      return serviceService.updateService(projectId, serviceId, environmentId, config);
    }
  ),

  createTool(
    "service-delete",
    "Delete a service from a project",
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
    },
    async ({ projectId, serviceId }) => {
      return serviceService.deleteService(projectId, serviceId);
    }
  ),

  createTool(
    "service-restart",
    "Restart a service in a specific environment",
    {
      serviceId: z.string().describe("ID of the service"),
      environmentId: z.string().describe("ID of the environment")
    },
    async ({ serviceId, environmentId }) => {
      return serviceService.restartService(serviceId, environmentId);
    }
  )
]; 