import { BaseService } from '@/services/base.service.js';
import { Service, ServiceInstance } from '@/types.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';

export class ServiceService extends BaseService {
  private static instance: ServiceService | null = null;

  public constructor() {
    super();
  }

  public static getInstance(): ServiceService {
    if (!ServiceService.instance) {
      ServiceService.instance = new ServiceService();
    }
    return ServiceService.instance;
  }

  async listServices(projectId: string) {
    try {
      const services = await this.client.services.listServices(projectId);

      if (services.length === 0) {
        return createSuccessResponse({
          text: "No services found in this project.",
          data: []
        });
      }

      // Get latest deployment status for each service
      const serviceDetails = await Promise.all(services.map(async (service: Service) => {
        try {
          const deployments = await this.client.deployments.listDeployments({
            projectId,
            serviceId: service.id,
            limit: 1
          });
          
          const latestDeployment = deployments[0];
          if (latestDeployment) {
            return `🚀 ${service.name} (ID: ${service.id})
Status: ${latestDeployment.status}
URL: ${latestDeployment.url || 'Not deployed'}`;
          }
          
          return `🚀 ${service.name} (ID: ${service.id})
Status: No deployments`;
        } catch {
          return `🚀 ${service.name} (ID: ${service.id})`;
        }
      }));

      return createSuccessResponse({
        text: `Services in project:\n\n${serviceDetails.join('\n\n')}`,
        data: services
      });
    } catch (error) {
      return createErrorResponse(`Error listing services: ${formatError(error)}`);
    }
  }

  async getServiceInfo(projectId: string, serviceId: string, environmentId: string) {
    try {
      const [serviceInstance, deployments] = await Promise.all([
        this.client.services.getServiceInstance(serviceId, environmentId),
        this.client.deployments.listDeployments({ projectId, serviceId, environmentId, limit: 5 })
      ]);

      if (!serviceInstance) {
        return createErrorResponse(`Service instance not found.`);
      }

      const deploymentStatus = deployments.length > 0
        ? `\nLatest Deployment: ${deployments[0].status} (${deployments[0].id})`
        : '\nNo recent deployments';

      const info = `🚀 Service: ${serviceInstance.serviceName}
ID: ${serviceInstance.serviceId}
Region: ${serviceInstance.region || 'Not set'}
Replicas: ${serviceInstance.numReplicas || 1}
Root Directory: ${serviceInstance.rootDirectory || '/'}
Build Command: ${serviceInstance.buildCommand || 'Not set'}
Start Command: ${serviceInstance.startCommand || 'Not set'}
Health Check Path: ${serviceInstance.healthcheckPath || 'Not set'}
Sleep Mode: ${serviceInstance.sleepApplication ? 'Enabled' : 'Disabled'}${deploymentStatus}`;

      return createSuccessResponse({
        text: info,
        data: { serviceInstance, deployments }
      });
    } catch (error) {
      return createErrorResponse(`Error getting service details: ${formatError(error)}`);
    }
  }

  async createServiceFromRepo(projectId: string, repo: string, name?: string) {
    try {
      const service = await this.client.services.createService({
        projectId,
        name,
        source: {
          repo,
        }
      });

      return createSuccessResponse({
        text: `Created new service "${service.name}" (ID: ${service.id}) from GitHub repo "${repo}"`,
        data: service
      });
    } catch (error) {
      return createErrorResponse(`Error creating service: ${formatError(error)}`);
    }
  }

  async createServiceFromImage(projectId: string, image: string, name?: string) {
    try {
      const service = await this.client.services.createService({
        projectId,
        name,
        source: {
          image,
        }
      });

      return createSuccessResponse({
        text: `Created new service "${service.name}" (ID: ${service.id}) from Docker image "${image}"`,
        data: service
      });
    } catch (error) {
      return createErrorResponse(`Error creating service: ${formatError(error)}`);
    }
  }

  async updateService(projectId: string, serviceId: string, environmentId: string, config: Partial<ServiceInstance>) {
    try {
      await this.client.services.updateServiceInstance(serviceId, environmentId, config);
      return createSuccessResponse({
        text: `Service configuration updated successfully`
      });
    } catch (error) {
      return createErrorResponse(`Error updating service: ${formatError(error)}`);
    }
  }

  async deleteService(projectId: string, serviceId: string) {
    try {
      await this.client.services.deleteService(serviceId);
      return createSuccessResponse({
        text: `Service deleted successfully`
      });
    } catch (error) {
      return createErrorResponse(`Error deleting service: ${formatError(error)}`);
    }
  }

  async restartService(serviceId: string, environmentId: string) {
    try {
      await this.client.services.restartService(serviceId, environmentId);
      return createSuccessResponse({
        text: `Service restarted successfully`
      });
    } catch (error) {
      return createErrorResponse(`Error restarting service: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const serviceService = new ServiceService();
