import { z } from 'zod';
import { createTool, formatToolDescription } from '@/utils/tools.js';
import { serviceService } from '@/services/service.service.js';
import { RegionCodeSchema } from '@/types.js';

export const serviceTools = [
  createTool(
    "service_list", // TODO: update this tool to also return the status of the service
    formatToolDescription({
      type: 'API',
      description: "List all services in a specific Railway project",
      bestFor: [
        "Getting an overview of a project's services",
        "Finding service IDs",
        "Checking service status",
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["service_info", "deployment_list"],
        related: ["project_info", "variable_list"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to list services from")
    },
    async ({ projectId }) => {
      return serviceService.listServices(projectId);
    }
  ),

  createTool(
    "service_info",
    formatToolDescription({
      type: 'API',
      description: "Get detailed information about a specific service",
      bestFor: [
        "Viewing service configuration and status",
        "Checking deployment details",
        "Monitoring service health"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_list", "variable_list"],
        related: ["service_update", "deployment_trigger"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      serviceId: z.string().describe("ID of the service to get information about"),
      environmentId: z.string().describe("ID of the environment to check (usually obtained from service_list)")
    },
    async ({ projectId, serviceId, environmentId }) => {
      return serviceService.getServiceInfo(projectId, serviceId, environmentId);
    }
  ),

  createTool(
    "service_create_from_repo",
    formatToolDescription({
      type: 'API',
      description: "Create a new service from a GitHub repository",
      bestFor: [
        "Deploying applications from source code",
        "Services that need build processes",
        "GitHub-hosted projects"
      ],
      notFor: [
        "Pre-built Docker images (use service_create_from_image)",
        "Database deployments (use database_deploy)",
        "Static file hosting"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["variable_set", "service_update"],
        alternatives: ["service_create_from_image", "database_deploy"],
        related: ["deployment_trigger", "service_info"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to create the service in"),
      repo: z.string().describe("GitHub repository URL or name (e.g., 'owner/repo')"),
      name: z.string().optional().describe("Optional custom name for the service")
    },
    async ({ projectId, repo, name }) => {
      return serviceService.createServiceFromRepo(projectId, repo, name);
    }
  ),

  createTool(
    "service_create_from_image",
    formatToolDescription({
      type: 'API',
      description: "Create a new service from a Docker image",
      bestFor: [
        "Custom database deployments",
        "Pre-built container deployments",
        "Specific version requirements"
      ],
      notFor: [
        "Standard database deployments (use database_deploy)",
        "GitHub repository deployments (use service_create_from_repo)",
        "Services needing build process"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["variable_set", "service_update", "tcp_proxy_create"],
        alternatives: ["database_deploy", "service_create_from_repo"],
        related: ["volume_create", "deployment_trigger"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project to create the service in"),
      image: z.string().describe("Docker image to use (e.g., 'postgres:13-alpine')"),
      name: z.string().optional().describe("Optional custom name for the service")
    },
    async ({ projectId, image, name }) => {
      return serviceService.createServiceFromImage(projectId, image, name);
    }
  ),

  // TODO: Add validation for config
  // TODO: Test this
  createTool(
    "service_update",
    formatToolDescription({
      type: 'API',
      description: "Update a service's configuration",
      bestFor: [
        "Changing service settings",
        "Updating resource limits",
        "Modifying deployment configuration"
      ],
      notFor: [
        "Updating environment variables (use variable_set)",
        "Restarting services (use service_restart)",
        "Triggering new deployments (use deployment_trigger)"
      ],
      relations: {
        prerequisites: ["service_list", "service_info"],
        nextSteps: ["deployment_trigger"],
        related: ["service_restart", "variable_set"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      serviceId: z.string().describe("ID of the service to update"),
      environmentId: z.string().describe("ID of the environment to update (usually obtained from service_info)"),
      region: RegionCodeSchema.optional().describe("Optional: Region to deploy the service in"),
      rootDirectory: z.string().optional().describe("Optional: Root directory containing the service code"),
      buildCommand: z.string().optional().describe("Optional: Command to build the service"),
      startCommand: z.string().optional().describe("Optional: Command to start the service"),
      numReplicas: z.number().optional().describe("Optional: Number of service replicas to run"),
      healthcheckPath: z.string().optional().describe("Optional: Path for health checks"),
      sleepApplication: z.boolean().optional().describe("Optional: Whether to enable sleep mode")
    },
    async ({ projectId, serviceId, environmentId, ...config }) => {
      return serviceService.updateService(projectId, serviceId, environmentId, config);
    }
  ),

  createTool(
    "service_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a service from a project",
      bestFor: [
        "Removing unused services",
        "Cleaning up test services",
        "Project reorganization"
      ],
      notFor: [
        "Temporary service stoppage (use service_restart)",
        "Updating service configuration (use service_update)"
      ],
      relations: {
        prerequisites: ["service_list", "service_info"],
        alternatives: ["service_restart"],
        related: ["project_delete"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      serviceId: z.string().describe("ID of the service to delete")
    },
    async ({ projectId, serviceId }) => {
      return serviceService.deleteService(projectId, serviceId);
    }
  ),

  createTool(
    "service_restart",
    formatToolDescription({
      type: 'API',
      description: "Restart a service in a specific environment",
      bestFor: [
        "Applying configuration changes",
        "Clearing service state",
        "Resolving runtime issues"
      ],
      notFor: [
        "Deploying new code (use deployment_trigger)",
        "Updating service config (use service_update)",
        "Long-term service stoppage (use service_delete)"
      ],
      relations: {
        prerequisites: ["service_list"],
        alternatives: ["deployment_trigger"],
        related: ["service_info", "deployment_logs"]
      }
    }),
    {
      serviceId: z.string().describe("ID of the service to restart"),
      environmentId: z.string().describe("ID of the environment where the service should be restarted (usually obtained from service_info)")
    },
    async ({ serviceId, environmentId }) => {
      return serviceService.restartService(serviceId, environmentId);
    }
  )
]; 