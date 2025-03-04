import { BaseService } from '@/services/base.service.js';
import { DeploymentLog } from '@/types.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { getStatusEmoji } from '@/utils/helpers.js';

export class DeploymentService extends BaseService {
  private static instance: DeploymentService | null = null;

  public constructor() {
    super();
  }

  public static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService();
    }
    return DeploymentService.instance;
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

  async getDeploymentLogs(deploymentId: string, type: 'build' | 'deployment' = 'deployment', limit: number = 100) {
    try {
      const logs: DeploymentLog[] = type === 'build'
        ? await this.client.deployments.getBuildLogs(deploymentId, limit)
        : await this.client.deployments.getDeploymentLogs(deploymentId, limit);

      if (logs.length === 0) {
        return createSuccessResponse({
          text: `No ${type} logs found for deployment ${deploymentId}`,
          data: []
        });
      }

      const formattedLogs = logs.map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const severity = log.severity.toLowerCase();
        const emoji = severity === 'error' ? '❌' : severity === 'warn' ? '⚠️' : '📝';
        return `[${timestamp}] ${emoji} ${log.message}`;
      }).join('\n');

      return createSuccessResponse({
        text: formattedLogs,
        data: logs
      });
    } catch (error) {
      return createErrorResponse(`Error fetching ${type} logs: ${formatError(error)}`);
    }
  }

  async healthCheckDeployment(deploymentId: string) {
    try {
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
