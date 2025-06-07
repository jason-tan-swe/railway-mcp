import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { logsService } from "../services/logs.service.js";

// Define metric measurement and tag enums based on the types
const MetricMeasurementEnum = z.enum([
  'CPU_USAGE',
  'MEMORY_USAGE',
  'NETWORK_RX',
  'NETWORK_TX',
  'DISK_USAGE',
  'HTTP_REQUEST_COUNT',
  'HTTP_REQUEST_DURATION'
]);

const MetricTagEnum = z.enum([
  'PROJECT_ID',
  'ENVIRONMENT_ID',
  'SERVICE_ID',
  'DEPLOYMENT_ID',
  'PLUGIN_ID',
  'VOLUME_ID'
]);

export const logsTools = [
  createTool(
    "logs-build",
    formatToolDescription({
      type: 'QUERY',
      description: "Get build logs for a deployment",
      bestFor: [
        "Debugging build failures",
        "Viewing build output and errors",
        "Monitoring build progress"
      ],
      relations: {
        prerequisites: ["deployment_list", "deployment_trigger"],
        related: ["logs-deployment", "deployment_status"]
      }
    }),
    {
      deploymentId: z.string().describe("ID of the deployment"),
      filter: z.string().optional().describe("Filter logs by content"),
      limit: z.number().optional().default(100).describe("Maximum number of log entries to return (default: 100)"),
      startDate: z.string().optional().describe("Start date for log range (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for log range (ISO 8601 format)")
    },
    async ({ deploymentId, filter, limit, startDate, endDate }) => {
      return logsService.getBuildLogs(deploymentId, { filter, limit, startDate, endDate });
    }
  ),

  createTool(
    "logs-deployment",
    formatToolDescription({
      type: 'QUERY',
      description: "Get runtime logs for a deployment",
      bestFor: [
        "Debugging application errors",
        "Monitoring application behavior",
        "Viewing console output"
      ],
      relations: {
        prerequisites: ["deployment_list"],
        related: ["logs-build", "logs-environment"]
      }
    }),
    {
      deploymentId: z.string().describe("ID of the deployment"),
      filter: z.string().optional().describe("Filter logs by content"),
      limit: z.number().optional().default(100).describe("Maximum number of log entries to return (default: 100)"),
      startDate: z.string().optional().describe("Start date for log range (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for log range (ISO 8601 format)")
    },
    async ({ deploymentId, filter, limit, startDate, endDate }) => {
      return logsService.getDeploymentLogs(deploymentId, { filter, limit, startDate, endDate });
    }
  ),

  createTool(
    "logs-environment",
    formatToolDescription({
      type: 'QUERY',
      description: "Get all logs for an environment (excludes build logs)",
      bestFor: [
        "Monitoring all services in an environment",
        "Cross-service debugging",
        "Environment-wide log analysis"
      ],
      relations: {
        prerequisites: ["environment-list", "environment-info"],
        related: ["logs-deployment", "metrics-get"]
      }
    }),
    {
      environmentId: z.string().describe("ID of the environment"),
      filter: z.string().optional().describe("Filter logs by content"),
      limit: z.number().optional().default(100).describe("Maximum number of log entries to return (default: 100)"),
      startDate: z.string().optional().describe("Start date for log range (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for log range (ISO 8601 format)")
    },
    async ({ environmentId, filter, limit, startDate, endDate }) => {
      return logsService.getEnvironmentLogs(environmentId, { filter, limit, startDate, endDate });
    }
  ),

  createTool(
    "logs-http",
    formatToolDescription({
      type: 'QUERY',
      description: "Get HTTP request logs for a deployment",
      bestFor: [
        "Analyzing HTTP traffic patterns",
        "Debugging request/response issues",
        "Performance monitoring",
        "Tracking API usage"
      ],
      relations: {
        prerequisites: ["deployment_list"],
        related: ["metrics-get", "logs-deployment"]
      }
    }),
    {
      deploymentId: z.string().describe("ID of the deployment"),
      filter: z.string().optional().describe("Filter logs by content (e.g., path, status code)"),
      limit: z.number().optional().default(100).describe("Maximum number of log entries to return (default: 100)"),
      startDate: z.string().optional().describe("Start date for log range (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for log range (ISO 8601 format)")
    },
    async ({ deploymentId, filter, limit, startDate, endDate }) => {
      return logsService.getHttpLogs(deploymentId, { filter, limit, startDate, endDate });
    }
  ),

  createTool(
    "metrics-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get resource usage metrics for services",
      bestFor: [
        "Monitoring CPU and memory usage",
        "Tracking network traffic",
        "Analyzing performance trends",
        "Capacity planning"
      ],
      relations: {
        prerequisites: ["service_list", "deployment_list"],
        related: ["logs-http", "logs-environment"]
      }
    }),
    {
      startDate: z.string().describe("Start date for metrics (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for metrics (ISO 8601 format, defaults to now)"),
      measurements: z.array(MetricMeasurementEnum).describe("Types of metrics to retrieve"),
      groupBy: z.array(MetricTagEnum).describe("How to group the metrics"),
      projectId: z.string().optional().describe("Filter by project ID"),
      environmentId: z.string().optional().describe("Filter by environment ID"),
      serviceId: z.string().optional().describe("Filter by service ID"),
      deploymentId: z.string().optional().describe("Filter by deployment ID"),
      sampleRateSeconds: z.number().optional().describe("Sample rate in seconds (e.g., 60 for 1-minute intervals)")
    },
    async ({ startDate, endDate, measurements, groupBy, projectId, environmentId, serviceId, deploymentId, sampleRateSeconds }) => {
      return logsService.getMetrics({
        startDate,
        endDate,
        measurements,
        groupBy,
        projectId,
        environmentId,
        serviceId,
        deploymentId,
        sampleRateSeconds
      });
    }
  ),

  createTool(
    "logs-plugin",
    formatToolDescription({
      type: 'QUERY',
      description: "Get logs for a database plugin",
      bestFor: [
        "Debugging database issues",
        "Monitoring database performance",
        "Viewing database error logs"
      ],
      relations: {
        prerequisites: ["database_deploy"],
        related: ["logs-environment", "metrics-get"]
      }
    }),
    {
      pluginId: z.string().describe("ID of the plugin (database)"),
      environmentId: z.string().describe("ID of the environment"),
      filter: z.string().optional().describe("Filter logs by content"),
      limit: z.number().optional().default(100).describe("Maximum number of log entries to return (default: 100)"),
      startDate: z.string().optional().describe("Start date for log range (ISO 8601 format)"),
      endDate: z.string().optional().describe("End date for log range (ISO 8601 format)")
    },
    async ({ pluginId, environmentId, filter, limit, startDate, endDate }) => {
      return logsService.getPluginLogs(pluginId, environmentId, { filter, limit, startDate, endDate });
    }
  )
];