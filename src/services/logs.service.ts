import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";
import { MetricMeasurement, MetricTag } from "../types.js";

export class LogsService extends BaseService {
  constructor() {
    super();
  }

  async getBuildLogs(
    deploymentId: string,
    options: {
      filter?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      const logs = await this.client.logs.getBuildLogs(
        deploymentId,
        options.filter,
        options.limit || 100,
        options.startDate,
        options.endDate
      );

      // Format logs for better readability
      const formattedLogs = logs.map(log => ({
        timestamp: log.timestamp,
        level: log.severity || 'INFO',
        message: log.message,
        ...(log.attributes && { attributes: log.attributes }),
        ...(log.tags && log.tags.length > 0 && { tags: log.tags })
      }));

      return createSuccessResponse({
        text: `Retrieved ${logs.length} build log entries`,
        data: {
          deploymentId,
          logCount: logs.length,
          logs: formattedLogs
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get build logs: ${formatError(error)}`);
    }
  }

  async getDeploymentLogs(
    deploymentId: string,
    options: {
      filter?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      const logs = await this.client.logs.getDeploymentLogs(
        deploymentId,
        options.filter,
        options.limit || 100,
        options.startDate,
        options.endDate
      );

      // Format logs for better readability
      const formattedLogs = logs.map(log => ({
        timestamp: log.timestamp,
        level: log.severity || 'INFO',
        message: log.message,
        ...(log.attributes && { attributes: log.attributes }),
        ...(log.tags && log.tags.length > 0 && { tags: log.tags })
      }));

      return createSuccessResponse({
        text: `Retrieved ${logs.length} deployment log entries`,
        data: {
          deploymentId,
          logCount: logs.length,
          logs: formattedLogs
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get deployment logs: ${formatError(error)}`);
    }
  }

  async getEnvironmentLogs(
    environmentId: string,
    options: {
      filter?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      const logs = await this.client.logs.getEnvironmentLogs(
        environmentId,
        options.filter,
        options.limit || 100,
        options.startDate,
        options.endDate
      );

      // Format logs for better readability
      const formattedLogs = logs.map(log => ({
        timestamp: log.timestamp,
        level: log.severity || 'INFO',
        message: log.message,
        ...(log.attributes && { attributes: log.attributes }),
        ...(log.tags && log.tags.length > 0 && { tags: log.tags })
      }));

      return createSuccessResponse({
        text: `Retrieved ${logs.length} environment log entries`,
        data: {
          environmentId,
          logCount: logs.length,
          logs: formattedLogs
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get environment logs: ${formatError(error)}`);
    }
  }

  async getHttpLogs(
    deploymentId: string,
    options: {
      filter?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      const logs = await this.client.logs.getHttpLogs(
        deploymentId,
        options.filter,
        options.limit || 100,
        options.startDate,
        options.endDate
      );

      // Format HTTP logs with relevant metrics
      const formattedLogs = logs.map(log => ({
        timestamp: log.timestamp,
        request: {
          method: log.method,
          path: log.path,
          host: log.host,
          userAgent: log.clientUa,
          sourceIp: log.srcIp
        },
        response: {
          status: log.httpStatus,
          duration: `${log.totalDuration}ms`,
          details: log.responseDetails
        },
        network: {
          bytesReceived: log.rxBytes,
          bytesSent: log.txBytes,
          edgeRegion: log.edgeRegion,
          upstreamDuration: log.upstreamRqDuration ? `${log.upstreamRqDuration}ms` : undefined
        },
        requestId: log.requestId
      }));

      // Calculate summary statistics
      const stats = {
        totalRequests: logs.length,
        avgDuration: logs.length > 0 
          ? Math.round(logs.reduce((sum, log) => sum + log.totalDuration, 0) / logs.length)
          : 0,
        statusCodes: logs.reduce((acc, log) => {
          const statusGroup = `${Math.floor(log.httpStatus / 100)}xx`;
          acc[statusGroup] = (acc[statusGroup] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalBytesReceived: logs.reduce((sum, log) => sum + log.rxBytes, 0),
        totalBytesSent: logs.reduce((sum, log) => sum + log.txBytes, 0)
      };

      return createSuccessResponse({
        text: `Retrieved ${logs.length} HTTP log entries`,
        data: {
          deploymentId,
          logCount: logs.length,
          stats,
          logs: formattedLogs
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get HTTP logs: ${formatError(error)}`);
    }
  }

  async getMetrics(
    options: {
      startDate: string;
      endDate?: string;
      measurements: MetricMeasurement[];
      groupBy: MetricTag[];
      projectId?: string;
      environmentId?: string;
      serviceId?: string;
      deploymentId?: string;
      sampleRateSeconds?: number;
    }
  ) {
    try {
      const metrics = await this.client.logs.getMetrics(
        options.startDate,
        options.measurements,
        options.groupBy,
        {
          endDate: options.endDate,
          projectId: options.projectId,
          environmentId: options.environmentId,
          serviceId: options.serviceId,
          deploymentId: options.deploymentId,
          sampleRateSeconds: options.sampleRateSeconds
        }
      );

      // Format metrics for better readability
      const formattedMetrics = metrics.map(metric => {
        // Calculate statistics for each metric
        const values = metric.values || [];
        const stats = values.length > 0 ? {
          min: Math.min(...values.map(v => v.value)),
          max: Math.max(...values.map(v => v.value)),
          avg: values.reduce((sum, v) => sum + v.value, 0) / values.length,
          latest: values[values.length - 1]?.value
        } : null;

        return {
          measurement: metric.measurement,
          tags: metric.tags,
          dataPoints: values.length,
          stats,
          values: values.slice(-10) // Return last 10 data points
        };
      });

      return createSuccessResponse({
        text: `Retrieved metrics for ${options.measurements.length} measurement(s)`,
        data: {
          timeRange: {
            start: options.startDate,
            end: options.endDate || 'now'
          },
          metrics: formattedMetrics
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get metrics: ${formatError(error)}`);
    }
  }

  async getPluginLogs(
    pluginId: string,
    environmentId: string,
    options: {
      filter?: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    } = {}
  ) {
    try {
      const logs = await this.client.logs.getPluginLogs(
        pluginId,
        environmentId,
        options.filter,
        options.limit || 100,
        options.startDate,
        options.endDate
      );

      // Format logs for better readability
      const formattedLogs = logs.map(log => ({
        timestamp: log.timestamp,
        level: log.severity || 'INFO',
        message: log.message,
        ...(log.attributes && { attributes: log.attributes }),
        ...(log.tags && log.tags.length > 0 && { tags: log.tags })
      }));

      return createSuccessResponse({
        text: `Retrieved ${logs.length} plugin log entries`,
        data: {
          pluginId,
          environmentId,
          logCount: logs.length,
          logs: formattedLogs
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get plugin logs: ${formatError(error)}`);
    }
  }
}

export const logsService = new LogsService();