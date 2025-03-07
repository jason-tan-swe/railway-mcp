import { createTool, formatToolDescription } from '@/utils/tools.js';
import { z } from 'zod';
import { tcpProxyService } from '@/services/tcpProxy.service.js';

export const tcpProxyTools = [
  createTool(
    "tcp_proxy_list",
    formatToolDescription({
      type: 'API',
      description: "List all TCP proxies for a service in a specific environment",
      bestFor: [
        "Viewing TCP proxy configurations",
        "Managing external access",
        "Auditing service endpoints"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["tcp_proxy_create"],
        related: ["domain_list", "service_info"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment containing the service"),
      serviceId: z.string().describe("ID of the service to list TCP proxies for")
    },
    async ({ environmentId, serviceId }) => {
      return tcpProxyService.listTcpProxies(environmentId, serviceId);
    }
  ),

  createTool(
    "tcp_proxy_create",
    formatToolDescription({
      type: 'API',
      description: "Create a new TCP proxy for a service",
      bestFor: [
        "Setting up database access",
        "Configuring external connections",
        "Exposing TCP services"
      ],
      notFor: [
        "HTTP/HTTPS endpoints (use domain_create)",
        "Internal service communication"
      ],
      relations: {
        prerequisites: ["service_list"],
        nextSteps: ["tcp_proxy_list"],
        alternatives: ["domain_create"],
        related: ["service_info", "service_update"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment (usually obtained from service_info)"),
      serviceId: z.string().describe("ID of the service"),
      applicationPort: z.number().describe("Port of application/service to proxy, usually based off of the service's Dockerfile or designated running port.")
    },
    async ({ environmentId, serviceId, applicationPort }) => {
      return tcpProxyService.createTcpProxy({
        environmentId,
        serviceId,
        applicationPort
      });
    }
  ),

  createTool(
    "tcp_proxy_delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a TCP proxy",
      bestFor: [
        "Removing unused proxies",
        "Security management",
        "Endpoint cleanup"
      ],
      notFor: [
        "Temporary proxy disabling",
        "Port updates"
      ],
      relations: {
        prerequisites: ["tcp_proxy_list"],
        related: ["service_update"]
      }
    }),
    {
      proxyId: z.string().describe("ID of the TCP proxy to delete")
    },
    async ({ proxyId }) => {
      return tcpProxyService.deleteTcpProxy(proxyId);
    }
  )
]; 