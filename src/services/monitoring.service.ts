import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class MonitoringService extends BaseService {
  constructor() {
    super();
  }

  async queryMetrics(projectId: string, serviceId?: string, metricName?: string, startTime?: string, endTime?: string, step?: string, labels?: Record<string, string>) {
    try {
      const end = endTime || new Date().toISOString();
      const start = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const metrics = await this.client.monitoring.queryMetrics({
        projectId,
        serviceId,
        metricName,
        startTime: start,
        endTime: end,
        step: step || '5m',
        labels
      });

      const uniqueMetrics = [...new Set(metrics.map(m => m.name))];
      const latestValues = uniqueMetrics.map(name => {
        const metricData = metrics.filter(m => m.name === name);
        const latest = metricData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        return { name, value: latest?.value, unit: latest?.unit, timestamp: latest?.timestamp };
      });

      return createSuccessResponse({
        text: `Found ${metrics.length} metric data points across ${uniqueMetrics.length} metrics`,
        data: {
          projectId,
          serviceId: serviceId || 'All services',
          timeRange: { start, end },
          summary: {
            totalDataPoints: metrics.length,
            uniqueMetrics: uniqueMetrics.length,
            step
          },
          latestValues,
          metrics: metrics.map(metric => ({
            id: metric.id,
            name: metric.name,
            type: metric.type,
            value: metric.value,
            unit: metric.unit,
            labels: metric.labels,
            timestamp: metric.timestamp
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to query metrics: ${formatError(error)}`);
    }
  }

  async createCustomMetric(projectId: string, serviceId: string, name: string, type: string, value: number, labels?: Record<string, string>, unit?: string) {
    try {
      const metric = await this.client.monitoring.createCustomMetric(
        projectId, serviceId, name, type, value, labels, unit || 'count'
      );

      return createSuccessResponse({
        text: `Custom metric "${name}" created with value ${value}`,
        data: {
          id: metric.id,
          name: metric.name,
          type: metric.type,
          value: metric.value,
          unit: metric.unit,
          labels: metric.labels,
          projectId: metric.projectId,
          serviceId: metric.serviceId,
          timestamp: metric.timestamp
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create custom metric: ${formatError(error)}`);
    }
  }

  async getAPMData(projectId: string, serviceId?: string, startTime?: string, endTime?: string) {
    try {
      const end = endTime || new Date().toISOString();
      const start = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const apmData = await this.client.monitoring.getAPMData(projectId, serviceId, start, end);

      const avgResponseTime = apmData.reduce((sum, d) => sum + d.responseTime, 0) / apmData.length || 0;
      const avgThroughput = apmData.reduce((sum, d) => sum + d.throughput, 0) / apmData.length || 0;
      const avgErrorRate = apmData.reduce((sum, d) => sum + d.errorRate, 0) / apmData.length || 0;
      const maxCpuUsage = Math.max(...apmData.map(d => d.cpuUsage), 0);
      const maxMemoryUsage = Math.max(...apmData.map(d => d.memoryUsage), 0);

      return createSuccessResponse({
        text: `APM data shows ${avgResponseTime.toFixed(2)}ms avg response time, ${avgErrorRate.toFixed(2)}% error rate`,
        data: {
          projectId,
          serviceId: serviceId || 'All services',
          timeRange: { start, end },
          summary: {
            dataPoints: apmData.length,
            averageResponseTime: `${avgResponseTime.toFixed(2)}ms`,
            averageThroughput: `${avgThroughput.toFixed(2)} req/sec`,
            averageErrorRate: `${avgErrorRate.toFixed(2)}%`,
            peakCpuUsage: `${maxCpuUsage.toFixed(1)}%`,
            peakMemoryUsage: `${maxMemoryUsage.toFixed(1)}%`
          },
          apmData: apmData.map(data => ({
            id: data.id,
            serviceId: data.serviceId,
            timestamp: data.timestamp,
            responseTime: `${data.responseTime}ms`,
            throughput: `${data.throughput} req/sec`,
            errorRate: `${data.errorRate}%`,
            cpuUsage: `${data.cpuUsage}%`,
            memoryUsage: `${data.memoryUsage}%`,
            customMetrics: data.customMetrics
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get APM data: ${formatError(error)}`);
    }
  }

  async listAlerts(projectId: string, serviceId?: string) {
    try {
      const alerts = await this.client.monitoring.listAlerts(projectId, serviceId);
      
      const activeCount = alerts.filter(a => a.isActive).length;
      const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;
      const bySeverity = alerts.reduce((acc, alert) => {
        acc[alert.severity] = (acc[alert.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return createSuccessResponse({
        text: `Found ${alerts.length} alerts (${activeCount} active, ${criticalCount} critical)`,
        data: {
          projectId,
          serviceId: serviceId || 'All services',
          summary: {
            totalAlerts: alerts.length,
            activeCount,
            criticalCount,
            bySeverity
          },
          alerts: alerts.map(alert => ({
            id: alert.id,
            name: alert.name,
            description: alert.description,
            condition: alert.condition,
            threshold: alert.threshold,
            severity: alert.severity,
            isActive: alert.isActive,
            notificationCount: alert.notifications.length,
            notifications: alert.notifications,
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list alerts: ${formatError(error)}`);
    }
  }

  async createAlert(projectId: string, name: string, description: string, condition: string, threshold: number, severity: string, notifications: Array<{type: string, destination: string}>, serviceId?: string) {
    try {
      const alert = await this.client.monitoring.createAlert(
        projectId, name, description, condition, threshold, severity, notifications, serviceId
      );

      return createSuccessResponse({
        text: `Alert "${name}" created with ${severity} severity`,
        data: {
          id: alert.id,
          name: alert.name,
          description: alert.description,
          condition: alert.condition,
          threshold: alert.threshold,
          severity: alert.severity,
          isActive: alert.isActive,
          notifications: alert.notifications,
          projectId: alert.projectId,
          serviceId: alert.serviceId,
          createdAt: alert.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create alert: ${formatError(error)}`);
    }
  }

  async updateAlert(alertId: string, isActive?: boolean, threshold?: number, notifications?: Array<{type: string, destination: string}>) {
    try {
      const alert = await this.client.monitoring.updateAlert(alertId, isActive, threshold, notifications);

      return createSuccessResponse({
        text: `Alert "${alert.name}" updated successfully`,
        data: {
          id: alert.id,
          name: alert.name,
          isActive: alert.isActive,
          threshold: alert.threshold,
          notifications: alert.notifications,
          updatedAt: alert.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update alert: ${formatError(error)}`);
    }
  }

  async deleteAlert(alertId: string) {
    try {
      const success = await this.client.monitoring.deleteAlert(alertId);
      
      if (success) {
        return createSuccessResponse({
          text: "Alert deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete alert");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete alert: ${formatError(error)}`);
    }
  }

  async getTraces(projectId: string, serviceId?: string, startTime?: string, endTime?: string, operationName?: string) {
    try {
      const end = endTime || new Date().toISOString();
      const start = startTime || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const traces = await this.client.monitoring.getTraces(projectId, serviceId, start, end, operationName);

      const uniqueTraces = [...new Set(traces.map(t => t.traceId))];
      const avgDuration = traces.reduce((sum, t) => sum + t.duration, 0) / traces.length || 0;
      const errorCount = traces.filter(t => t.status === 'ERROR').length;
      const services = [...new Set(traces.map(t => t.serviceName))];

      return createSuccessResponse({
        text: `Found ${traces.length} spans across ${uniqueTraces.length} traces (${errorCount} errors)`,
        data: {
          projectId,
          serviceId: serviceId || 'All services',
          timeRange: { start, end },
          summary: {
            totalSpans: traces.length,
            uniqueTraces: uniqueTraces.length,
            averageDuration: `${avgDuration.toFixed(2)}ms`,
            errorCount,
            errorRate: `${((errorCount / traces.length) * 100).toFixed(2)}%`,
            services
          },
          traces: traces.map(trace => ({
            id: trace.id,
            traceId: trace.traceId,
            parentId: trace.parentId,
            operationName: trace.operationName,
            serviceName: trace.serviceName,
            duration: `${trace.duration}ms`,
            status: trace.status,
            startTime: trace.startTime,
            endTime: trace.endTime,
            tags: trace.tags,
            logCount: trace.logs.length
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get traces: ${formatError(error)}`);
    }
  }

  async getTraceDetails(traceId: string) {
    try {
      const spans = await this.client.monitoring.getTraceById(traceId);

      const totalDuration = Math.max(...spans.map(s => s.duration), 0);
      const errorSpans = spans.filter(s => s.status === 'ERROR');
      const services = [...new Set(spans.map(s => s.serviceName))];
      const operations = [...new Set(spans.map(s => s.operationName))];

      return createSuccessResponse({
        text: `Trace contains ${spans.length} spans across ${services.length} services`,
        data: {
          traceId,
          summary: {
            totalSpans: spans.length,
            totalDuration: `${totalDuration.toFixed(2)}ms`,
            services,
            operations,
            errorCount: errorSpans.length,
            hasErrors: errorSpans.length > 0
          },
          spans: spans.map(span => ({
            id: span.id,
            parentId: span.parentId,
            operationName: span.operationName,
            serviceName: span.serviceName,
            duration: `${span.duration}ms`,
            status: span.status,
            startTime: span.startTime,
            endTime: span.endTime,
            tags: span.tags,
            logs: span.logs.map(log => ({
              timestamp: log.timestamp,
              level: log.level,
              message: log.message.substring(0, 200) + (log.message.length > 200 ? '...' : '')
            }))
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get trace details: ${formatError(error)}`);
    }
  }
}

export const monitoringService = new MonitoringService();