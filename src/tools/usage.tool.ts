import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { usageService } from "../services/usage.service.js";

export const usageTools = [
  createTool(
    "usage-team",
    formatToolDescription({
      type: 'QUERY',
      description: "Get team usage metrics and costs",
      bestFor: [
        "Monitoring team resource consumption",
        "Tracking monthly costs",
        "Understanding resource utilization"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["usage-project", "billing-info", "usage-alerts"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      startDate: z.string().optional().describe("Start date for usage period (ISO format)"),
      endDate: z.string().optional().describe("End date for usage period (ISO format)")
    },
    async ({ teamId, startDate, endDate }) => {
      return usageService.getTeamUsage(teamId, startDate, endDate);
    }
  ),

  createTool(
    "usage-project",
    formatToolDescription({
      type: 'QUERY',
      description: "Get project-specific usage metrics and costs",
      bestFor: [
        "Analyzing individual project costs",
        "Optimizing project resources",
        "Project cost allocation"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["usage-compare", "service_list"],
        alternatives: ["usage-team"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      startDate: z.string().optional().describe("Start date for usage period (ISO format)"),
      endDate: z.string().optional().describe("End date for usage period (ISO format)")
    },
    async ({ projectId, startDate, endDate }) => {
      return usageService.getProjectUsage(projectId, startDate, endDate);
    }
  ),

  createTool(
    "billing-info",
    formatToolDescription({
      type: 'QUERY',
      description: "Get billing information and plan details",
      bestFor: [
        "Checking current plan and limits",
        "Viewing payment information",
        "Understanding billing cycle"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["usage-team", "usage-alerts"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return usageService.getBillingInfo(teamId);
    }
  ),

  createTool(
    "usage-alerts",
    formatToolDescription({
      type: 'QUERY',
      description: "Get usage alerts and thresholds",
      bestFor: [
        "Monitoring usage limits",
        "Checking alert configurations",
        "Preventing overage charges"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["usage-team", "billing-info"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return usageService.getUsageAlerts(teamId);
    }
  ),

  createTool(
    "usage-compare",
    formatToolDescription({
      type: 'QUERY',
      description: "Compare usage across team and projects",
      bestFor: [
        "Identifying cost drivers",
        "Comparing project efficiency",
        "Resource optimization planning"
      ],
      relations: {
        prerequisites: ["usage-team", "project_list"],
        nextSteps: ["usage-project", "service_list"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team"),
      projectIds: z.array(z.string()).optional().describe("List of project IDs to compare")
    },
    async ({ teamId, projectIds }) => {
      return usageService.compareUsage(teamId, projectIds);
    }
  )
];