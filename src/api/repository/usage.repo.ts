import { BaseApiClient } from '../base-client.js';

export interface UsageMetrics {
  id: string;
  teamId: string;
  projectId?: string;
  serviceId?: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    cpu: UsageMetric;
    memory: UsageMetric;
    network: UsageMetric;
    disk: UsageMetric;
    builds: UsageMetric;
    executions: UsageMetric;
  };
  costs: {
    total: number;
    breakdown: CostBreakdown;
    currency: string;
  };
}

export interface UsageMetric {
  used: number;
  limit?: number;
  unit: string;
  cost: number;
}

export interface CostBreakdown {
  compute: number;
  memory: number;
  network: number;
  storage: number;
  builds: number;
  addOns: number;
}

export interface BillingInfo {
  teamId: string;
  plan: {
    name: string;
    type: 'FREE' | 'HOBBY' | 'PRO' | 'TEAM' | 'ENTERPRISE';
    limits: PlanLimits;
    price: number;
    currency: string;
    billingCycle: 'MONTHLY' | 'ANNUAL';
  };
  currentUsage: {
    amount: number;
    currency: string;
    period: {
      start: string;
      end: string;
    };
  };
  paymentMethod?: {
    type: 'CARD' | 'BANK' | 'PAYPAL';
    last4?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  nextBillingDate?: string;
}

export interface PlanLimits {
  projects: number;
  services: number;
  cpu: number;
  memory: number;
  storage: number;
  networkGB: number;
  buildMinutes: number;
  executions: number;
}

export interface UsageAlert {
  id: string;
  teamId: string;
  type: 'CPU' | 'MEMORY' | 'NETWORK' | 'STORAGE' | 'COST';
  threshold: number;
  currentValue: number;
  isActive: boolean;
  notificationEmail?: string;
  createdAt: string;
}

export class UsageRepository {
  constructor(private client: BaseApiClient) {}

  async getTeamUsage(teamId: string, startDate?: string, endDate?: string): Promise<UsageMetrics> {
    const query = `
      query getTeamUsage($teamId: String!, $startDate: String, $endDate: String) {
        teamUsage(teamId: $teamId, startDate: $startDate, endDate: $endDate) {
          id
          teamId
          period {
            start
            end
          }
          metrics {
            cpu {
              used
              limit
              unit
              cost
            }
            memory {
              used
              limit
              unit
              cost
            }
            network {
              used
              limit
              unit
              cost
            }
            disk {
              used
              limit
              unit
              cost
            }
            builds {
              used
              limit
              unit
              cost
            }
            executions {
              used
              limit
              unit
              cost
            }
          }
          costs {
            total
            breakdown {
              compute
              memory
              network
              storage
              builds
              addOns
            }
            currency
          }
        }
      }
    `;

    const response = await this.client.request<{ teamUsage: UsageMetrics }>(query, {
      teamId,
      startDate,
      endDate
    });

    return response.teamUsage;
  }

  async getProjectUsage(projectId: string, startDate?: string, endDate?: string): Promise<UsageMetrics> {
    const query = `
      query getProjectUsage($projectId: String!, $startDate: String, $endDate: String) {
        projectUsage(projectId: $projectId, startDate: $startDate, endDate: $endDate) {
          id
          teamId
          projectId
          period {
            start
            end
          }
          metrics {
            cpu {
              used
              limit
              unit
              cost
            }
            memory {
              used
              limit
              unit
              cost
            }
            network {
              used
              limit
              unit
              cost
            }
            disk {
              used
              limit
              unit
              cost
            }
            builds {
              used
              limit
              unit
              cost
            }
            executions {
              used
              limit
              unit
              cost
            }
          }
          costs {
            total
            breakdown {
              compute
              memory
              network
              storage
              builds
              addOns
            }
            currency
          }
        }
      }
    `;

    const response = await this.client.request<{ projectUsage: UsageMetrics }>(query, {
      projectId,
      startDate,
      endDate
    });

    return response.projectUsage;
  }

  async getBillingInfo(teamId: string): Promise<BillingInfo> {
    const query = `
      query getBillingInfo($teamId: String!) {
        teamBilling(teamId: $teamId) {
          teamId
          plan {
            name
            type
            limits {
              projects
              services
              cpu
              memory
              storage
              networkGB
              buildMinutes
              executions
            }
            price
            currency
            billingCycle
          }
          currentUsage {
            amount
            currency
            period {
              start
              end
            }
          }
          paymentMethod {
            type
            last4
            expiryMonth
            expiryYear
          }
          nextBillingDate
        }
      }
    `;

    const response = await this.client.request<{ teamBilling: BillingInfo }>(query, { teamId });
    return response.teamBilling;
  }

  async getUsageAlerts(teamId: string): Promise<UsageAlert[]> {
    const query = `
      query getUsageAlerts($teamId: String!) {
        usageAlerts(teamId: $teamId) {
          edges {
            node {
              id
              teamId
              type
              threshold
              currentValue
              isActive
              notificationEmail
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      usageAlerts: { edges: Array<{ node: UsageAlert }> };
    }>(query, { teamId });

    return response.usageAlerts.edges.map(edge => edge.node);
  }
}