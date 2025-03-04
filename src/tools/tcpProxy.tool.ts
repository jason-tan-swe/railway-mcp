import { z } from 'zod';
import { createTool } from '@/utils/tools.js';
import { tcpProxyService } from '@/services/tcpProxy.service.js';

export const tcpProxyTools = [
  createTool(
    "tcp_proxy_list",
    "List all TCP proxies for a service in a specific environment",
    {
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service")
    },
    async ({ environmentId, serviceId }) => {
      return tcpProxyService.listTcpProxies(environmentId, serviceId);
    }
  ),

  createTool(
    "tcp_proxy_create",
    "Create a new TCP proxy for a service",
    {
      environmentId: z.string().describe("ID of the environment"),
      serviceId: z.string().describe("ID of the service"),
      applicationPort: z.number().describe("Port of application/service to proxy, usually based off of the service's Dockerfile or designated running port.")
    },
    async ({ environmentId, serviceId, applicationPort }) => {
      const input = {
        environmentId,
        serviceId,
        applicationPort
      };

      return tcpProxyService.createTcpProxy(input);
    }
  ),

  createTool(
    "tcp_proxy_delete",
    "Delete a TCP proxy",
    {
      id: z.string().describe("ID of the TCP proxy to delete")
    },
    async ({ id }) => {
      return tcpProxyService.deleteTcpProxy(id);
    }
  )
]; 