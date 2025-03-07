import { RailwayApiClient } from '@/api/api-client.js';
import { Service, ServiceInstance, ServiceCreateInput, ProjectResponse, RegionCode } from '@/types.js';

export class ServiceRepository {
  constructor(private client: RailwayApiClient) {}

  async listServices(projectId: string): Promise<Service[]> {
    const data = await this.client.request<ProjectResponse>(`
      query project($projectId: String!) {
        project(id: $projectId) {
          services {
            edges {
              node {
                name
                id
                deployments(first: 5) {
                  edges {
                    node {
                      id
                      createdAt
                      canRedeploy
                      deploymentStopped
                      environmentId
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, { projectId });

    return data.project.services.edges.map(edge => edge.node);
  }

  async getServiceInstance(serviceId: string, environmentId: string): Promise<ServiceInstance | null> {
    const data = await this.client.request<{ serviceInstance: ServiceInstance }>(`
      query serviceInstance($serviceId: String!, $environmentId: String!) {
        serviceInstance(serviceId: $serviceId, environmentId: $environmentId) {
          id
          serviceId
          serviceName
          environmentId
          buildCommand
          startCommand
          rootDirectory
          region
          healthcheckPath
          sleepApplication
          numReplicas
          builder
          cronSchedule
          healthcheckTimeout
          isUpdatable
          railwayConfigFile
          restartPolicyType
          restartPolicyMaxRetries
          upstreamUrl
          watchPatterns
        }
      }
    `, { serviceId, environmentId });

    return data.serviceInstance || null;
  }

  async createService(input: ServiceCreateInput): Promise<Service> {
    const { projectId, name, source } = input;
    const variables = {
      projectId,
      name,
      source: source || undefined
    };

    const data = await this.client.request<{ serviceCreate: Service }>(`
      mutation serviceCreate($projectId: String!, $name: String, $source: ServiceSourceInput) {
        serviceCreate(
        input: {
          projectId: $projectId,
          name: $name,
          source: $source
        }
        ) {
          id
          name
          projectId
          createdAt
          updatedAt
          deletedAt
          icon
          templateServiceId
          templateThreadSlug
          featureFlags
        }
      }
    `, variables);

    return data.serviceCreate;
  }

  async updateServiceInstance(
    serviceId: string,
    environmentId: string,
    updates: Partial<ServiceInstance>
  ): Promise<boolean> {
    const data = await this.client.request<{ serviceInstanceUpdate: boolean }>(`
      mutation serviceInstanceUpdate(
        $serviceId: String!,
        $environmentId: String!,
        $buildCommand: String,
        $startCommand: String,
        $rootDirectory: String,
        $healthcheckPath: String,
        $numReplicas: Int,
        $sleepApplication: Boolean,
        $region: String
      ) {
        serviceInstanceUpdate(
          serviceId: $serviceId,
          environmentId: $environmentId,
          input: {
            buildCommand: $buildCommand,
            startCommand: $startCommand,
            rootDirectory: $rootDirectory,
            healthcheckPath: $healthcheckPath,
            numReplicas: $numReplicas,
            sleepApplication: $sleepApplication,
            region: $region
          }
        )
      }
    `, { serviceId, environmentId, ...updates });

    return data.serviceInstanceUpdate;
  }

  async deleteService(serviceId: string): Promise<void> {
    await this.client.request<{ serviceDelete: boolean }>(`
      mutation serviceDelete($serviceId: String!) {
        serviceDelete(id: $serviceId)
      }
    `, { serviceId });
  }

  async restartService(serviceId: string, environmentId: string): Promise<void> {
    await this.client.request<{ serviceInstanceRedeploy: boolean }>(`
      mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
        serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
      }
    `, { serviceId, environmentId });
  }
} 