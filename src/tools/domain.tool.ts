import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { domainService } from '@/services/domain.service.js';

export const domainTools = [
  createTool(
    "domain_list",
    formatToolDescription({
      type: 'API',
      description: "List all domains (both service and custom) for a service",
      bestFor: [
        "Viewing service endpoints",
        "Managing domain configurations",
        "Auditing domain settings"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["domain_create", "domain_update"],
        related: ["service_info", "tcp_proxy_list"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project containing the service"),
      environmentId: z.string().describe("ID of the environment that the service is in to list domains from (usually obtained from service_list)"),
      serviceId: z.string().describe("ID of the service to list domains for")
    },
    async ({ projectId, environmentId, serviceId }) => {
      return domainService.listDomains(projectId, environmentId, serviceId);
    }
  ),

  createTool(
    "domain_create",
    formatToolDescription({
      type: 'API',
      description: "Create a new domain for a service",
      bestFor: [
        "Setting up custom domains",
        "Configuring service endpoints",
        "Adding HTTPS endpoints"
      ],
      notFor: [
        "TCP proxy setup (use tcp_proxy_create)",
        "Internal service communication"
      ],
      relations: {
        prerequisites: ["service_list", "domain_check"],
        nextSteps: ["domain_update"],
        alternatives: ["tcp_proxy_create"],
        related: ["service_info", "domain_list"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service"),
      domain: z.string().optional().describe("Custom domain name (optional, as railway will generate one for you and is generally better to leave it up to railway to generate one. There's usually no need to specify this and there are no use cases for overriding it.)"),
      suffix: z.string().optional().describe("Suffix for the domain (optional, railway will generate one for you and is generally better to leave it up to railway to generate one.)"),
      targetPort: z.number().optional().describe("Target port for the domain (optional, as railway will use the default port for the service and detect it automatically.)"),
    },
    async ({ environmentId, serviceId, domain, suffix, targetPort }) => {
      return domainService.createServiceDomain({
        environmentId,
        serviceId,
        domain,
        suffix,
        targetPort
      });
    }
  ),

  createTool(
    "domain_check",
    formatToolDescription({
      type: 'API',
      description: "Check if a domain is available for use",
      bestFor: [
        "Validating domain availability",
        "Pre-deployment checks",
        "Domain planning"
      ],
      relations: {
        nextSteps: ["domain_create"],
        related: ["domain_list"]
      }
    }),
    {
      domain: z.string().describe("Domain name to check availability for")
    },
    async ({ domain }) => {
      return domainService.checkDomainAvailability(domain);
    }
  ),

  createTool(
    "domain_update",
    formatToolDescription({
      type: 'API',
      description: "Update a domain's configuration",
      bestFor: [
        "Changing target ports",
        "Updating domain settings",
        "Reconfiguring endpoints"
      ],
      notFor: [
        "Changing domain names (delete and recreate instead)",
        "TCP proxy configuration"
      ],
      relations: {
        prerequisites: ["domain_list"],
        nextSteps: ["domain_list"],
        related: ["service_update"]
      }
    }),
    {
      id: z.string().describe("ID of the domain to update"),
      targetPort: z.number().describe("New port number to route traffic to")
    },
    async ({ id, targetPort }) => {
      return domainService.updateServiceDomain({ id, targetPort });
    }
  ),

  createTool(
    "domain_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a domain from a service",
      bestFor: [
        "Removing unused domains",
        "Cleaning up configurations",
        "Domain management"
      ],
      notFor: [
        "Temporary domain disabling",
        "Port updates (use domain_update)"
      ],
      relations: {
        prerequisites: ["domain_list"],
        alternatives: ["domain_update"],
        related: ["service_update"]
      }
    }),
    {
      id: z.string().describe("ID of the domain to delete")
    },
    async ({ id }) => {
      return domainService.deleteServiceDomain(id);
    }
  )
]; 