import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class ResourceService extends BaseService {
  constructor() {
    super();
  }

  async getTeamQuotas(teamId: string) {
    try {
      const quotas = await this.client.resource.getTeamQuotas(teamId);
      
      const totalAllocated = quotas.reduce((sum, quota) => sum + quota.allocated, 0);
      const totalUsed = quotas.reduce((sum, quota) => sum + quota.used, 0);
      const utilizationRate = totalAllocated > 0 ? (totalUsed / totalAllocated) * 100 : 0;

      const byResourceType = quotas.reduce((acc, quota) => {
        if (!acc[quota.resourceType]) acc[quota.resourceType] = [];
        acc[quota.resourceType].push(quota);
        return acc;
      }, {} as Record<string, typeof quotas>);

      const criticalQuotas = quotas.filter(quota => 
        (quota.used / quota.allocated) > 0.9
      );

      return createSuccessResponse({
        text: `Team has ${quotas.length} resource quotas with ${utilizationRate.toFixed(1)}% utilization`,
        data: {
          teamId,
          summary: {
            totalQuotas: quotas.length,
            utilizationRate: `${utilizationRate.toFixed(1)}%`,
            criticalCount: criticalQuotas.length
          },
          byResourceType: Object.entries(byResourceType).map(([type, typeQuotas]) => ({
            resourceType: type,
            count: typeQuotas.length,
            totalAllocated: typeQuotas.reduce((sum, q) => sum + q.allocated, 0),
            totalUsed: typeQuotas.reduce((sum, q) => sum + q.used, 0),
            utilization: typeQuotas.reduce((sum, q) => sum + (q.used / q.allocated) * 100, 0) / typeQuotas.length
          })),
          quotas: quotas.map(quota => ({
            resourceType: quota.resourceType,
            allocated: quota.allocated,
            used: quota.used,
            unit: quota.unit,
            utilization: `${Math.round((quota.used / quota.allocated) * 100)}%`,
            priority: quota.priority,
            isShared: quota.isShared,
            status: (quota.used / quota.allocated) > 0.9 ? 'CRITICAL' :
                   (quota.used / quota.allocated) > 0.7 ? 'WARNING' : 'OK',
            expiresAt: quota.expiresAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get team quotas: ${formatError(error)}`);
    }
  }

  async getProjectAllocations(projectId: string) {
    try {
      const allocations = await this.client.resource.getProjectAllocations(projectId);
      
      const totalAllocations = allocations.length;
      const reservedCount = allocations.filter(a => a.isReserved).length;
      
      const byResourceType = allocations.reduce((acc, allocation) => {
        if (!acc[allocation.resourceType]) acc[allocation.resourceType] = [];
        acc[allocation.resourceType].push(allocation);
        return acc;
      }, {} as Record<string, typeof allocations>);

      const byPriority = allocations.reduce((acc, allocation) => {
        if (!acc[allocation.priority]) acc[allocation.priority] = 0;
        acc[allocation.priority]++;
        return acc;
      }, {} as Record<string, number>);

      return createSuccessResponse({
        text: `Project has ${totalAllocations} resource allocations (${reservedCount} reserved)`,
        data: {
          projectId,
          summary: {
            totalAllocations,
            reservedCount,
            sharedCount: totalAllocations - reservedCount
          },
          byResourceType: Object.entries(byResourceType).map(([type, typeAllocations]) => ({
            resourceType: type,
            count: typeAllocations.length,
            totalAmount: typeAllocations.reduce((sum, a) => sum + a.amount, 0),
            unit: typeAllocations[0]?.unit || '',
            reserved: typeAllocations.filter(a => a.isReserved).length
          })),
          byPriority,
          allocations: allocations.map(allocation => ({
            id: allocation.id,
            resourceType: allocation.resourceType,
            amount: allocation.amount,
            unit: allocation.unit,
            priority: allocation.priority,
            isReserved: allocation.isReserved,
            serviceId: allocation.serviceId,
            createdAt: allocation.createdAt,
            updatedAt: allocation.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get project allocations: ${formatError(error)}`);
    }
  }

  async updateAllocation(allocationId: string, amount: number, priority?: string) {
    try {
      const allocation = await this.client.resource.updateAllocation(allocationId, amount, priority);

      return createSuccessResponse({
        text: `Resource allocation updated: ${allocation.amount} ${allocation.unit} ${allocation.resourceType}`,
        data: {
          id: allocation.id,
          resourceType: allocation.resourceType,
          amount: allocation.amount,
          unit: allocation.unit,
          priority: allocation.priority,
          isReserved: allocation.isReserved,
          updatedAt: allocation.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update allocation: ${formatError(error)}`);
    }
  }

  async getResourceLimits(teamId: string) {
    try {
      const limits = await this.client.resource.getResourceLimits(teamId);
      
      const enforcedCount = limits.filter(limit => limit.isEnforced).length;
      const criticalLimits = limits.filter(limit => 
        limit.alertThreshold >= 90
      );

      return createSuccessResponse({
        text: `Team has ${limits.length} resource limits (${enforcedCount} enforced, ${criticalLimits.length} critical)`,
        data: {
          teamId,
          summary: {
            totalLimits: limits.length,
            enforcedCount,
            criticalCount: criticalLimits.length
          },
          limits: limits.map(limit => ({
            id: limit.id,
            resourceType: limit.resourceType,
            hardLimit: limit.hardLimit,
            softLimit: limit.softLimit,
            unit: limit.unit,
            alertThreshold: `${limit.alertThreshold}%`,
            isEnforced: limit.isEnforced,
            severity: limit.alertThreshold >= 90 ? 'CRITICAL' :
                     limit.alertThreshold >= 70 ? 'WARNING' : 'INFO',
            createdAt: limit.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get resource limits: ${formatError(error)}`);
    }
  }

  async updateResourceLimit(limitId: string, hardLimit?: number, softLimit?: number, alertThreshold?: number) {
    try {
      const limit = await this.client.resource.updateResourceLimit(limitId, hardLimit, softLimit, alertThreshold);

      return createSuccessResponse({
        text: `Resource limit updated for ${limit.resourceType}`,
        data: {
          id: limit.id,
          resourceType: limit.resourceType,
          hardLimit: limit.hardLimit,
          softLimit: limit.softLimit,
          unit: limit.unit,
          alertThreshold: `${limit.alertThreshold}%`,
          isEnforced: limit.isEnforced
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update resource limit: ${formatError(error)}`);
    }
  }

  async getOptimizationRecommendations(projectId: string) {
    try {
      const optimization = await this.client.resource.getOptimizationRecommendations(projectId);
      
      const highConfidenceRecs = optimization.recommendations.filter(rec => rec.confidence === 'HIGH');
      const totalSavings = optimization.totalEstimatedSavings;

      const byType = optimization.recommendations.reduce((acc, rec) => {
        if (!acc[rec.type]) acc[rec.type] = [];
        acc[rec.type].push(rec);
        return acc;
      }, {} as Record<string, typeof optimization.recommendations>);

      return createSuccessResponse({
        text: `${optimization.recommendations.length} optimization recommendations with $${totalSavings.toFixed(2)} potential savings`,
        data: {
          projectId: optimization.projectId,
          summary: {
            totalRecommendations: optimization.recommendations.length,
            highConfidenceCount: highConfidenceRecs.length,
            totalEstimatedSavings: `$${totalSavings.toFixed(2)}`,
            analysisDate: optimization.analysisDate
          },
          byType: Object.entries(byType).map(([type, typeRecs]) => ({
            type,
            count: typeRecs.length,
            estimatedSavings: `$${typeRecs.reduce((sum, rec) => sum + (rec.estimatedSavings || 0), 0).toFixed(2)}`
          })),
          recommendations: optimization.recommendations.map(rec => ({
            type: rec.type,
            resourceType: rec.resourceType,
            currentValue: rec.currentValue,
            recommendedValue: rec.recommendedValue,
            estimatedSavings: rec.estimatedSavings ? `$${rec.estimatedSavings.toFixed(2)}` : 'N/A',
            confidence: rec.confidence,
            description: rec.description,
            impact: rec.estimatedSavings ? 
              (rec.estimatedSavings > 50 ? 'HIGH' : rec.estimatedSavings > 10 ? 'MEDIUM' : 'LOW') : 'UNKNOWN'
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get optimization recommendations: ${formatError(error)}`);
    }
  }
}

export const resourceService = new ResourceService();