import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class UsageService extends BaseService {
  constructor() {
    super();
  }

  async getTeamUsage(teamId: string, startDate?: string, endDate?: string) {
    try {
      const usage = await this.client.usage.getTeamUsage(teamId, startDate, endDate);
      
      const totalCost = usage.costs.total;
      const highestCostMetric = Object.entries(usage.metrics)
        .sort(([,a], [,b]) => b.cost - a.cost)[0];

      const utilizationPercentages = Object.entries(usage.metrics)
        .filter(([, metric]) => metric.limit)
        .map(([name, metric]) => ({
          name,
          percentage: Math.round((metric.used / metric.limit!) * 100)
        }));

      return createSuccessResponse({
        text: `Team usage: $${totalCost.toFixed(2)} for period ${usage.period.start} to ${usage.period.end}`,
        data: {
          teamId: usage.teamId,
          period: usage.period,
          summary: {
            totalCost: `$${totalCost.toFixed(2)} ${usage.costs.currency}`,
            highestCostMetric: {
              name: highestCostMetric[0],
              cost: `$${highestCostMetric[1].cost.toFixed(2)}`,
              usage: `${highestCostMetric[1].used} ${highestCostMetric[1].unit}`
            }
          },
          utilization: utilizationPercentages,
          breakdown: {
            compute: `$${usage.costs.breakdown.compute.toFixed(2)}`,
            memory: `$${usage.costs.breakdown.memory.toFixed(2)}`,
            network: `$${usage.costs.breakdown.network.toFixed(2)}`,
            storage: `$${usage.costs.breakdown.storage.toFixed(2)}`,
            builds: `$${usage.costs.breakdown.builds.toFixed(2)}`,
            addOns: `$${usage.costs.breakdown.addOns.toFixed(2)}`
          },
          metrics: Object.entries(usage.metrics).map(([name, metric]) => ({
            name,
            used: metric.used,
            limit: metric.limit,
            unit: metric.unit,
            cost: `$${metric.cost.toFixed(2)}`,
            utilization: metric.limit ? `${Math.round((metric.used / metric.limit) * 100)}%` : 'Unlimited'
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get team usage: ${formatError(error)}`);
    }
  }

  async getProjectUsage(projectId: string, startDate?: string, endDate?: string) {
    try {
      const usage = await this.client.usage.getProjectUsage(projectId, startDate, endDate);
      
      const totalCost = usage.costs.total;
      const topCostComponents = Object.entries(usage.costs.breakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([name, cost]) => ({ name, cost: `$${cost.toFixed(2)}` }));

      return createSuccessResponse({
        text: `Project usage: $${totalCost.toFixed(2)} for period ${usage.period.start} to ${usage.period.end}`,
        data: {
          projectId: usage.projectId,
          teamId: usage.teamId,
          period: usage.period,
          summary: {
            totalCost: `$${totalCost.toFixed(2)} ${usage.costs.currency}`,
            topCostComponents
          },
          metrics: Object.entries(usage.metrics).map(([name, metric]) => ({
            name,
            used: metric.used,
            unit: metric.unit,
            cost: `$${metric.cost.toFixed(2)}`
          })),
          breakdown: usage.costs.breakdown
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get project usage: ${formatError(error)}`);
    }
  }

  async getBillingInfo(teamId: string) {
    try {
      const billing = await this.client.usage.getBillingInfo(teamId);
      
      const planUtilization = Object.entries(billing.plan.limits).map(([resource, limit]) => ({
        resource,
        limit,
        // Note: Current usage would need to be calculated from actual usage metrics
        available: limit
      }));

      const daysUntilBilling = billing.nextBillingDate 
        ? Math.ceil((new Date(billing.nextBillingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;

      return createSuccessResponse({
        text: `${billing.plan.name} plan - $${billing.currentUsage.amount.toFixed(2)} current usage`,
        data: {
          teamId: billing.teamId,
          plan: {
            name: billing.plan.name,
            type: billing.plan.type,
            price: `$${billing.plan.price} ${billing.plan.currency}/${billing.plan.billingCycle.toLowerCase()}`,
            limits: billing.plan.limits
          },
          currentPeriod: {
            usage: `$${billing.currentUsage.amount.toFixed(2)} ${billing.currentUsage.currency}`,
            period: billing.currentUsage.period,
            daysRemaining: daysUntilBilling
          },
          payment: billing.paymentMethod ? {
            type: billing.paymentMethod.type,
            last4: billing.paymentMethod.last4,
            expires: billing.paymentMethod.expiryMonth && billing.paymentMethod.expiryYear 
              ? `${billing.paymentMethod.expiryMonth}/${billing.paymentMethod.expiryYear}`
              : undefined
          } : null,
          nextBillingDate: billing.nextBillingDate,
          planLimits: planUtilization
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get billing info: ${formatError(error)}`);
    }
  }

  async getUsageAlerts(teamId: string) {
    try {
      const alerts = await this.client.usage.getUsageAlerts(teamId);
      
      const activeAlerts = alerts.filter(alert => alert.isActive);
      const alertsByType = alerts.reduce((acc, alert) => {
        if (!acc[alert.type]) acc[alert.type] = [];
        acc[alert.type].push(alert);
        return acc;
      }, {} as Record<string, typeof alerts>);

      const criticalAlerts = activeAlerts.filter(alert => 
        alert.currentValue >= alert.threshold * 0.9
      );

      return createSuccessResponse({
        text: `${alerts.length} usage alerts configured (${activeAlerts.length} active, ${criticalAlerts.length} critical)`,
        data: {
          totalCount: alerts.length,
          activeCount: activeAlerts.length,
          criticalCount: criticalAlerts.length,
          byType: Object.entries(alertsByType).map(([type, typeAlerts]) => ({
            type,
            count: typeAlerts.length,
            active: typeAlerts.filter(a => a.isActive).length
          })),
          alerts: alerts.map(alert => ({
            id: alert.id,
            type: alert.type,
            threshold: alert.threshold,
            currentValue: alert.currentValue,
            isActive: alert.isActive,
            severity: alert.currentValue >= alert.threshold * 0.9 ? 'CRITICAL' :
                     alert.currentValue >= alert.threshold * 0.7 ? 'WARNING' : 'OK',
            utilization: `${Math.round((alert.currentValue / alert.threshold) * 100)}%`,
            notificationEmail: alert.notificationEmail,
            createdAt: alert.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get usage alerts: ${formatError(error)}`);
    }
  }

  async compareUsage(teamId: string, projectIds?: string[]) {
    try {
      const teamUsage = await this.client.usage.getTeamUsage(teamId);
      
      let projectComparisons: any[] = [];
      if (projectIds?.length) {
        const projectUsagePromises = projectIds.map(id => 
          this.client.usage.getProjectUsage(id)
        );
        const projectUsages = await Promise.all(projectUsagePromises);
        
        projectComparisons = projectUsages.map(usage => ({
          projectId: usage.projectId,
          totalCost: usage.costs.total,
          percentage: (usage.costs.total / teamUsage.costs.total) * 100,
          topMetric: Object.entries(usage.metrics)
            .sort(([,a], [,b]) => b.cost - a.cost)[0]
        }));
      }

      return createSuccessResponse({
        text: `Usage comparison for team with ${projectComparisons.length} projects`,
        data: {
          teamTotal: `$${teamUsage.costs.total.toFixed(2)}`,
          period: teamUsage.period,
          projectBreakdown: projectComparisons,
          teamMetrics: Object.entries(teamUsage.metrics).map(([name, metric]) => ({
            name,
            cost: `$${metric.cost.toFixed(2)}`,
            percentage: `${Math.round((metric.cost / teamUsage.costs.total) * 100)}%`
          })).sort((a, b) => parseFloat(b.cost.slice(1)) - parseFloat(a.cost.slice(1)))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to compare usage: ${formatError(error)}`);
    }
  }
}

export const usageService = new UsageService();