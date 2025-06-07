import { BaseApiClient } from '../base-client.js';

export interface PrivateNetwork {
  id: string;
  projectId: string;
  name: string;
  cidr: string;
  region: string;
  isActive: boolean;
  endpoints: Array<{
    serviceId: string;
    serviceName: string;
    ipAddress: string;
    port: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkEndpoint {
  id: string;
  networkId: string;
  serviceId: string;
  serviceName: string;
  ipAddress: string;
  port: number;
  protocol: 'TCP' | 'UDP' | 'HTTP' | 'HTTPS';
  isActive: boolean;
  createdAt: string;
}

export interface LoadBalancer {
  id: string;
  projectId: string;
  name: string;
  type: 'APPLICATION' | 'NETWORK' | 'GATEWAY';
  algorithm: 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'IP_HASH' | 'WEIGHTED';
  healthCheck: {
    path: string;
    port: number;
    protocol: 'HTTP' | 'HTTPS' | 'TCP';
    interval: number;
    timeout: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
  };
  targets: Array<{
    serviceId: string;
    serviceName: string;
    weight: number;
    isHealthy: boolean;
  }>;
  listeners: Array<{
    port: number;
    protocol: 'HTTP' | 'HTTPS' | 'TCP' | 'UDP';
    certificateId?: string;
  }>;
  status: 'ACTIVE' | 'PROVISIONING' | 'ERROR' | 'DELETED';
  createdAt: string;
  updatedAt: string;
}

export interface NetworkRoute {
  id: string;
  networkId: string;
  destination: string;
  gateway: string;
  metric: number;
  isActive: boolean;
  createdAt: string;
}

export interface NetworkSecurityGroup {
  id: string;
  networkId: string;
  name: string;
  description: string;
  rules: Array<{
    id: string;
    direction: 'INBOUND' | 'OUTBOUND';
    protocol: 'TCP' | 'UDP' | 'ICMP' | 'ALL';
    portRange: string;
    source: string;
    action: 'ALLOW' | 'DENY';
    priority: number;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export class NetworkingRepository {
  constructor(private client: BaseApiClient) {}

  async listPrivateNetworks(projectId: string): Promise<PrivateNetwork[]> {
    const query = `
      query listPrivateNetworks($projectId: String!) {
        project(id: $projectId) {
          privateNetworks {
            edges {
              node {
                id
                projectId
                name
                cidr
                region
                isActive
                endpoints {
                  serviceId
                  serviceName
                  ipAddress
                  port
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { privateNetworks: { edges: Array<{ node: PrivateNetwork }> } };
    }>(query, { projectId });

    return response.project.privateNetworks.edges.map(edge => edge.node);
  }

  async createPrivateNetwork(projectId: string, name: string, cidr: string, region: string): Promise<PrivateNetwork> {
    const query = `
      mutation createPrivateNetwork($projectId: String!, $name: String!, $cidr: String!, $region: String!) {
        privateNetworkCreate(projectId: $projectId, name: $name, cidr: $cidr, region: $region) {
          id
          projectId
          name
          cidr
          region
          isActive
          endpoints {
            serviceId
            serviceName
            ipAddress
            port
          }
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ privateNetworkCreate: PrivateNetwork }>(query, {
      projectId, name, cidr, region
    });

    return response.privateNetworkCreate;
  }

  async addNetworkEndpoint(networkId: string, serviceId: string, port: number, protocol: string): Promise<NetworkEndpoint> {
    const query = `
      mutation addNetworkEndpoint($networkId: String!, $serviceId: String!, $port: Int!, $protocol: NetworkProtocol!) {
        networkEndpointAdd(networkId: $networkId, serviceId: $serviceId, port: $port, protocol: $protocol) {
          id
          networkId
          serviceId
          serviceName
          ipAddress
          port
          protocol
          isActive
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ networkEndpointAdd: NetworkEndpoint }>(query, {
      networkId, serviceId, port, protocol
    });

    return response.networkEndpointAdd;
  }

  async removeNetworkEndpoint(endpointId: string): Promise<boolean> {
    const query = `
      mutation removeNetworkEndpoint($endpointId: String!) {
        networkEndpointRemove(id: $endpointId)
      }
    `;

    const response = await this.client.request<{ networkEndpointRemove: boolean }>(query, { endpointId });
    return response.networkEndpointRemove;
  }

  async listLoadBalancers(projectId: string): Promise<LoadBalancer[]> {
    const query = `
      query listLoadBalancers($projectId: String!) {
        project(id: $projectId) {
          loadBalancers {
            edges {
              node {
                id
                projectId
                name
                type
                algorithm
                healthCheck {
                  path
                  port
                  protocol
                  interval
                  timeout
                  healthyThreshold
                  unhealthyThreshold
                }
                targets {
                  serviceId
                  serviceName
                  weight
                  isHealthy
                }
                listeners {
                  port
                  protocol
                  certificateId
                }
                status
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { loadBalancers: { edges: Array<{ node: LoadBalancer }> } };
    }>(query, { projectId });

    return response.project.loadBalancers.edges.map(edge => edge.node);
  }

  async createLoadBalancer(projectId: string, name: string, type: string, algorithm: string, healthCheck: any, listeners: any[]): Promise<LoadBalancer> {
    const query = `
      mutation createLoadBalancer($projectId: String!, $name: String!, $type: LoadBalancerType!, $algorithm: LoadBalancerAlgorithm!, $healthCheck: HealthCheckInput!, $listeners: [ListenerInput!]!) {
        loadBalancerCreate(projectId: $projectId, name: $name, type: $type, algorithm: $algorithm, healthCheck: $healthCheck, listeners: $listeners) {
          id
          projectId
          name
          type
          algorithm
          healthCheck {
            path
            port
            protocol
            interval
            timeout
            healthyThreshold
            unhealthyThreshold
          }
          listeners {
            port
            protocol
            certificateId
          }
          status
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ loadBalancerCreate: LoadBalancer }>(query, {
      projectId, name, type, algorithm, healthCheck, listeners
    });

    return response.loadBalancerCreate;
  }

  async addLoadBalancerTarget(loadBalancerId: string, serviceId: string, weight: number): Promise<LoadBalancer> {
    const query = `
      mutation addLoadBalancerTarget($loadBalancerId: String!, $serviceId: String!, $weight: Int!) {
        loadBalancerTargetAdd(loadBalancerId: $loadBalancerId, serviceId: $serviceId, weight: $weight) {
          id
          targets {
            serviceId
            serviceName
            weight
            isHealthy
          }
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ loadBalancerTargetAdd: LoadBalancer }>(query, {
      loadBalancerId, serviceId, weight
    });

    return response.loadBalancerTargetAdd;
  }

  async removeLoadBalancerTarget(loadBalancerId: string, serviceId: string): Promise<LoadBalancer> {
    const query = `
      mutation removeLoadBalancerTarget($loadBalancerId: String!, $serviceId: String!) {
        loadBalancerTargetRemove(loadBalancerId: $loadBalancerId, serviceId: $serviceId) {
          id
          targets {
            serviceId
            serviceName
            weight
            isHealthy
          }
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ loadBalancerTargetRemove: LoadBalancer }>(query, {
      loadBalancerId, serviceId
    });

    return response.loadBalancerTargetRemove;
  }

  async updateLoadBalancerHealthCheck(loadBalancerId: string, healthCheck: any): Promise<LoadBalancer> {
    const query = `
      mutation updateLoadBalancerHealthCheck($loadBalancerId: String!, $healthCheck: HealthCheckInput!) {
        loadBalancerHealthCheckUpdate(id: $loadBalancerId, healthCheck: $healthCheck) {
          id
          healthCheck {
            path
            port
            protocol
            interval
            timeout
            healthyThreshold
            unhealthyThreshold
          }
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ loadBalancerHealthCheckUpdate: LoadBalancer }>(query, {
      loadBalancerId, healthCheck
    });

    return response.loadBalancerHealthCheckUpdate;
  }

  async deleteLoadBalancer(loadBalancerId: string): Promise<boolean> {
    const query = `
      mutation deleteLoadBalancer($loadBalancerId: String!) {
        loadBalancerDelete(id: $loadBalancerId)
      }
    `;

    const response = await this.client.request<{ loadBalancerDelete: boolean }>(query, { loadBalancerId });
    return response.loadBalancerDelete;
  }

  async listNetworkRoutes(networkId: string): Promise<NetworkRoute[]> {
    const query = `
      query listNetworkRoutes($networkId: String!) {
        privateNetwork(id: $networkId) {
          routes {
            id
            networkId
            destination
            gateway
            metric
            isActive
            createdAt
          }
        }
      }
    `;

    const response = await this.client.request<{
      privateNetwork: { routes: NetworkRoute[] };
    }>(query, { networkId });

    return response.privateNetwork.routes;
  }

  async createNetworkRoute(networkId: string, destination: string, gateway: string, metric: number): Promise<NetworkRoute> {
    const query = `
      mutation createNetworkRoute($networkId: String!, $destination: String!, $gateway: String!, $metric: Int!) {
        networkRouteCreate(networkId: $networkId, destination: $destination, gateway: $gateway, metric: $metric) {
          id
          networkId
          destination
          gateway
          metric
          isActive
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ networkRouteCreate: NetworkRoute }>(query, {
      networkId, destination, gateway, metric
    });

    return response.networkRouteCreate;
  }

  async deleteNetworkRoute(routeId: string): Promise<boolean> {
    const query = `
      mutation deleteNetworkRoute($routeId: String!) {
        networkRouteDelete(id: $routeId)
      }
    `;

    const response = await this.client.request<{ networkRouteDelete: boolean }>(query, { routeId });
    return response.networkRouteDelete;
  }

  async listSecurityGroups(networkId: string): Promise<NetworkSecurityGroup[]> {
    const query = `
      query listSecurityGroups($networkId: String!) {
        privateNetwork(id: $networkId) {
          securityGroups {
            id
            networkId
            name
            description
            rules {
              id
              direction
              protocol
              portRange
              source
              action
              priority
            }
            isActive
            createdAt
            updatedAt
          }
        }
      }
    `;

    const response = await this.client.request<{
      privateNetwork: { securityGroups: NetworkSecurityGroup[] };
    }>(query, { networkId });

    return response.privateNetwork.securityGroups;
  }

  async createSecurityGroup(networkId: string, name: string, description: string, rules: any[]): Promise<NetworkSecurityGroup> {
    const query = `
      mutation createSecurityGroup($networkId: String!, $name: String!, $description: String!, $rules: [SecurityRuleInput!]!) {
        securityGroupCreate(networkId: $networkId, name: $name, description: $description, rules: $rules) {
          id
          networkId
          name
          description
          rules {
            id
            direction
            protocol
            portRange
            source
            action
            priority
          }
          isActive
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ securityGroupCreate: NetworkSecurityGroup }>(query, {
      networkId, name, description, rules
    });

    return response.securityGroupCreate;
  }
}