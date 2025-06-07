import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class CustomDomainService extends BaseService {
  constructor() {
    super();
  }

  async create(projectId: string, domain: string, serviceId?: string, environmentId?: string) {
    try {
      const customDomain = await this.client.customDomains.create({
        projectId,
        domain,
        serviceId,
        environmentId
      });

      const dnsInstructions = `
DNS Configuration Required:
1. Add a CNAME record pointing '${domain}' to '${customDomain.cnameTarget || 'pending...'}'
2. Wait for DNS propagation (usually 15-30 minutes)
3. SSL certificate will be automatically provisioned once DNS is verified`;

      return createSuccessResponse({
        text: `Custom domain '${domain}' created successfully`,
        data: {
          id: customDomain.id,
          domain: customDomain.domain,
          status: customDomain.status,
          cnameTarget: customDomain.cnameTarget,
          sslStatus: customDomain.sslStatus,
          serviceId: customDomain.serviceId,
          projectId: customDomain.projectId,
          dnsInstructions
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create custom domain: ${formatError(error)}`);
    }
  }

  async update(id: string, serviceId?: string, environmentId?: string) {
    try {
      const customDomain = await this.client.customDomains.update({
        id,
        serviceId,
        environmentId
      });

      return createSuccessResponse({
        text: `Custom domain updated successfully`,
        data: {
          id: customDomain.id,
          domain: customDomain.domain,
          serviceId: customDomain.serviceId,
          status: customDomain.status,
          sslStatus: customDomain.sslStatus
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update custom domain: ${formatError(error)}`);
    }
  }

  async delete(id: string) {
    try {
      const success = await this.client.customDomains.delete(id);
      
      if (success) {
        return createSuccessResponse({
          text: "Custom domain deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete custom domain");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete custom domain: ${formatError(error)}`);
    }
  }

  async list(projectId: string) {
    try {
      const customDomains = await this.client.customDomains.list(projectId);

      const formattedDomains = customDomains.map(domain => ({
        id: domain.id,
        domain: domain.domain,
        status: domain.status || 'UNKNOWN',
        sslStatus: domain.sslStatus || 'UNKNOWN',
        serviceId: domain.serviceId,
        cnameTarget: domain.cnameTarget,
        createdAt: domain.createdAt
      }));

      return createSuccessResponse({
        text: `Found ${customDomains.length} custom domain(s)`,
        data: formattedDomains
      });
    } catch (error) {
      return createErrorResponse(`Failed to list custom domains: ${formatError(error)}`);
    }
  }

  async get(id: string) {
    try {
      const customDomain = await this.client.customDomains.get(id);

      return createSuccessResponse({
        text: `Custom domain '${customDomain.domain}' retrieved`,
        data: {
          id: customDomain.id,
          domain: customDomain.domain,
          status: customDomain.status,
          sslStatus: customDomain.sslStatus,
          cnameTarget: customDomain.cnameTarget,
          serviceId: customDomain.serviceId,
          projectId: customDomain.projectId,
          createdAt: customDomain.createdAt,
          updatedAt: customDomain.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get custom domain: ${formatError(error)}`);
    }
  }

  async checkStatus(id: string) {
    try {
      const customDomain = await this.client.customDomains.get(id);

      const statusInfo = {
        domain: customDomain.domain,
        dnsStatus: customDomain.status,
        sslStatus: customDomain.sslStatus,
        isActive: customDomain.status === 'ACTIVE' && customDomain.sslStatus === 'ACTIVE',
        cnameTarget: customDomain.cnameTarget,
        nextSteps: [] as string[]
      };

      if (customDomain.status !== 'ACTIVE') {
        statusInfo.nextSteps.push(`Configure DNS: Point ${customDomain.domain} to ${customDomain.cnameTarget}`);
      }
      if (customDomain.sslStatus !== 'ACTIVE') {
        statusInfo.nextSteps.push('Wait for SSL certificate provisioning (automatic after DNS verification)');
      }

      return createSuccessResponse({
        text: `Custom domain status: ${statusInfo.isActive ? 'Active' : 'Pending setup'}`,
        data: statusInfo
      });
    } catch (error) {
      return createErrorResponse(`Failed to check custom domain status: ${formatError(error)}`);
    }
  }
}

export const customDomainService = new CustomDomainService();