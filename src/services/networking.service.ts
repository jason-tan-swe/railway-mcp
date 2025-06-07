import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class NetworkingService extends BaseService {
  constructor() {
    super();
  }

  async listPrivateNetworks(projectId: string) {
    try {
      const networks = await this.client.networking.listPrivateNetworks(projectId);
      
      const activeCount = networks.filter(n => n.isActive).length;
      const totalEndpoints = networks.reduce((sum, n) => sum + n.endpoints.length, 0);
      const regions = [...new Set(networks.map(n => n.region))];

      return createSuccessResponse({
        text: `Found ${networks.length} private networks (${activeCount} active, ${totalEndpoints} endpoints)`,
        data: {
          projectId,
          summary: {
            totalNetworks: networks.length,
            activeCount,
            totalEndpoints,
            regions
          },
          networks: networks.map(network => ({
            id: network.id,
            name: network.name,
            cidr: network.cidr,
            region: network.region,
            isActive: network.isActive,
            endpointCount: network.endpoints.length,
            endpoints: network.endpoints.map(ep => ({
              serviceId: ep.serviceId,
              serviceName: ep.serviceName,
              ipAddress: ep.ipAddress,
              port: ep.port
            })),
            createdAt: network.createdAt,
            updatedAt: network.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list private networks: ${formatError(error)}`);
    }
  }

  async createPrivateNetwork(projectId: string, name: string, cidr: string, region: string) {
    try {
      const network = await this.client.networking.createPrivateNetwork(projectId, name, cidr, region);

      return createSuccessResponse({
        text: `Private network "${name}" created in ${region}`,
        data: {
          id: network.id,
          name: network.name,
          cidr: network.cidr,
          region: network.region,
          isActive: network.isActive,
          projectId: network.projectId,
          createdAt: network.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create private network: ${formatError(error)}`);
    }
  }

  async addNetworkEndpoint(networkId: string, serviceId: string, port: number, protocol: string) {
    try {
      const endpoint = await this.client.networking.addNetworkEndpoint(networkId, serviceId, port, protocol);

      return createSuccessResponse({
        text: `Service endpoint added to private network`,
        data: {
          id: endpoint.id,
          networkId: endpoint.networkId,
          serviceId: endpoint.serviceId,
          serviceName: endpoint.serviceName,
          ipAddress: endpoint.ipAddress,
          port: endpoint.port,
          protocol: endpoint.protocol,
          isActive: endpoint.isActive,
          createdAt: endpoint.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to add network endpoint: ${formatError(error)}`);
    }
  }

  async removeNetworkEndpoint(endpointId: string) {
    try {
      const success = await this.client.networking.removeNetworkEndpoint(endpointId);
      
      if (success) {
        return createSuccessResponse({
          text: "Network endpoint removed successfully"
        });
      } else {
        return createErrorResponse("Failed to remove network endpoint");
      }
    } catch (error) {
      return createErrorResponse(`Failed to remove network endpoint: ${formatError(error)}`);
    }
  }

  async listLoadBalancers(projectId: string) {
    try {
      const loadBalancers = await this.client.networking.listLoadBalancers(projectId);
      
      const activeCount = loadBalancers.filter(lb => lb.status === 'ACTIVE').length;
      const totalTargets = loadBalancers.reduce((sum, lb) => sum + lb.targets.length, 0);
      const healthyTargets = loadBalancers.reduce((sum, lb) => 
        sum + lb.targets.filter(t => t.isHealthy).length, 0);

      return createSuccessResponse({
        text: `Found ${loadBalancers.length} load balancers (${activeCount} active, ${healthyTargets}/${totalTargets} healthy targets)`,
        data: {
          projectId,
          summary: {
            totalLoadBalancers: loadBalancers.length,
            activeCount,
            totalTargets,
            healthyTargets,
            healthyTargetPercentage: totalTargets > 0 ? `${((healthyTargets / totalTargets) * 100).toFixed(1)}%` : 'N/A'
          },
          loadBalancers: loadBalancers.map(lb => ({
            id: lb.id,
            name: lb.name,
            type: lb.type,
            algorithm: lb.algorithm,
            status: lb.status,
            targetCount: lb.targets.length,
            healthyTargets: lb.targets.filter(t => t.isHealthy).length,
            listeners: lb.listeners.map(l => `${l.protocol}:${l.port}`).join(', '),
            healthCheck: {
              path: lb.healthCheck.path,
              protocol: lb.healthCheck.protocol,
              interval: `${lb.healthCheck.interval}s`
            },
            targets: lb.targets.map(target => ({
              serviceId: target.serviceId,
              serviceName: target.serviceName,
              weight: target.weight,
              isHealthy: target.isHealthy
            })),
            createdAt: lb.createdAt,
            updatedAt: lb.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list load balancers: ${formatError(error)}`);
    }
  }

  async createLoadBalancer(projectId: string, name: string, type: string, algorithm: string, healthCheck: any, listeners: any[]) {
    try {
      const loadBalancer = await this.client.networking.createLoadBalancer(
        projectId, name, type, algorithm, healthCheck, listeners
      );

      return createSuccessResponse({
        text: `Load balancer "${name}" created with ${type} type`,
        data: {
          id: loadBalancer.id,
          name: loadBalancer.name,
          type: loadBalancer.type,
          algorithm: loadBalancer.algorithm,
          status: loadBalancer.status,
          healthCheck: loadBalancer.healthCheck,
          listeners: loadBalancer.listeners,
          projectId: loadBalancer.projectId,
          createdAt: loadBalancer.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create load balancer: ${formatError(error)}`);
    }
  }

  async addLoadBalancerTarget(loadBalancerId: string, serviceId: string, weight: number) {
    try {
      const loadBalancer = await this.client.networking.addLoadBalancerTarget(loadBalancerId, serviceId, weight);

      return createSuccessResponse({
        text: `Service added to load balancer with weight ${weight}`,
        data: {
          loadBalancerId: loadBalancer.id,
          targetCount: loadBalancer.targets.length,
          targets: loadBalancer.targets.map(target => ({
            serviceId: target.serviceId,
            serviceName: target.serviceName,
            weight: target.weight,
            isHealthy: target.isHealthy
          })),
          updatedAt: loadBalancer.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to add load balancer target: ${formatError(error)}`);
    }
  }

  async removeLoadBalancerTarget(loadBalancerId: string, serviceId: string) {
    try {
      const loadBalancer = await this.client.networking.removeLoadBalancerTarget(loadBalancerId, serviceId);

      return createSuccessResponse({
        text: `Service removed from load balancer`,
        data: {
          loadBalancerId: loadBalancer.id,
          targetCount: loadBalancer.targets.length,
          targets: loadBalancer.targets.map(target => ({
            serviceId: target.serviceId,
            serviceName: target.serviceName,
            weight: target.weight,
            isHealthy: target.isHealthy
          })),
          updatedAt: loadBalancer.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to remove load balancer target: ${formatError(error)}`);
    }
  }

  async updateLoadBalancerHealthCheck(loadBalancerId: string, healthCheck: any) {
    try {
      const loadBalancer = await this.client.networking.updateLoadBalancerHealthCheck(loadBalancerId, healthCheck);

      return createSuccessResponse({
        text: `Load balancer health check updated`,
        data: {
          id: loadBalancer.id,
          healthCheck: {
            path: loadBalancer.healthCheck.path,
            port: loadBalancer.healthCheck.port,
            protocol: loadBalancer.healthCheck.protocol,
            interval: `${loadBalancer.healthCheck.interval}s`,
            timeout: `${loadBalancer.healthCheck.timeout}s`,
            healthyThreshold: loadBalancer.healthCheck.healthyThreshold,
            unhealthyThreshold: loadBalancer.healthCheck.unhealthyThreshold
          },
          updatedAt: loadBalancer.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update health check: ${formatError(error)}`);
    }
  }

  async deleteLoadBalancer(loadBalancerId: string) {
    try {
      const success = await this.client.networking.deleteLoadBalancer(loadBalancerId);
      
      if (success) {
        return createSuccessResponse({
          text: "Load balancer deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete load balancer");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete load balancer: ${formatError(error)}`);
    }
  }

  async listNetworkRoutes(networkId: string) {
    try {
      const routes = await this.client.networking.listNetworkRoutes(networkId);
      
      const activeCount = routes.filter(r => r.isActive).length;

      return createSuccessResponse({
        text: `Found ${routes.length} network routes (${activeCount} active)`,
        data: {
          networkId,
          summary: {
            totalRoutes: routes.length,
            activeCount
          },
          routes: routes.map(route => ({
            id: route.id,
            destination: route.destination,
            gateway: route.gateway,
            metric: route.metric,
            isActive: route.isActive,
            createdAt: route.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list network routes: ${formatError(error)}`);
    }
  }

  async createNetworkRoute(networkId: string, destination: string, gateway: string, metric: number) {
    try {
      const route = await this.client.networking.createNetworkRoute(networkId, destination, gateway, metric);

      return createSuccessResponse({
        text: `Network route created for ${destination}`,
        data: {
          id: route.id,
          networkId: route.networkId,
          destination: route.destination,
          gateway: route.gateway,
          metric: route.metric,
          isActive: route.isActive,
          createdAt: route.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create network route: ${formatError(error)}`);
    }
  }

  async deleteNetworkRoute(routeId: string) {
    try {
      const success = await this.client.networking.deleteNetworkRoute(routeId);
      
      if (success) {
        return createSuccessResponse({
          text: "Network route deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete network route");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete network route: ${formatError(error)}`);
    }
  }

  async listSecurityGroups(networkId: string) {
    try {
      const securityGroups = await this.client.networking.listSecurityGroups(networkId);
      
      const activeCount = securityGroups.filter(sg => sg.isActive).length;
      const totalRules = securityGroups.reduce((sum, sg) => sum + sg.rules.length, 0);

      return createSuccessResponse({
        text: `Found ${securityGroups.length} security groups (${activeCount} active, ${totalRules} rules)`,
        data: {
          networkId,
          summary: {
            totalSecurityGroups: securityGroups.length,
            activeCount,
            totalRules
          },
          securityGroups: securityGroups.map(sg => ({
            id: sg.id,
            name: sg.name,
            description: sg.description,
            isActive: sg.isActive,
            ruleCount: sg.rules.length,
            rules: sg.rules.map(rule => ({
              id: rule.id,
              direction: rule.direction,
              protocol: rule.protocol,
              portRange: rule.portRange,
              source: rule.source,
              action: rule.action,
              priority: rule.priority
            })),
            createdAt: sg.createdAt,
            updatedAt: sg.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list security groups: ${formatError(error)}`);
    }
  }

  async createSecurityGroup(networkId: string, name: string, description: string, rules: any[]) {
    try {
      const securityGroup = await this.client.networking.createSecurityGroup(networkId, name, description, rules);

      return createSuccessResponse({
        text: `Security group "${name}" created with ${rules.length} rules`,
        data: {
          id: securityGroup.id,
          networkId: securityGroup.networkId,
          name: securityGroup.name,
          description: securityGroup.description,
          isActive: securityGroup.isActive,
          ruleCount: securityGroup.rules.length,
          rules: securityGroup.rules.map(rule => ({
            id: rule.id,
            direction: rule.direction,
            protocol: rule.protocol,
            portRange: rule.portRange,
            source: rule.source,
            action: rule.action,
            priority: rule.priority
          })),
          createdAt: securityGroup.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create security group: ${formatError(error)}`);
    }
  }
}

export const networkingService = new NetworkingService();