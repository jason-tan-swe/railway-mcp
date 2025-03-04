import { RailwayApiClient } from '@/api/api-client.js';
import { Deployment, DeploymentLog, DeploymentTriggerInput, DeploymentsResponse } from '@/types.js';

export class DeploymentRepository {
  constructor(private client: RailwayApiClient) {}

  async listDeployments({ projectId, serviceId, environmentId, limit }: {
    projectId: string;
    serviceId: string;
    environmentId?: string;
    limit?: number;
  }): Promise<Deployment[]> {
    const data = await this.client.request<DeploymentsResponse>(`
      query deployments($projectId: String!, $serviceId: String!, $environmentId: String, $limit: Int) {
        deployments(
          input: {
            projectId: $projectId,
            serviceId: $serviceId,
            ${environmentId ? `environmentId: $environmentId` : ''}
          },
          first: $limit
        ) {
          edges {
            node {
              id
              status
              createdAt
              staticUrl
              url
              serviceId
              environmentId
              projectId
              meta
              deploymentStopped
            }
          }
        }
      }
    `, {
      projectId,
      serviceId,
      environmentId,
      limit,
    });

    return data.deployments.edges.map(edge => ({
      ...edge.node,
      projectId: edge.node.projectId || edge.node.serviceId,
      meta: edge.node.meta || {},
      deploymentStopped: edge.node.deploymentStopped || false
    }));
  }

  async getDeployment(id: string): Promise<Deployment | null> {
    const data = await this.client.request<{ deployment: Deployment }>(`
      query deployment($id: String!) {
        deployment(id: $id) {
          id
          status
          createdAt
          serviceId
          environmentId
          url
          staticUrl
          canRedeploy
          canRollback
          projectId
          meta
          deploymentStopped
        }
      }
    `, { id });

    return data.deployment || null;
  }

  async triggerDeployment(input: DeploymentTriggerInput): Promise<string> {
    const { commitSha, environmentId, serviceId } = input;
    const data = await this.client.request<{ serviceInstanceDeployV2: string }>(`
      mutation serviceInstanceDeployV2($commitSha: String, $environmentId: String!, $serviceId: String!) {
        serviceInstanceDeployV2(
          commitSha: $commitSha
          environmentId: $environmentId
          serviceId: $serviceId
        )
      }
    `, { commitSha, environmentId, serviceId });

    return data.serviceInstanceDeployV2;
  }

  async getBuildLogs(deploymentId: string, limit: number = 100): Promise<DeploymentLog[]> {
    const data = await this.client.request<{ buildLogs: DeploymentLog[] }>(`
      query buildLogs($deploymentId: String!, $limit: Int) {
        buildLogs(deploymentId: $deploymentId, limit: $limit) {
          timestamp
          message
          severity
          attributes
        }
      }
    `, { deploymentId, limit });

    return data.buildLogs || [];
  }

  async getDeploymentLogs(deploymentId: string, limit: number = 100): Promise<DeploymentLog[]> {
    const data = await this.client.request<{ deploymentLogs: DeploymentLog[] }>(`
      query deploymentLogs($deploymentId: String!, $limit: Int) {
        deploymentLogs(deploymentId: $deploymentId, limit: $limit) {
          timestamp
          message
          severity
          attributes {
            key
            value
          }
        }
      }
    `, { deploymentId, limit });

    return data.deploymentLogs || [];
  }

  async restartDeployment(id: string): Promise<void> {
    await this.client.request<{ deploymentRestart: boolean }>(`
      mutation deploymentRestart($id: String!) {
        deploymentRestart(id: $id)
      }
    `, { id });
  }

  async rollbackDeployment(id: string): Promise<void> {
    await this.client.request<{ deploymentRollback: boolean }>(`
      mutation deploymentRollback($id: String!) {
        deploymentRollback(id: $id)
      }
    `, { id });
  }

  async cancelDeployment(id: string): Promise<void> {
    await this.client.request<{ deploymentCancel: boolean }>(`
      mutation deploymentCancel($id: String!) {
        deploymentCancel(id: $id)
      }
    `, { id });
  }

  async healthCheckDeployment(deploymentId: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 5000)); // TODO: Replace later with a wait for the deployment to be healthy with websocket subscriptions
    const data = await this.client.request<{ deployment: Deployment }>(`
      query deployment($id: String!) {
        deployment(id: $id) {
          status
        }
      }
    `, { id: deploymentId });

    return data.deployment.status;
  }
} 