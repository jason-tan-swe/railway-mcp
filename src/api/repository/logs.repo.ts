import { RailwayApiClient } from "../api-client.js";
import { LogEntry, HttpLogEntry, Metric, MetricMeasurement, MetricTag } from "../../types.js";

export class LogsRepository {
  constructor(private client: RailwayApiClient) {}

  async getBuildLogs(
    deploymentId: string,
    filter?: string,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<LogEntry[]> {
    const query = `
      query buildLogs(
        $deploymentId: String!
        $filter: String
        $limit: Int
        $startDate: DateTime
        $endDate: DateTime
      ) {
        buildLogs(
          deploymentId: $deploymentId
          filter: $filter
          limit: $limit
          startDate: $startDate
          endDate: $endDate
        ) {
          timestamp
          message
          severity
          attributes
          tags
        }
      }
    `;

    const variables = {
      deploymentId,
      filter,
      limit,
      startDate,
      endDate
    };

    const data = await this.client.request<{ buildLogs: LogEntry[] }>(
      query,
      variables
    );

    return data.buildLogs || [];
  }

  async getDeploymentLogs(
    deploymentId: string,
    filter?: string,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<LogEntry[]> {
    const query = `
      query deploymentLogs(
        $deploymentId: String!
        $filter: String
        $limit: Int
        $startDate: DateTime
        $endDate: DateTime
      ) {
        deploymentLogs(
          deploymentId: $deploymentId
          filter: $filter
          limit: $limit
          startDate: $startDate
          endDate: $endDate
        ) {
          timestamp
          message
          severity
          attributes
          tags
        }
      }
    `;

    const variables = {
      deploymentId,
      filter,
      limit,
      startDate,
      endDate
    };

    const data = await this.client.request<{ deploymentLogs: LogEntry[] }>(
      query,
      variables
    );

    return data.deploymentLogs || [];
  }

  async getEnvironmentLogs(
    environmentId: string,
    filter?: string,
    limit?: number,
    startDate?: string,
    endDate?: string,
    anchorDate?: string
  ): Promise<LogEntry[]> {
    const query = `
      query environmentLogs(
        $environmentId: String!
        $filter: String
        $afterDate: String
        $afterLimit: Int
        $anchorDate: String
        $beforeDate: String
        $beforeLimit: Int
      ) {
        environmentLogs(
          environmentId: $environmentId
          filter: $filter
          afterDate: $afterDate
          afterLimit: $afterLimit
          anchorDate: $anchorDate
          beforeDate: $beforeDate
          beforeLimit: $beforeLimit
        ) {
          timestamp
          message
          severity
          attributes
          tags
        }
      }
    `;

    // Map our parameters to the GraphQL API's expected format
    const variables = {
      environmentId,
      filter,
      afterDate: startDate,
      afterLimit: limit,
      anchorDate,
      beforeDate: endDate,
      beforeLimit: limit
    };

    const data = await this.client.request<{ environmentLogs: LogEntry[] }>(
      query,
      variables
    );

    return data.environmentLogs || [];
  }

  async getHttpLogs(
    deploymentId: string,
    filter?: string,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<HttpLogEntry[]> {
    const query = `
      query httpLogs(
        $deploymentId: String!
        $filter: String
        $limit: Int
        $startDate: String
        $endDate: String
      ) {
        httpLogs(
          deploymentId: $deploymentId
          filter: $filter
          limit: $limit
          startDate: $startDate
          endDate: $endDate
        ) {
          timestamp
          requestId
          deploymentId
          deploymentInstanceId
          
          method
          path
          host
          clientUa
          srcIp
          
          httpStatus
          responseDetails
          totalDuration
          
          downstreamProto
          upstreamProto
          upstreamAddress
          upstreamRqDuration
          edgeRegion
          
          rxBytes
          txBytes
        }
      }
    `;

    const variables = {
      deploymentId,
      filter,
      limit,
      startDate,
      endDate
    };

    const data = await this.client.request<{ httpLogs: HttpLogEntry[] }>(
      query,
      variables
    );

    return data.httpLogs || [];
  }

  async getMetrics(
    startDate: string,
    measurements: MetricMeasurement[],
    groupBy: MetricTag[],
    options: {
      endDate?: string;
      projectId?: string;
      environmentId?: string;
      serviceId?: string;
      deploymentId?: string;
      pluginId?: string;
      volumeId?: string;
      sampleRateSeconds?: number;
      averagingWindowSeconds?: number;
      includeDeleted?: boolean;
    } = {}
  ): Promise<Metric[]> {
    const query = `
      query metrics(
        $startDate: DateTime!
        $measurements: [MetricMeasurement]!
        $groupBy: [MetricTag]!
        $endDate: DateTime
        $projectId: String
        $environmentId: String
        $serviceId: String
        $deploymentId: String
        $pluginId: String
        $volumeId: String
        $sampleRateSeconds: Int
        $averagingWindowSeconds: Int
        $includeDeleted: Boolean
      ) {
        metrics(
          startDate: $startDate
          measurements: $measurements
          groupBy: $groupBy
          endDate: $endDate
          projectId: $projectId
          environmentId: $environmentId
          serviceId: $serviceId
          deploymentId: $deploymentId
          pluginId: $pluginId
          volumeId: $volumeId
          sampleRateSeconds: $sampleRateSeconds
          averagingWindowSeconds: $averagingWindowSeconds
          includeDeleted: $includeDeleted
        ) {
          measurement
          tags
          values {
            timestamp
            value
          }
        }
      }
    `;

    const variables = {
      startDate,
      measurements,
      groupBy,
      ...options
    };

    const data = await this.client.request<{ metrics: Metric[] }>(
      query,
      variables
    );

    return data.metrics || [];
  }

  async getPluginLogs(
    pluginId: string,
    environmentId: string,
    filter?: string,
    limit?: number,
    startDate?: string,
    endDate?: string
  ): Promise<LogEntry[]> {
    const query = `
      query pluginLogs(
        $pluginId: String!
        $environmentId: String!
        $filter: String
        $limit: Int
        $startDate: DateTime
        $endDate: DateTime
      ) {
        pluginLogs(
          pluginId: $pluginId
          environmentId: $environmentId
          filter: $filter
          limit: $limit
          startDate: $startDate
          endDate: $endDate
        ) {
          timestamp
          message
          severity
          attributes
          tags
        }
      }
    `;

    const variables = {
      pluginId,
      environmentId,
      filter,
      limit,
      startDate,
      endDate
    };

    const data = await this.client.request<{ pluginLogs: LogEntry[] }>(
      query,
      variables
    );

    return data.pluginLogs || [];
  }
}