import { BaseService } from './base.service.js';
import { ServiceDomainCreateInput, ServiceDomainUpdateInput } from '@/types.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class DomainService extends BaseService {

  public constructor() {
    super();
  }

  /**
   * Create a service domain for a service in a specific environment
   * @param input Service domain creation parameters
   */
  async createServiceDomain(input: ServiceDomainCreateInput): Promise<CallToolResult> {
    try {
      // Check domain availability if a domain is specified
      if (input.domain) {
        const availability = await this.client.domains.serviceDomainAvailable(input.domain);
        if (!availability.available) {
          return createErrorResponse(`Domain unavailable: ${availability.message}`);
        }
      }
      
      const domain = await this.client.domains.serviceDomainCreate(input);
      return createSuccessResponse({
        text: `Domain created successfully: ${domain.domain} (ID: ${domain.id}, Port: ${domain.targetPort || 'default'})`,
        data: domain
      });
    } catch (error) {
      return createErrorResponse(`Error creating domain: ${formatError(error)}`);
    }
  }

  /**
   * Delete a service domain by ID
   * @param id Domain ID to delete
   */
  async deleteServiceDomain(id: string): Promise<CallToolResult> {
    try {
      const result = await this.client.domains.serviceDomainDelete(id);
      
      if (result) {
        return createSuccessResponse({
          text: `Domain with ID ${id} deleted successfully`,
          data: { success: true }
        });
      } else {
        return createErrorResponse(`Failed to delete domain with ID ${id}`);
      }
    } catch (error) {
      return createErrorResponse(`Error deleting domain: ${formatError(error)}`);
    }
  }

  /**
   * Update a service domain's target port
   * @param input Update parameters including domain ID and new target port
   */
  async updateServiceDomain(input: ServiceDomainUpdateInput): Promise<CallToolResult> {
    try {
      const result = await this.client.domains.serviceDomainUpdate(input);
      
      if (result) {
        return createSuccessResponse({
          text: `Domain with ID ${input.id} updated successfully with new target port: ${input.targetPort}`,
          data: { success: true }
        });
      } else {
        return createErrorResponse(`Failed to update domain with ID ${input.id}`);
      }
    } catch (error) {
      return createErrorResponse(`Error updating domain: ${formatError(error)}`);
    }
  }

  /**
   * List all domains (both service and custom) for a service in a specific environment
   * @param projectId Railway project ID
   * @param environmentId Railway environment ID
   * @param serviceId Railway service ID
   */
  async listDomains(
    projectId: string, 
    environmentId: string, 
    serviceId: string
  ): Promise<CallToolResult> {
    try {
      const domains = await this.client.domains.domains(projectId, environmentId, serviceId);
      
      // Format the domains text output
      let domainsText = '';
      
      if (domains.serviceDomains.length === 0 && domains.customDomains.length === 0) {
        domainsText = 'No domains found for this service.';
      } else {
        if (domains.serviceDomains.length > 0) {
          domainsText += 'Service Domains:\n';
          domains.serviceDomains.forEach(domain => {
            domainsText += `- ${domain.domain} (ID: ${domain.id}, Port: ${domain.targetPort || 'default'})\n`;
          });
        } else {
          domainsText += 'No service domains found.\n';
        }
        
        domainsText += '\nCustom Domains:\n';
        if (domains.customDomains.length > 0) {
          domains.customDomains.forEach(domain => {
            domainsText += `- ${domain.domain} (ID: ${domain.id}, Port: ${domain.targetPort || 'default'})\n`;
          });
        } else {
          domainsText += 'No custom domains found.\n';
        }
      }
      
      return createSuccessResponse({
        text: domainsText,
        data: domains
      });
    } catch (error) {
      return createErrorResponse(`Error listing domains: ${formatError(error)}`);
    }
  }

  /**
   * Check if a service domain is available
   * @param domain Domain to check
   */
  async checkDomainAvailability(domain: string): Promise<CallToolResult> {
    try {
      const result = await this.client.domains.serviceDomainAvailable(domain);
      
      if (result.available) {
        return createSuccessResponse({
          text: `Domain ${domain} is available`,
          data: result
        });
      } else {
        return createSuccessResponse({
          text: `Domain ${domain} is not available: ${result.message}`,
          data: result
        });
      }
    } catch (error) {
      return createErrorResponse(`Error checking domain availability: ${formatError(error)}`);
    }
  }
}

export const domainService = new DomainService(); 