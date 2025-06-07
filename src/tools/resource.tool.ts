import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { resourceService } from "../services/resource.service.js";

export const resourceTools = [
  createTool(
    "resource-quotas",
    formatToolDescription({
      type: 'QUERY',
      description: "Get team resource quotas and utilization",
      bestFor: [
        "Monitoring resource allocation",
        "Checking quota utilization",
        "Resource capacity planning"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["resource-allocations", "resource-limits", "usage-team"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return resourceService.getTeamQuotas(teamId);
    }
  ),

  createTool(
    "resource-allocations",
    formatToolDescription({
      type: 'QUERY',
      description: "Get project resource allocations",
      bestFor: [
        "Viewing project resource usage",
        "Managing service allocations",
        "Resource distribution analysis"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["resource-allocation-update", "resource-optimize"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return resourceService.getProjectAllocations(projectId);
    }
  ),

  createTool(
    "resource-allocation-update",
    formatToolDescription({
      type: 'API',
      description: "Update resource allocation amount or priority",
      bestFor: [
        "Scaling resource allocations",
        "Adjusting priority levels",
        "Optimizing resource distribution"
      ],
      relations: {
        prerequisites: ["resource-allocations"],
        nextSteps: ["resource-allocations", "usage-project"]
      }
    }),
    {
      allocationId: z.string().describe("ID of the resource allocation"),
      amount: z.number().positive().describe("New allocation amount"),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional().describe("New priority level")
    },
    async ({ allocationId, amount, priority }) => {
      return resourceService.updateAllocation(allocationId, amount, priority);
    }
  ),

  createTool(
    "resource-limits",
    formatToolDescription({
      type: 'QUERY',
      description: "Get team resource limits and thresholds",
      bestFor: [
        "Checking resource constraints",
        "Managing alert thresholds",
        "Resource governance"
      ],
      relations: {
        prerequisites: ["team-list"],
        nextSteps: ["resource-limits-update", "usage-alerts"]
      }
    }),
    {
      teamId: z.string().describe("ID of the team")
    },
    async ({ teamId }) => {
      return resourceService.getResourceLimits(teamId);
    }
  ),

  createTool(
    "resource-limits-update",
    formatToolDescription({
      type: 'API',
      description: "Update resource limits and alert thresholds",
      bestFor: [
        "Adjusting resource limits",
        "Setting alert thresholds",
        "Resource governance management"
      ],
      relations: {
        prerequisites: ["resource-limits"],
        nextSteps: ["resource-limits", "usage-alerts"]
      }
    }),
    {
      limitId: z.string().describe("ID of the resource limit"),
      hardLimit: z.number().positive().optional().describe("New hard limit value"),
      softLimit: z.number().positive().optional().describe("New soft limit value"),
      alertThreshold: z.number().min(0).max(100).optional().describe("Alert threshold percentage")
    },
    async ({ limitId, hardLimit, softLimit, alertThreshold }) => {
      return resourceService.updateResourceLimit(limitId, hardLimit, softLimit, alertThreshold);
    }
  ),

  createTool(
    "resource-optimize",
    formatToolDescription({
      type: 'QUERY',
      description: "Get resource optimization recommendations",
      bestFor: [
        "Cost optimization planning",
        "Resource efficiency analysis",
        "Performance optimization"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["resource-allocation-update", "service_update", "usage-project"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return resourceService.getOptimizationRecommendations(projectId);
    }
  )
];