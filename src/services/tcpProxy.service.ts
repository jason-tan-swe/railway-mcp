import { BaseService } from './base.service.js';
import { TcpProxyCreateInput } from '@/types.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class TcpProxyService extends BaseService {
  public constructor() {
    super();
  }

  /**
   * Create a new TCP proxy for a service in a specific environment
   * @param input TCP proxy creation parameters
   */
  async createTcpProxy(input: TcpProxyCreateInput): Promise<CallToolResult> {
    try {
      const tcpProxy = await this.client.tcpProxies.tcpProxyCreate(input);
      return createSuccessResponse({
        text: `TCP Proxy created successfully:
- Application Port: ${tcpProxy.applicationPort}
- Proxy Port: ${tcpProxy.proxyPort}
- Domain: ${tcpProxy.domain}
- ID: ${tcpProxy.id}`,
        data: tcpProxy
      });
    } catch (error) {
      return createErrorResponse(`Error creating TCP proxy: ${formatError(error)}`);
    }
  }

  /**
   * Delete a TCP proxy by ID
   * @param id TCP proxy ID to delete
   */
  async deleteTcpProxy(id: string): Promise<CallToolResult> {
    try {
      const result = await this.client.tcpProxies.tcpProxyDelete(id);
      
      if (result) {
        return createSuccessResponse({
          text: `TCP Proxy with ID ${id} deleted successfully`,
          data: { success: true }
        });
      } else {
        return createErrorResponse(`Failed to delete TCP Proxy with ID ${id}`);
      }
    } catch (error) {
      return createErrorResponse(`Error deleting TCP proxy: ${formatError(error)}`);
    }
  }

  /**
   * List all TCP proxies for a service in a specific environment
   * @param environmentId Railway environment ID
   * @param serviceId Railway service ID
   */
  async listTcpProxies(environmentId: string, serviceId: string): Promise<CallToolResult> {
    try {
      const proxies = await this.client.tcpProxies.listTcpProxies(environmentId, serviceId);
      
      if (proxies.length === 0) {
        return createSuccessResponse({
          text: 'No TCP proxies found for this service.',
          data: []
        });
      }
      
      const proxyDetails = proxies.map(proxy => 
        `- Application Port: ${proxy.applicationPort} → Proxy Port: ${proxy.proxyPort}
  Domain: ${proxy.domain}
  ID: ${proxy.id}`
      ).join('\n\n');
      
      return createSuccessResponse({
        text: `TCP Proxies for this service:\n\n${proxyDetails}`,
        data: proxies
      });
    } catch (error) {
      return createErrorResponse(`Error listing TCP proxies: ${formatError(error)}`);
    }
  }
}

export const tcpProxyService = new TcpProxyService(); 