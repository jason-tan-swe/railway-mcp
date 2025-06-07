import { BaseApiClient } from '../base-client.js';

export interface Metric {
  id: string;
  projectId: string;
  serviceId?: string;
  name: string;
  type: 'COUNTER' | 'GAUGE' | 'HISTOGRAM' | 'SUMMARY';
  description: string;
  unit: string;
  labels: Record<string, string>;
  value: number;
  timestamp: string;
  createdAt: string;
}

export interface MetricQueryInput {
  projectId: string;
  serviceId?: string;
  metricName?: string;
  startTime: string;
  endTime: string;
  step?: string; // e.g., '5m', '1h'
  labels?: Record<string, string>;
}

export interface Alert {
  id: string;
  projectId: string;
  serviceId?: string;
  name: string;
  description: string;
  condition: string;
  threshold: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isActive: boolean;
  notifications: Array<{
    type: 'EMAIL' | 'WEBHOOK' | 'SLACK' | 'PAGERDUTY';
    destination: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AlertRule {
  id: string;
  alertId: string;
  metric: string;
  operator: 'GT' | 'LT' | 'EQ' | 'NE' | 'GTE' | 'LTE';
  value: number;
  duration: string; // e.g., '5m'
  labels?: Record<string, string>;
}

export interface TraceSpan {
  id: string;
  traceId: string;
  parentId?: string;
  operationName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  duration: number;
  tags: Record<string, any>;
  logs: Array<{
    timestamp: string;
    message: string;
    level: string;
  }>;
  status: 'OK' | 'ERROR' | 'TIMEOUT';
}

export interface APMData {
  id: string;
  projectId: string;
  serviceId: string;
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  customMetrics?: Record<string, number>;
}

export class MonitoringRepository {
  constructor(private client: BaseApiClient) {}

  async queryMetrics(input: MetricQueryInput): Promise<Metric[]> {
    const query = `
      query queryMetrics($projectId: String!, $serviceId: String, $metricName: String, $startTime: String!, $endTime: String!, $step: String, $labels: JSON) {
        project(id: $projectId) {
          metrics(serviceId: $serviceId, name: $metricName, startTime: $startTime, endTime: $endTime, step: $step, labels: $labels) {
            edges {
              node {
                id
                projectId
                serviceId
                name
                type
                description
                unit
                labels
                value
                timestamp
                createdAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { metrics: { edges: Array<{ node: Metric }> } };
    }>(query, input as unknown as Record<string, unknown>);

    return response.project.metrics.edges.map(edge => edge.node);
  }

  async createCustomMetric(projectId: string, serviceId: string, name: string, type: string, value: number, labels?: Record<string, string>, unit?: string): Promise<Metric> {
    const query = `
      mutation createCustomMetric($projectId: String!, $serviceId: String!, $name: String!, $type: MetricType!, $value: Float!, $labels: JSON, $unit: String) {
        metricCreate(projectId: $projectId, serviceId: $serviceId, name: $name, type: $type, value: $value, labels: $labels, unit: $unit) {
          id
          projectId
          serviceId
          name
          type
          value
          labels
          unit
          timestamp
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ metricCreate: Metric }>(query, {
      projectId, serviceId, name, type, value, labels, unit
    });

    return response.metricCreate;
  }

  async getAPMData(projectId: string, serviceId?: string, startTime?: string, endTime?: string): Promise<APMData[]> {
    const query = `
      query getAPMData($projectId: String!, $serviceId: String, $startTime: String, $endTime: String) {
        project(id: $projectId) {
          apmData(serviceId: $serviceId, startTime: $startTime, endTime: $endTime) {
            edges {
              node {
                id
                projectId
                serviceId
                timestamp
                responseTime
                throughput
                errorRate
                cpuUsage
                memoryUsage
                customMetrics
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { apmData: { edges: Array<{ node: APMData }> } };
    }>(query, { projectId, serviceId, startTime, endTime });

    return response.project.apmData.edges.map(edge => edge.node);
  }

  async listAlerts(projectId: string, serviceId?: string): Promise<Alert[]> {
    const query = `
      query listAlerts($projectId: String!, $serviceId: String) {
        project(id: $projectId) {
          alerts(serviceId: $serviceId) {
            edges {
              node {
                id
                projectId
                serviceId
                name
                description
                condition
                threshold
                severity
                isActive
                notifications {
                  type
                  destination
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
      project: { alerts: { edges: Array<{ node: Alert }> } };
    }>(query, { projectId, serviceId });

    return response.project.alerts.edges.map(edge => edge.node);
  }

  async createAlert(projectId: string, name: string, description: string, condition: string, threshold: number, severity: string, notifications: Array<{type: string, destination: string}>, serviceId?: string): Promise<Alert> {
    const query = `
      mutation createAlert($projectId: String!, $serviceId: String, $name: String!, $description: String!, $condition: String!, $threshold: Float!, $severity: AlertSeverity!, $notifications: [NotificationInput!]!) {
        alertCreate(projectId: $projectId, serviceId: $serviceId, name: $name, description: $description, condition: $condition, threshold: $threshold, severity: $severity, notifications: $notifications) {
          id
          projectId
          serviceId
          name
          description
          condition
          threshold
          severity
          isActive
          notifications {
            type
            destination
          }
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ alertCreate: Alert }>(query, {
      projectId, serviceId, name, description, condition, threshold, severity, notifications
    });

    return response.alertCreate;
  }

  async updateAlert(alertId: string, isActive?: boolean, threshold?: number, notifications?: Array<{type: string, destination: string}>): Promise<Alert> {
    const query = `
      mutation updateAlert($alertId: String!, $isActive: Boolean, $threshold: Float, $notifications: [NotificationInput!]) {
        alertUpdate(id: $alertId, isActive: $isActive, threshold: $threshold, notifications: $notifications) {
          id
          name
          isActive
          threshold
          notifications {
            type
            destination
          }
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ alertUpdate: Alert }>(query, {
      alertId, isActive, threshold, notifications
    });

    return response.alertUpdate;
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    const query = `
      mutation deleteAlert($alertId: String!) {
        alertDelete(id: $alertId)
      }
    `;

    const response = await this.client.request<{ alertDelete: boolean }>(query, { alertId });
    return response.alertDelete;
  }

  async getTraces(projectId: string, serviceId?: string, startTime?: string, endTime?: string, operationName?: string): Promise<TraceSpan[]> {
    const query = `
      query getTraces($projectId: String!, $serviceId: String, $startTime: String, $endTime: String, $operationName: String) {
        project(id: $projectId) {
          traces(serviceId: $serviceId, startTime: $startTime, endTime: $endTime, operationName: $operationName) {
            edges {
              node {
                id
                traceId
                parentId
                operationName
                serviceName
                startTime
                endTime
                duration
                tags
                logs {
                  timestamp
                  message
                  level
                }
                status
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { traces: { edges: Array<{ node: TraceSpan }> } };
    }>(query, { projectId, serviceId, startTime, endTime, operationName });

    return response.project.traces.edges.map(edge => edge.node);
  }

  async getTraceById(traceId: string): Promise<TraceSpan[]> {
    const query = `
      query getTraceById($traceId: String!) {
        trace(id: $traceId) {
          spans {
            id
            traceId
            parentId
            operationName
            serviceName
            startTime
            endTime
            duration
            tags
            logs {
              timestamp
              message
              level
            }
            status
          }
        }
      }
    `;

    const response = await this.client.request<{
      trace: { spans: TraceSpan[] };
    }>(query, { traceId });

    return response.trace.spans;
  }
}