import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { deploymentService } from '@/services/deployment.service.js';

export const deploymentTools = [
  createTool(
    "deployment-list",
    "List recent deployments for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service"),
      limit: z.number().optional().describe("Maximum number of deployments to list")
    },
    async ({ projectId, environmentId, serviceId, limit = 5 }) => {
      return deploymentService.listDeployments(projectId, serviceId, environmentId, limit);
    }
  ),

  createTool(
    "deployment-trigger",
    "Trigger a new deployment for a service",
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
      environmentId: z.string().describe("ID of the environment"),
      commitSha: z.string().optional().describe("Specific commit SHA to deploy")
    },
    async ({ projectId, serviceId, environmentId, commitSha }) => {
      return deploymentService.triggerDeployment(projectId, serviceId, environmentId, commitSha);
    }
  ),

  createTool(
    "deployment-logs",
    "Get logs for a specific deployment",
    {
      deploymentId: z.string().describe("ID of the deployment"),
      type: z.enum(['build', 'deployment']).optional().describe("Type of logs to fetch"),
      limit: z.number().optional().describe("Maximum number of log entries to fetch")
    },
    async ({ deploymentId, type = 'deployment', limit = 100 }) => {
      return deploymentService.getDeploymentLogs(deploymentId, type, limit);
    }
  ),

  createTool(
    "deployment-health-check",
    "Check the health/status of a deployment",
    {
      deploymentId: z.string().describe("ID of the deployment to check")
    },
    async ({ deploymentId }) => {
      return deploymentService.healthCheckDeployment(deploymentId);
    }
  )
]; 