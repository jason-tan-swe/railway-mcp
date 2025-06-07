import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { networkingService } from "../services/networking.service.js";

export const networkingTools = [
  createTool(
    "networking-private-networks",
    formatToolDescription({
      type: 'QUERY',
      description: "List private networks and their endpoints",
      bestFor: [
        "Managing private network infrastructure",
        "Viewing network topology",
        "Understanding service connectivity"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["networking-network-create", "networking-endpoint-add"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return networkingService.listPrivateNetworks(projectId);
    }
  ),

  createTool(
    "networking-network-create",
    formatToolDescription({
      type: 'API',
      description: "Create private network for secure service communication",
      bestFor: [
        "Setting up isolated network environments",
        "Implementing microservice architecture",
        "Enhanced security and network segmentation"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["networking-private-networks", "networking-endpoint-add"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      name: z.string().describe("Name for the private network"),
      cidr: z.string().describe("CIDR block for the network (e.g., '10.0.0.0/24')"),
      region: z.string().describe("Region where network should be created")
    },
    async ({ projectId, name, cidr, region }) => {
      return networkingService.createPrivateNetwork(projectId, name, cidr, region);
    }
  ),

  createTool(
    "networking-endpoint-add",
    formatToolDescription({
      type: 'API',
      description: "Add service endpoint to private network",
      bestFor: [
        "Connecting services to private network",
        "Enabling secure inter-service communication",
        "Network service discovery"
      ],
      relations: {
        prerequisites: ["networking-private-networks", "service_list"],
        nextSteps: ["networking-private-networks"]
      }
    }),
    {
      networkId: z.string().describe("ID of the private network"),
      serviceId: z.string().describe("ID of the service to add"),
      port: z.number().min(1).max(65535).describe("Port number for the endpoint"),
      protocol: z.enum(['TCP', 'UDP', 'HTTP', 'HTTPS']).describe("Protocol for the endpoint")
    },
    async ({ networkId, serviceId, port, protocol }) => {
      return networkingService.addNetworkEndpoint(networkId, serviceId, port, protocol);
    }
  ),

  createTool(
    "networking-endpoint-remove",
    formatToolDescription({
      type: 'API',
      description: "Remove service endpoint from private network",
      bestFor: [
        "Disconnecting services from network",
        "Network topology cleanup",
        "Security isolation"
      ],
      relations: {
        prerequisites: ["networking-private-networks"],
        nextSteps: ["networking-private-networks"]
      }
    }),
    {
      endpointId: z.string().describe("ID of the network endpoint to remove")
    },
    async ({ endpointId }) => {
      return networkingService.removeNetworkEndpoint(endpointId);
    }
  ),

  createTool(
    "networking-load-balancers",
    formatToolDescription({
      type: 'QUERY',
      description: "List load balancers and their health status",
      bestFor: [
        "Managing traffic distribution",
        "Monitoring load balancer health",
        "High availability configuration"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["networking-load-balancer-create", "networking-lb-target-add"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return networkingService.listLoadBalancers(projectId);
    }
  ),

  createTool(
    "networking-load-balancer-create",
    formatToolDescription({
      type: 'API',
      description: "Create load balancer for traffic distribution",
      bestFor: [
        "High availability and scalability",
        "Traffic distribution across services",
        "Performance optimization"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["networking-lb-target-add", "networking-load-balancers"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      name: z.string().describe("Name for the load balancer"),
      type: z.enum(['APPLICATION', 'NETWORK', 'GATEWAY']).describe("Type of load balancer"),
      algorithm: z.enum(['ROUND_ROBIN', 'LEAST_CONNECTIONS', 'IP_HASH', 'WEIGHTED']).describe("Load balancing algorithm"),
      healthCheck: z.object({
        path: z.string().describe("Health check path (e.g., '/health')"),
        port: z.number().describe("Health check port"),
        protocol: z.enum(['HTTP', 'HTTPS', 'TCP']).describe("Health check protocol"),
        interval: z.number().describe("Check interval in seconds"),
        timeout: z.number().describe("Timeout in seconds"),
        healthyThreshold: z.number().describe("Healthy threshold count"),
        unhealthyThreshold: z.number().describe("Unhealthy threshold count")
      }).describe("Health check configuration"),
      listeners: z.array(z.object({
        port: z.number().describe("Listener port"),
        protocol: z.enum(['HTTP', 'HTTPS', 'TCP', 'UDP']).describe("Listener protocol"),
        certificateId: z.string().optional().describe("SSL certificate ID for HTTPS")
      })).describe("Load balancer listeners")
    },
    async ({ projectId, name, type, algorithm, healthCheck, listeners }) => {
      return networkingService.createLoadBalancer(projectId, name, type, algorithm, healthCheck, listeners);
    }
  ),

  createTool(
    "networking-lb-target-add",
    formatToolDescription({
      type: 'API',
      description: "Add service target to load balancer",
      bestFor: [
        "Scaling applications horizontally",
        "Adding new service instances",
        "Load distribution management"
      ],
      relations: {
        prerequisites: ["networking-load-balancers", "service_list"],
        nextSteps: ["networking-load-balancers"]
      }
    }),
    {
      loadBalancerId: z.string().describe("ID of the load balancer"),
      serviceId: z.string().describe("ID of the service to add as target"),
      weight: z.number().min(1).max(100).describe("Weight for traffic distribution (1-100)")
    },
    async ({ loadBalancerId, serviceId, weight }) => {
      return networkingService.addLoadBalancerTarget(loadBalancerId, serviceId, weight);
    }
  ),

  createTool(
    "networking-lb-target-remove",
    formatToolDescription({
      type: 'API',
      description: "Remove service target from load balancer",
      bestFor: [
        "Removing failed instances",
        "Scaling down applications",
        "Maintenance operations"
      ],
      relations: {
        prerequisites: ["networking-load-balancers"],
        nextSteps: ["networking-load-balancers"]
      }
    }),
    {
      loadBalancerId: z.string().describe("ID of the load balancer"),
      serviceId: z.string().describe("ID of the service to remove")
    },
    async ({ loadBalancerId, serviceId }) => {
      return networkingService.removeLoadBalancerTarget(loadBalancerId, serviceId);
    }
  ),

  createTool(
    "networking-lb-health-check-update",
    formatToolDescription({
      type: 'API',
      description: "Update load balancer health check configuration",
      bestFor: [
        "Fine-tuning health monitoring",
        "Optimizing failure detection",
        "Adjusting health check sensitivity"
      ],
      relations: {
        prerequisites: ["networking-load-balancers"],
        nextSteps: ["networking-load-balancers"]
      }
    }),
    {
      loadBalancerId: z.string().describe("ID of the load balancer"),
      healthCheck: z.object({
        path: z.string().optional().describe("Health check path"),
        port: z.number().optional().describe("Health check port"),
        protocol: z.enum(['HTTP', 'HTTPS', 'TCP']).optional().describe("Health check protocol"),
        interval: z.number().optional().describe("Check interval in seconds"),
        timeout: z.number().optional().describe("Timeout in seconds"),
        healthyThreshold: z.number().optional().describe("Healthy threshold count"),
        unhealthyThreshold: z.number().optional().describe("Unhealthy threshold count")
      }).describe("Updated health check configuration")
    },
    async ({ loadBalancerId, healthCheck }) => {
      return networkingService.updateLoadBalancerHealthCheck(loadBalancerId, healthCheck);
    }
  ),

  createTool(
    "networking-load-balancer-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete load balancer (WARNING: Traffic routing will stop)",
      bestFor: [
        "Removing unused load balancers",
        "Infrastructure cleanup"
      ],
      notFor: [
        "Active production load balancers"
      ],
      relations: {
        prerequisites: ["networking-load-balancers"],
        nextSteps: ["networking-load-balancers"]
      }
    }),
    {
      loadBalancerId: z.string().describe("ID of the load balancer to delete")
    },
    async ({ loadBalancerId }) => {
      return networkingService.deleteLoadBalancer(loadBalancerId);
    }
  ),

  createTool(
    "networking-routes",
    formatToolDescription({
      type: 'QUERY',
      description: "List network routes for traffic routing",
      bestFor: [
        "Managing network traffic flow",
        "Understanding routing topology",
        "Network troubleshooting"
      ],
      relations: {
        prerequisites: ["networking-private-networks"],
        nextSteps: ["networking-route-create"]
      }
    }),
    {
      networkId: z.string().describe("ID of the private network")
    },
    async ({ networkId }) => {
      return networkingService.listNetworkRoutes(networkId);
    }
  ),

  createTool(
    "networking-route-create",
    formatToolDescription({
      type: 'API',
      description: "Create custom network route",
      bestFor: [
        "Custom traffic routing",
        "Network architecture optimization",
        "Multi-region connectivity"
      ],
      relations: {
        prerequisites: ["networking-routes"],
        nextSteps: ["networking-routes"]
      }
    }),
    {
      networkId: z.string().describe("ID of the private network"),
      destination: z.string().describe("Destination CIDR block (e.g., '192.168.1.0/24')"),
      gateway: z.string().describe("Gateway IP address"),
      metric: z.number().min(1).max(1000).describe("Route metric/priority (lower = higher priority)")
    },
    async ({ networkId, destination, gateway, metric }) => {
      return networkingService.createNetworkRoute(networkId, destination, gateway, metric);
    }
  ),

  createTool(
    "networking-route-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete network route",
      bestFor: [
        "Removing obsolete routes",
        "Network topology cleanup"
      ],
      relations: {
        prerequisites: ["networking-routes"],
        nextSteps: ["networking-routes"]
      }
    }),
    {
      routeId: z.string().describe("ID of the route to delete")
    },
    async ({ routeId }) => {
      return networkingService.deleteNetworkRoute(routeId);
    }
  ),

  createTool(
    "networking-security-groups",
    formatToolDescription({
      type: 'QUERY',
      description: "List network security groups and firewall rules",
      bestFor: [
        "Managing network security policies",
        "Firewall configuration review",
        "Security compliance auditing"
      ],
      relations: {
        prerequisites: ["networking-private-networks"],
        nextSteps: ["networking-security-group-create"]
      }
    }),
    {
      networkId: z.string().describe("ID of the private network")
    },
    async ({ networkId }) => {
      return networkingService.listSecurityGroups(networkId);
    }
  ),

  createTool(
    "networking-security-group-create",
    formatToolDescription({
      type: 'API',
      description: "Create network security group with firewall rules",
      bestFor: [
        "Implementing network security policies",
        "Access control and firewall management",
        "Compliance and security requirements"
      ],
      relations: {
        prerequisites: ["networking-private-networks"],
        nextSteps: ["networking-security-groups"]
      }
    }),
    {
      networkId: z.string().describe("ID of the private network"),
      name: z.string().describe("Name for the security group"),
      description: z.string().describe("Description of the security group purpose"),
      rules: z.array(z.object({
        direction: z.enum(['INBOUND', 'OUTBOUND']).describe("Traffic direction"),
        protocol: z.enum(['TCP', 'UDP', 'ICMP', 'ALL']).describe("Network protocol"),
        portRange: z.string().describe("Port range (e.g., '80', '443', '8000-9000')"),
        source: z.string().describe("Source IP/CIDR (e.g., '0.0.0.0/0', '10.0.0.0/24')"),
        action: z.enum(['ALLOW', 'DENY']).describe("Rule action"),
        priority: z.number().min(1).max(1000).describe("Rule priority (lower = higher priority)")
      })).describe("Security rules for the group")
    },
    async ({ networkId, name, description, rules }) => {
      return networkingService.createSecurityGroup(networkId, name, description, rules);
    }
  )
];