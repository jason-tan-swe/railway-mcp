import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { monitoringService } from "../services/monitoring.service.js";

export const monitoringTools = [
  createTool(
    "monitoring-metrics-query",
    formatToolDescription({
      type: 'QUERY',
      description: "Query custom metrics and performance data",
      bestFor: [
        "Analyzing application performance",
        "Monitoring custom business metrics",
        "Creating performance dashboards"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["monitoring-alert-create", "monitoring-apm-data"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for all services)"),
      metricName: z.string().optional().describe("Specific metric name to query"),
      startTime: z.string().optional().describe("Start time (ISO format, default: 24h ago)"),
      endTime: z.string().optional().describe("End time (ISO format, default: now)"),
      step: z.string().optional().describe("Query resolution (e.g., '5m', '1h', default: '5m')"),
      labels: z.record(z.string()).optional().describe("Label filters for metrics")
    },
    async ({ projectId, serviceId, metricName, startTime, endTime, step, labels }) => {
      return monitoringService.queryMetrics(projectId, serviceId, metricName, startTime, endTime, step, labels);
    }
  ),

  createTool(
    "monitoring-metric-create",
    formatToolDescription({
      type: 'API',
      description: "Create custom metric data point",
      bestFor: [
        "Recording business metrics",
        "Custom application telemetry",
        "Performance tracking"
      ],
      relations: {
        prerequisites: ["project_list", "service_list"],
        nextSteps: ["monitoring-metrics-query"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().describe("ID of the service"),
      name: z.string().describe("Metric name (e.g., 'user_signups', 'api_response_time')"),
      type: z.enum(['COUNTER', 'GAUGE', 'HISTOGRAM', 'SUMMARY']).describe("Type of metric"),
      value: z.number().describe("Metric value to record"),
      labels: z.record(z.string()).optional().describe("Labels for the metric"),
      unit: z.string().optional().describe("Unit of measurement (default: 'count')")
    },
    async ({ projectId, serviceId, name, type, value, labels, unit }) => {
      return monitoringService.createCustomMetric(projectId, serviceId, name, type, value, labels, unit);
    }
  ),

  createTool(
    "monitoring-apm-data",
    formatToolDescription({
      type: 'QUERY',
      description: "Get Application Performance Monitoring data",
      bestFor: [
        "Performance analysis and optimization",
        "Understanding service bottlenecks",
        "Monitoring system health"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["monitoring-traces", "monitoring-alert-create"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for all services)"),
      startTime: z.string().optional().describe("Start time (ISO format, default: 24h ago)"),
      endTime: z.string().optional().describe("End time (ISO format, default: now)")
    },
    async ({ projectId, serviceId, startTime, endTime }) => {
      return monitoringService.getAPMData(projectId, serviceId, startTime, endTime);
    }
  ),

  createTool(
    "monitoring-alerts",
    formatToolDescription({
      type: 'QUERY',
      description: "List monitoring alerts and their status",
      bestFor: [
        "Managing alert configurations",
        "Monitoring system health",
        "Understanding notification setup"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["monitoring-alert-create", "monitoring-alert-update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for all services)")
    },
    async ({ projectId, serviceId }) => {
      return monitoringService.listAlerts(projectId, serviceId);
    }
  ),

  createTool(
    "monitoring-alert-create",
    formatToolDescription({
      type: 'API',
      description: "Create monitoring alert with notifications",
      bestFor: [
        "Setting up automated monitoring",
        "Ensuring rapid incident response",
        "Proactive system monitoring"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["monitoring-alerts", "monitoring-alert-update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for project-wide alert)"),
      name: z.string().describe("Alert name"),
      description: z.string().describe("Alert description"),
      condition: z.string().describe("Alert condition (e.g., 'cpu_usage > 80', 'error_rate > 5')"),
      threshold: z.number().describe("Threshold value for the condition"),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).describe("Alert severity level"),
      notifications: z.array(z.object({
        type: z.enum(['EMAIL', 'WEBHOOK', 'SLACK', 'PAGERDUTY']),
        destination: z.string()
      })).describe("Notification channels")
    },
    async ({ projectId, serviceId, name, description, condition, threshold, severity, notifications }) => {
      return monitoringService.createAlert(projectId, name, description, condition, threshold, severity, notifications, serviceId);
    }
  ),

  createTool(
    "monitoring-alert-update",
    formatToolDescription({
      type: 'API',
      description: "Update monitoring alert configuration",
      bestFor: [
        "Adjusting alert thresholds",
        "Enabling/disabling alerts",
        "Updating notification channels"
      ],
      relations: {
        prerequisites: ["monitoring-alerts"],
        nextSteps: ["monitoring-alerts"]
      }
    }),
    {
      alertId: z.string().describe("ID of the alert to update"),
      isActive: z.boolean().optional().describe("Enable or disable the alert"),
      threshold: z.number().optional().describe("New threshold value"),
      notifications: z.array(z.object({
        type: z.enum(['EMAIL', 'WEBHOOK', 'SLACK', 'PAGERDUTY']),
        destination: z.string()
      })).optional().describe("Updated notification channels")
    },
    async ({ alertId, isActive, threshold, notifications }) => {
      return monitoringService.updateAlert(alertId, isActive, threshold, notifications);
    }
  ),

  createTool(
    "monitoring-alert-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete monitoring alert",
      bestFor: [
        "Removing obsolete alerts",
        "Cleaning up monitoring configuration"
      ],
      notFor: [
        "Critical production alerts"
      ],
      relations: {
        prerequisites: ["monitoring-alerts"],
        nextSteps: ["monitoring-alerts"]
      }
    }),
    {
      alertId: z.string().describe("ID of the alert to delete")
    },
    async ({ alertId }) => {
      return monitoringService.deleteAlert(alertId);
    }
  ),

  createTool(
    "monitoring-traces",
    formatToolDescription({
      type: 'QUERY',
      description: "Get distributed tracing data for debugging",
      bestFor: [
        "Debugging performance issues",
        "Understanding request flow",
        "Identifying bottlenecks"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["monitoring-trace-details"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for all services)"),
      startTime: z.string().optional().describe("Start time (ISO format, default: 24h ago)"),
      endTime: z.string().optional().describe("End time (ISO format, default: now)"),
      operationName: z.string().optional().describe("Specific operation to filter by")
    },
    async ({ projectId, serviceId, startTime, endTime, operationName }) => {
      return monitoringService.getTraces(projectId, serviceId, startTime, endTime, operationName);
    }
  ),

  createTool(
    "monitoring-trace-details",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed trace information with all spans",
      bestFor: [
        "Deep debugging of specific requests",
        "Understanding service interactions",
        "Performance bottleneck analysis"
      ],
      relations: {
        prerequisites: ["monitoring-traces"],
        nextSteps: ["monitoring-apm-data"]
      }
    }),
    {
      traceId: z.string().describe("ID of the trace to analyze")
    },
    async ({ traceId }) => {
      return monitoringService.getTraceDetails(traceId);
    }
  )
];