import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { deploymentService } from '@/services/deployment.service.js';

export const deploymentTools = [
  createTool(
    "deployment_list",
    formatToolDescription({
      type: 'API',
      description: "List recent deployments for a service in a specific environment",
      bestFor: [
        "Viewing deployment history",
        "Monitoring service updates"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_logs", "deployment_trigger"],
        related: ["service_info", "service_restart"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      serviceId: z.string().describe("ID of the service to list deployments for"),
      environmentId: z.string().describe("ID of the environment to list deployments from (usually obtained from service_list)"),
      limit: z.number().optional().describe("Optional: Maximum number of deployments to return (default: 10)")
    },
    async ({ projectId, serviceId, environmentId, limit = 10 }) => {
      return deploymentService.listDeployments(projectId, serviceId, environmentId, limit);
    }
  ),

  createTool(
    "deployment_trigger",
    formatToolDescription({
      type: 'API',
      description: "Trigger a new deployment for a service",
      bestFor: [
        "Deploying code changes",
        "Applying configuration updates",
        "Rolling back to previous states"
      ],
      notFor: [
        "Restarting services (use service_restart)",
        "Updating service config (use service_update)",
        "Database changes"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["deployment_logs", "deployment_status"],
        alternatives: ["service_restart"],
        related: ["variable_set", "service_update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
      environmentId: z.string().describe("ID of the environment"),
      commitSha: z.string().describe("Specific commit SHA from the Git repository")
    },
    async ({ projectId, serviceId, environmentId, commitSha }) => {
      return deploymentService.triggerDeployment(projectId, serviceId, environmentId, commitSha);
    }
  ),

  createTool(
    "deployment_logs",
    formatToolDescription({
      type: 'API',
      description: "Get logs for a specific deployment",
      bestFor: [
        "Debugging deployment issues",
        "Monitoring deployment progress",
        "Checking build output"
      ],
      notFor: [
        "Service runtime logs",
        "Database logs"
      ],
      relations: {
        prerequisites: ["deployment_list"],
        nextSteps: ["deployment_status"],
        related: ["service_info", "deployment_trigger"]
      }
    }),
    {
      deploymentId: z.string().describe("ID of the deployment to get logs for"),
      limit: z.number().optional().describe("Maximum number of log entries to fetch")
    },
    async ({ deploymentId, limit = 100 }) => {
      return deploymentService.getDeploymentLogs(deploymentId, limit);
    }
  ),

  createTool(
    "deployment_status",
    formatToolDescription({
      type: 'API',
      description: "Check the current status of a deployment",
      bestFor: [
        "Monitoring deployment progress",
        "Verifying successful deployments",
        "Checking for deployment failures"
      ],
      notFor: [
        "Service runtime logs",
        "Database logs"
      ],
      relations: {
        prerequisites: ["deployment_list", "deployment_trigger"],
        nextSteps: ["deployment_logs"],
        related: ["service_info", "service_restart", "deployment_wait"]
      }
    }),
    {
      deploymentId: z.string().describe("ID of the deployment to check status for")
    },
    async ({ deploymentId }) => {
      return deploymentService.healthCheckDeployment(deploymentId);
    }
  )
]; 