import { BaseService } from '@/services/base.service.js';
import { DeploymentLog } from '@/types.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { getStatusEmoji } from '@/utils/helpers.js';

export class DeploymentService extends BaseService {
  public constructor() {
    super();
  }

  async listDeployments(projectId: string, serviceId: string, environmentId: string, limit: number = 5) {
    try {
      const deployments = await this.client.deployments.listDeployments({
        projectId,
        serviceId,
        environmentId,
        limit
      });

      if (deployments.length === 0) {
        return createSuccessResponse({
          text: "No deployments found for this service.",
          data: []
        });
      }

      const deploymentDetails = deployments.map(deployment => {
        const status = deployment.status.toLowerCase();
        const emoji = status === 'success' ? '✅' : status === 'failed' ? '❌' : '🔄';
        
        return `${emoji} Deployment ${deployment.id}
Status: ${deployment.status}
Created: ${new Date(deployment.createdAt).toLocaleString()}
Service: ${deployment.serviceId}
${deployment.url ? `URL: ${deployment.url}` : ''}`;
      });

      return createSuccessResponse({
        text: `Recent deployments:\n\n${deploymentDetails.join('\n\n')}`,
        data: deployments
      });
    } catch (error) {
      return createErrorResponse(`Error listing deployments: ${formatError(error)}`);
    }
  }

  async triggerDeployment(projectId: string, serviceId: string, environmentId: string, commitSha?: string) {
    try {
      // Wait for 5 seconds before triggering deployment
      // Seems like the LLMs like to call this function multiple times in combination
      // with the health check function and the list deployments function
      // so we need to wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      const deploymentId = await this.client.deployments.triggerDeployment({
        serviceId,
        environmentId,
        commitSha
      });

      return createSuccessResponse({
        text: `Triggered new deployment (ID: ${deploymentId})`,
        data: { deploymentId }
      });
    } catch (error) {
      return createErrorResponse(`Error triggering deployment: ${formatError(error)}`);
    }
  }

  async getDeploymentLogs(deploymentId: string, limit: number = 100) {
    try {
      // Wait for 5 seconds before fetching logs
      // Seems like the LLMs like to call this function multiple times in combination
      // with the health check function, so we need to wait a bit to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 5000));
      const buildLogs = await this.client.deployments.getBuildLogs(deploymentId, limit);
      const deploymentLogs = await this.client.deployments.getDeploymentLogs(deploymentId, limit);

      const logs: DeploymentLog[] = [...buildLogs.map(log => ({ ...log, type: 'build' as const })), ...deploymentLogs.map(log => ({ ...log, type: 'deployment' as const })) ];

      if (logs.length === 0) {
        return createSuccessResponse({
          text: `No logs found for deployment ${deploymentId}`,
          data: []
        });
      }

      const formattedLogs = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const severity = log.severity.toLowerCase();
        const emoji = severity === 'error' ? '❌' : severity === 'warn' ? '⚠️' : '📝';
        return `[${log.type}] [${timestamp}] ${emoji} ${log.message}`;
      }).join('\n');

      return createSuccessResponse({
        text: formattedLogs,
        data: logs
      });
    } catch (error) {
      return createErrorResponse(`Error fetching logs: ${formatError(error)}`);
    }
  }

  async healthCheckDeployment(deploymentId: string) {
    try {
      // Wait for 5 seconds before checking status
      // Seems like the LLMs like to call this function multiple times in combination
      // with the health check function, so we need to wait a bit
      await new Promise(resolve => setTimeout(resolve, 5000));
      const status = await this.client.deployments.healthCheckDeployment(deploymentId);
      const emoji = getStatusEmoji(status);
      
      return createSuccessResponse({
        text: `Deployment Status: ${emoji} ${status}`,
        data: { status }
      });
    } catch (error) {
      return createErrorResponse(`Error checking deployment health: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const deploymentService = new DeploymentService();
