import { RailwayApiClient } from '@/api/api-client.js';
import { TcpProxy, TcpProxyCreateInput } from '@/types.js';

export class TcpProxyRepository {
  constructor(private client: RailwayApiClient) {}

  /**
   * Create a new TCP proxy for a service in an environment
   * @param input The creation parameters for the TCP proxy
   */
  async tcpProxyCreate(input: TcpProxyCreateInput): Promise<TcpProxy> {
    const query = `
      mutation tcpProxyCreate($input: TCPProxyCreateInput!) {
        tcpProxyCreate(input: $input) {
          id
          applicationPort
          createdAt
          deletedAt
          domain
          environmentId
          proxyPort
          serviceId
          updatedAt
        }
      }
    `;

    const variables = { input };
    const response = await this.client.request<{ tcpProxyCreate: TcpProxy }>(query, variables);
    return response.tcpProxyCreate;
  }

  /**
   * Delete a TCP proxy by ID
   * @param id The ID of the TCP proxy to delete
   */
  async tcpProxyDelete(id: string): Promise<boolean> {
    const query = `
      mutation tcpProxyDelete($id: String!) {
        tcpProxyDelete(id: $id)
      }
    `;

    const variables = { id };
    const response = await this.client.request<{ tcpProxyDelete: boolean }>(query, variables);
    return response.tcpProxyDelete;
  }

  /**
   * List all TCP proxies for a service in an environment
   * @param environmentId The environment ID
   * @param serviceId The service ID
   */
  async listTcpProxies(environmentId: string, serviceId: string): Promise<TcpProxy[]> {
    const query = `
      query tcpProxies($environmentId: String!, $serviceId: String!) {
        tcpProxies(environmentId: $environmentId, serviceId: $serviceId) {
          id
          applicationPort
          createdAt
          deletedAt
          domain
          environmentId
          proxyPort
          serviceId
          updatedAt
        }
      }
    `;

    const variables = { environmentId, serviceId };
    const response = await this.client.request<{ tcpProxies: TcpProxy[] }>(query, variables);
    return response.tcpProxies;
  }
} 