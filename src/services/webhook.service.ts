import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";
import { WebhookEventType } from "../api/repository/webhook.repo.js";

export class WebhookService extends BaseService {
  constructor() {
    super();
  }

  async list(projectId?: string) {
    try {
      const webhooks = await this.client.webhooks.list(projectId);

      const activeCount = webhooks.filter(w => w.isActive).length;
      const inactiveCount = webhooks.length - activeCount;

      return createSuccessResponse({
        text: projectId 
          ? `Found ${webhooks.length} webhooks for project (${activeCount} active, ${inactiveCount} inactive)`
          : `Found ${webhooks.length} total webhooks (${activeCount} active, ${inactiveCount} inactive)`,
        data: {
          totalCount: webhooks.length,
          activeCount,
          inactiveCount,
          webhooks: webhooks.map(webhook => ({
            id: webhook.id,
            url: webhook.url,
            projectId: webhook.projectId,
            isActive: webhook.isActive,
            eventCount: webhook.events.filter(e => e.enabled).length,
            lastDeliveryStatus: webhook.lastDeliveryStatus,
            lastDeliveryAt: webhook.lastDeliveryAt,
            createdAt: webhook.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list webhooks: ${formatError(error)}`);
    }
  }

  async get(webhookId: string) {
    try {
      const webhook = await this.client.webhooks.get(webhookId);
      const deliveries = await this.client.webhooks.getDeliveries(webhookId, 10);

      const enabledEvents = webhook.events.filter(e => e.enabled);
      const recentDeliveries = deliveries.slice(0, 5);

      return createSuccessResponse({
        text: `Webhook "${webhook.url}" with ${enabledEvents.length} enabled events`,
        data: {
          id: webhook.id,
          url: webhook.url,
          projectId: webhook.projectId,
          isActive: webhook.isActive,
          events: {
            enabled: enabledEvents.map(e => e.type),
            disabled: webhook.events.filter(e => !e.enabled).map(e => e.type),
            total: webhook.events.length
          },
          delivery: {
            lastStatus: webhook.lastDeliveryStatus,
            lastDeliveryAt: webhook.lastDeliveryAt,
            recentCount: recentDeliveries.length,
            recentDeliveries: recentDeliveries.map(d => ({
              id: d.id,
              status: d.status,
              eventType: d.event.type,
              responseCode: d.responseCode,
              deliveredAt: d.deliveredAt
            }))
          },
          createdAt: webhook.createdAt,
          updatedAt: webhook.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get webhook: ${formatError(error)}`);
    }
  }

  async create(projectId: string, url: string, events: WebhookEventType[]) {
    try {
      const webhook = await this.client.webhooks.create({
        projectId,
        url,
        events
      });

      return createSuccessResponse({
        text: `Webhook created for ${events.length} events`,
        data: {
          id: webhook.id,
          url: webhook.url,
          projectId: webhook.projectId,
          isActive: webhook.isActive,
          events: events,
          createdAt: webhook.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create webhook: ${formatError(error)}`);
    }
  }

  async update(webhookId: string, url?: string, events?: WebhookEventType[], isActive?: boolean) {
    try {
      const webhook = await this.client.webhooks.update(webhookId, {
        url,
        events,
        isActive
      });

      const enabledEvents = webhook.events.filter(e => e.enabled);

      return createSuccessResponse({
        text: `Webhook updated successfully`,
        data: {
          id: webhook.id,
          url: webhook.url,
          isActive: webhook.isActive,
          enabledEvents: enabledEvents.length,
          updatedAt: webhook.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update webhook: ${formatError(error)}`);
    }
  }

  async delete(webhookId: string) {
    try {
      const success = await this.client.webhooks.delete(webhookId);
      
      if (success) {
        return createSuccessResponse({
          text: "Webhook deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete webhook");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete webhook: ${formatError(error)}`);
    }
  }

  async test(webhookId: string) {
    try {
      const delivery = await this.client.webhooks.test(webhookId);

      return createSuccessResponse({
        text: `Test webhook delivered with status: ${delivery.status}`,
        data: {
          id: delivery.id,
          status: delivery.status,
          responseCode: delivery.responseCode,
          responseTime: delivery.responseTime,
          eventType: delivery.event.type,
          deliveredAt: delivery.deliveredAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to test webhook: ${formatError(error)}`);
    }
  }

  async getDeliveries(webhookId: string, limit: number = 50) {
    try {
      const deliveries = await this.client.webhooks.getDeliveries(webhookId, limit);

      const successCount = deliveries.filter(d => d.status === 'SUCCESS').length;
      const failedCount = deliveries.filter(d => d.status === 'FAILED').length;
      const pendingCount = deliveries.filter(d => d.status === 'PENDING').length;

      return createSuccessResponse({
        text: `${deliveries.length} webhook deliveries (${successCount} success, ${failedCount} failed, ${pendingCount} pending)`,
        data: {
          totalCount: deliveries.length,
          successCount,
          failedCount,
          pendingCount,
          deliveries: deliveries.map(delivery => ({
            id: delivery.id,
            status: delivery.status,
            eventType: delivery.event.type,
            responseCode: delivery.responseCode,
            responseTime: delivery.responseTime,
            deliveredAt: delivery.deliveredAt,
            createdAt: delivery.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get webhook deliveries: ${formatError(error)}`);
    }
  }

  async getSupportedEvents() {
    try {
      const eventTypes: WebhookEventType[] = [
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
      ];

      const eventsByCategory = {
        deployment: eventTypes.filter(e => e.startsWith('DEPLOYMENT_')),
        service: eventTypes.filter(e => e.startsWith('SERVICE_')),
        environment: eventTypes.filter(e => e.startsWith('ENVIRONMENT_')),
        variable: eventTypes.filter(e => e.startsWith('VARIABLE_')),
        domain: eventTypes.filter(e => e.startsWith('DOMAIN_')),
        volume: eventTypes.filter(e => e.startsWith('VOLUME_'))
      };

      return createSuccessResponse({
        text: `${eventTypes.length} webhook event types supported`,
        data: {
          totalCount: eventTypes.length,
          byCategory: eventsByCategory,
          allEvents: eventTypes
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get supported events: ${formatError(error)}`);
    }
  }
}

export const webhookService = new WebhookService();