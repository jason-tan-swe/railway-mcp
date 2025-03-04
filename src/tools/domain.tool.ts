import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { domainService } from '@/services/domain.service.js';

export const domainTools = [
  createTool(
    "domain_list",
    "List all domains for a service in a specific environment",
    {
      projectId: z.string().describe("ID of the project"),
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service")
    },
    async ({ projectId, environmentId, serviceId }) => {
      return domainService.listDomains(projectId, environmentId, serviceId);
    }
  ),

  createTool(
    "domain_create",
    "Create a new service domain",
    {
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service"),
      domain: z.string().optional().describe("Custom domain name (optional, as railway will generate one for you and is generally better to leave it up to railway to generate one. There's usually no need to specify this and there are no use cases for overriding it.)"),
      suffix: z.string().optional().describe("Suffix for the domain (optional, railway will generate one for you and is generally better to leave it up to railway to generate one.)"),
      targetPort: z.number().optional().describe("Target port for the domain (optional, as railway will use the default port for the service and detect it automatically.)"),
    },
    async ({ environmentId, serviceId, domain, suffix, targetPort }) => {
      const input = {
        environmentId,
        serviceId,
        domain,
        suffix,
        targetPort
      };

      return domainService.createServiceDomain(input);
    }
  ),

  createTool(
    "domain_delete",
    "Delete a service domain",
    {
      id: z.string().describe("ID of the domain to delete")
    },
    async ({ id }) => {
      return domainService.deleteServiceDomain(id);
    }
  ),

  createTool(
    "domain_update",
    "Update a service domain target port",
    {
      id: z.string().describe("ID of the domain to update"),
      targetPort: z.number().describe("New target port for the domain")
    },
    async ({ id, targetPort }) => {
      const input = {
        id,
        targetPort
      };

      return domainService.updateServiceDomain(input);
    }
  ),

  createTool(
    "domain_check",
    "Check if a service domain is available",
    {
      domain: z.string().describe("Domain to check availability")
    },
    async ({ domain }) => {
      return domainService.checkDomainAvailability(domain);
    }
  )
]; 