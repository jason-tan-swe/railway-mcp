import { BaseApiClient } from '../base-client.js';

export interface ResourceQuota {
  teamId: string;
  resourceType: 'CPU' | 'MEMORY' | 'STORAGE' | 'NETWORK' | 'BUILDS' | 'EXECUTIONS';
  allocated: number;
  used: number;
  unit: string;
  isShared: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expiresAt?: string;
}

export interface ResourceAllocation {
  id: string;
  projectId: string;
  serviceId?: string;
  resourceType: 'CPU' | 'MEMORY' | 'STORAGE';
  amount: number;
  unit: string;
  isReserved: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
}

export interface ResourceUsageHistory {
  id: string;
  resourceId: string;
  timestamp: string;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface ResourceLimit {
  id: string;
  teamId: string;
  resourceType: 'CPU' | 'MEMORY' | 'STORAGE' | 'NETWORK' | 'CONCURRENT_BUILDS' | 'CONCURRENT_DEPLOYMENTS';
  hardLimit: number;
  softLimit: number;
  unit: string;
  alertThreshold: number;
  isEnforced: boolean;
  createdAt: string;
}

export interface ResourceOptimization {
  projectId: string;
  recommendations: Array<{
    type: 'SCALE_DOWN' | 'SCALE_UP' | 'OPTIMIZE_CONFIG' | 'CONSOLIDATE' | 'MIGRATE';
    resourceType: string;
    currentValue: number;
    recommendedValue: number;
    estimatedSavings?: number;
    confidence: 'LOW' | 'MEDIUM' | 'HIGH';
    description: string;
  }>;
  totalEstimatedSavings: number;
  analysisDate: string;
}

export class ResourceRepository {
  constructor(private client: BaseApiClient) {}

  async getTeamQuotas(teamId: string): Promise<ResourceQuota[]> {
    const query = `
      query getTeamQuotas($teamId: String!) {
        teamResourceQuotas(teamId: $teamId) {
          edges {
            node {
              teamId
              resourceType
              allocated
              used
              unit
              isShared
              priority
              expiresAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      teamResourceQuotas: { edges: Array<{ node: ResourceQuota }> };
    }>(query, { teamId });

    return response.teamResourceQuotas.edges.map(edge => edge.node);
  }

  async getProjectAllocations(projectId: string): Promise<ResourceAllocation[]> {
    const query = `
      query getProjectAllocations($projectId: String!) {
        projectResourceAllocations(projectId: $projectId) {
          edges {
            node {
              id
              projectId
              serviceId
              resourceType
              amount
              unit
              isReserved
              priority
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      projectResourceAllocations: { edges: Array<{ node: ResourceAllocation }> };
    }>(query, { projectId });

    return response.projectResourceAllocations.edges.map(edge => edge.node);
  }

  async updateAllocation(allocationId: string, amount: number, priority?: string): Promise<ResourceAllocation> {
    const query = `
      mutation updateResourceAllocation($allocationId: String!, $amount: Float!, $priority: ResourcePriority) {
        resourceAllocationUpdate(id: $allocationId, amount: $amount, priority: $priority) {
          id
          projectId
          serviceId
          resourceType
          amount
          unit
          isReserved
          priority
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ resourceAllocationUpdate: ResourceAllocation }>(query, {
      allocationId,
      amount,
      priority
    });

    return response.resourceAllocationUpdate;
  }

  async getResourceLimits(teamId: string): Promise<ResourceLimit[]> {
    const query = `
      query getResourceLimits($teamId: String!) {
        teamResourceLimits(teamId: $teamId) {
          edges {
            node {
              id
              teamId
              resourceType
              hardLimit
              softLimit
              unit
              alertThreshold
              isEnforced
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      teamResourceLimits: { edges: Array<{ node: ResourceLimit }> };
    }>(query, { teamId });

    return response.teamResourceLimits.edges.map(edge => edge.node);
  }

  async updateResourceLimit(limitId: string, hardLimit?: number, softLimit?: number, alertThreshold?: number): Promise<ResourceLimit> {
    const query = `
      mutation updateResourceLimit($limitId: String!, $hardLimit: Float, $softLimit: Float, $alertThreshold: Float) {
        resourceLimitUpdate(id: $limitId, hardLimit: $hardLimit, softLimit: $softLimit, alertThreshold: $alertThreshold) {
          id
          teamId
          resourceType
          hardLimit
          softLimit
          unit
          alertThreshold
          isEnforced
        }
      }
    `;

    const response = await this.client.request<{ resourceLimitUpdate: ResourceLimit }>(query, {
      limitId,
      hardLimit,
      softLimit,
      alertThreshold
    });

    return response.resourceLimitUpdate;
  }

  async getOptimizationRecommendations(projectId: string): Promise<ResourceOptimization> {
    const query = `
      query getResourceOptimization($projectId: String!) {
        projectResourceOptimization(projectId: $projectId) {
          projectId
          recommendations {
            type
            resourceType
            currentValue
            recommendedValue
            estimatedSavings
            confidence
            description
          }
          totalEstimatedSavings
          analysisDate
        }
      }
    `;

    const response = await this.client.request<{ projectResourceOptimization: ResourceOptimization }>(query, { projectId });
    return response.projectResourceOptimization;
  }

  async getUsageHistory(resourceId: string, startDate: string, endDate: string): Promise<ResourceUsageHistory[]> {
    const query = `
      query getResourceUsageHistory($resourceId: String!, $startDate: String!, $endDate: String!) {
        resourceUsageHistory(resourceId: $resourceId, startDate: $startDate, endDate: $endDate) {
          edges {
            node {
              id
              resourceId
              timestamp
              value
              unit
              metadata
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      resourceUsageHistory: { edges: Array<{ node: ResourceUsageHistory }> };
    }>(query, { resourceId, startDate, endDate });

    return response.resourceUsageHistory.edges.map(edge => edge.node);
  }
}