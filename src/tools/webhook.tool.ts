import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { webhookService } from "../services/webhook.service.js";

const WebhookEventSchema = z.enum([
  'DEPLOYMENT_STARTED',
  'DEPLOYMENT_COMPLETED',
  'DEPLOYMENT_FAILED', 
  'DEPLOYMENT_CRASHED',
  'SERVICE_CREATED',
  'SERVICE_DELETED',
  'SERVICE_UPDATED',
  'ENVIRONMENT_CREATED',
  'ENVIRONMENT_DELETED',
  'VARIABLE_CREATED',
  'VARIABLE_UPDATED',
  'VARIABLE_DELETED',
  'DOMAIN_CREATED',
  'DOMAIN_DELETED',
  'VOLUME_CREATED',
  'VOLUME_DELETED'
]);

export const webhookTools = [
  createTool(
    "webhook-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all webhooks or webhooks for a specific project",
      bestFor: [
        "Viewing webhook configurations",
        "Monitoring webhook status",
        "Webhook management overview"
      ],
      relations: {
        nextSteps: ["webhook-get", "webhook-create", "webhook-deliveries"]
      }
    }),
    {
      projectId: z.string().optional().describe("Filter by project ID")
    },
    async ({ projectId }) => {
      return webhookService.list(projectId);
    }
  ),

  createTool(
    "webhook-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a webhook",
      bestFor: [
        "Viewing webhook configuration",
        "Checking delivery status",
        "Debugging webhook issues"
      ],
      relations: {
        prerequisites: ["webhook-list"],
        nextSteps: ["webhook-update", "webhook-test", "webhook-deliveries"]
      }
    }),
    {
      webhookId: z.string().describe("ID of the webhook")
    },
    async ({ webhookId }) => {
      return webhookService.get(webhookId);
    }
  ),

  createTool(
    "webhook-create",
    formatToolDescription({
      type: 'API',
      description: "Create a new webhook for a project",
      bestFor: [
        "Setting up event notifications",
        "Integrating with external systems",
        "Automating workflows"
      ],
      relations: {
        prerequisites: ["project_list", "webhook-events"],
        nextSteps: ["webhook-test", "webhook-get"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      url: z.string().url().describe("Webhook endpoint URL"),
      events: z.array(WebhookEventSchema).describe("List of events to subscribe to")
    },
    async ({ projectId, url, events }) => {
      return webhookService.create(projectId, url, events);
    }
  ),

  createTool(
    "webhook-update",
    formatToolDescription({
      type: 'API',
      description: "Update webhook configuration",
      bestFor: [
        "Changing webhook URL",
        "Updating event subscriptions",
        "Enabling/disabling webhooks"
      ],
      relations: {
        prerequisites: ["webhook-get"],
        nextSteps: ["webhook-get", "webhook-test"]
      }
    }),
    {
      webhookId: z.string().describe("ID of the webhook"),
      url: z.string().url().optional().describe("New webhook URL"),
      events: z.array(WebhookEventSchema).optional().describe("New list of events"),
      isActive: z.boolean().optional().describe("Enable or disable the webhook")
    },
    async ({ webhookId, url, events, isActive }) => {
      return webhookService.update(webhookId, url, events, isActive);
    }
  ),

  createTool(
    "webhook-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a webhook",
      bestFor: [
        "Removing unused webhooks",
        "Cleaning up integrations"
      ],
      relations: {
        prerequisites: ["webhook-get"],
        alternatives: ["webhook-update (set isActive: false)"]
      }
    }),
    {
      webhookId: z.string().describe("ID of the webhook to delete")
    },
    async ({ webhookId }) => {
      return webhookService.delete(webhookId);
    }
  ),

  createTool(
    "webhook-test",
    formatToolDescription({
      type: 'API',
      description: "Send a test event to a webhook",
      bestFor: [
        "Testing webhook configuration",
        "Verifying endpoint connectivity",
        "Debugging webhook issues"
      ],
      relations: {
        prerequisites: ["webhook-get"],
        nextSteps: ["webhook-deliveries", "webhook-get"]
      }
    }),
    {
      webhookId: z.string().describe("ID of the webhook to test")
    },
    async ({ webhookId }) => {
      return webhookService.test(webhookId);
    }
  ),

  createTool(
    "webhook-deliveries",
    formatToolDescription({
      type: 'QUERY',
      description: "Get webhook delivery history and status",
      bestFor: [
        "Monitoring webhook reliability",
        "Debugging delivery issues",
        "Checking delivery status"
      ],
      relations: {
        prerequisites: ["webhook-get"],
        nextSteps: ["webhook-test", "webhook-update"]
      }
    }),
    {
      webhookId: z.string().describe("ID of the webhook"),
      limit: z.number().min(1).max(100).default(50).describe("Number of deliveries to retrieve")
    },
    async ({ webhookId, limit }) => {
      return webhookService.getDeliveries(webhookId, limit);
    }
  ),

  createTool(
    "webhook-events",
    formatToolDescription({
      type: 'QUERY',
      description: "List all supported webhook event types",
      bestFor: [
        "Discovering available events",
        "Planning webhook subscriptions",
        "Understanding event categories"
      ],
      relations: {
        nextSteps: ["webhook-create", "webhook-update"]
      }
    }),
    {},
    async () => {
      return webhookService.getSupportedEvents();
    }
  )
];