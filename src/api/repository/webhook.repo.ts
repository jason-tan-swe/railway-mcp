import { BaseApiClient } from '../base-client.js';

export interface Webhook {
  id: string;
  url: string;
  projectId: string;
  events: WebhookEvent[];
  isActive: boolean;
  lastDeliveryStatus?: 'SUCCESS' | 'FAILED';
  lastDeliveryAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WebhookEvent {
  type: WebhookEventType;
  enabled: boolean;
}

export type WebhookEventType = 
  | 'DEPLOYMENT_STARTED'
  | 'DEPLOYMENT_COMPLETED'
  | 'DEPLOYMENT_FAILED'
  | 'DEPLOYMENT_CRASHED'
  | 'SERVICE_CREATED'
  | 'SERVICE_DELETED'
  | 'SERVICE_UPDATED'
  | 'ENVIRONMENT_CREATED'
  | 'ENVIRONMENT_DELETED'
  | 'VARIABLE_CREATED'
  | 'VARIABLE_UPDATED'
  | 'VARIABLE_DELETED'
  | 'DOMAIN_CREATED'
  | 'DOMAIN_DELETED'
  | 'VOLUME_CREATED'
  | 'VOLUME_DELETED';

export interface WebhookCreateInput {
  url: string;
  projectId: string;
  events: WebhookEventType[];
}

export interface WebhookUpdateInput {
  url?: string;
  events?: WebhookEventType[];
  isActive?: boolean;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  responseCode?: number;
  responseTime?: number;
  event: {
    type: WebhookEventType;
    payload: any;
  };
  deliveredAt?: string;
  createdAt: string;
}

export class WebhookRepository {
  constructor(private client: BaseApiClient) {}

  async list(projectId?: string): Promise<Webhook[]> {
    const query = projectId ? `
      query listProjectWebhooks($projectId: String!) {
        project(id: $projectId) {
          webhooks {
            edges {
              node {
                id
                url
                projectId
                events {
                  type
                  enabled
                }
                isActive
                lastDeliveryStatus
                lastDeliveryAt
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    ` : `
      query listWebhooks {
        webhooks {
          edges {
            node {
              id
              url
              projectId
              events {
                type
                enabled
              }
              isActive
              lastDeliveryStatus
              lastDeliveryAt
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project?: { webhooks: { edges: Array<{ node: Webhook }> } };
      webhooks?: { edges: Array<{ node: Webhook }> };
    }>(query, projectId ? { projectId } : undefined);

    const webhooksData = projectId ? response.project?.webhooks : response.webhooks;
    return webhooksData?.edges.map(edge => edge.node) || [];
  }

  async get(webhookId: string): Promise<Webhook> {
    const query = `
      query getWebhook($webhookId: String!) {
        webhook(id: $webhookId) {
          id
          url
          projectId
          events {
            type
            enabled
          }
          isActive
          lastDeliveryStatus
          lastDeliveryAt
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ webhook: Webhook }>(query, { webhookId });
    return response.webhook;
  }

  async create(input: WebhookCreateInput): Promise<Webhook> {
    const query = `
      mutation webhookCreate($input: WebhookCreateInput!) {
        webhookCreate(input: $input) {
          id
          url
          projectId
          events {
            type
            enabled
          }
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ webhookCreate: Webhook }>(query, { input });
    return response.webhookCreate;
  }

  async update(webhookId: string, input: WebhookUpdateInput): Promise<Webhook> {
    const query = `
      mutation webhookUpdate($webhookId: String!, $input: WebhookUpdateInput!) {
        webhookUpdate(id: $webhookId, input: $input) {
          id
          url
          projectId
          events {
            type
            enabled
          }
          isActive
          lastDeliveryStatus
          lastDeliveryAt
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ webhookUpdate: Webhook }>(query, { webhookId, input });
    return response.webhookUpdate;
  }

  async delete(webhookId: string): Promise<boolean> {
    const query = `
      mutation webhookDelete($webhookId: String!) {
        webhookDelete(id: $webhookId)
      }
    `;

    const response = await this.client.request<{ webhookDelete: boolean }>(query, { webhookId });
    return response.webhookDelete;
  }

  async test(webhookId: string): Promise<WebhookDelivery> {
    const query = `
      mutation webhookTest($webhookId: String!) {
        webhookTest(id: $webhookId) {
          id
          webhookId
          status
          responseCode
          responseTime
          event {
            type
            payload
          }
          deliveredAt
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ webhookTest: WebhookDelivery }>(query, { webhookId });
    return response.webhookTest;
  }

  async getDeliveries(webhookId: string, limit: number = 50): Promise<WebhookDelivery[]> {
    const query = `
      query getWebhookDeliveries($webhookId: String!, $limit: Int) {
        webhookDeliveries(webhookId: $webhookId, first: $limit) {
          edges {
            node {
              id
              webhookId
              status
              responseCode
              responseTime
              event {
                type
                payload
              }
              deliveredAt
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      webhookDeliveries: { edges: Array<{ node: WebhookDelivery }> };
    }>(query, { webhookId, limit });

    return response.webhookDeliveries.edges.map(edge => edge.node);
  }
}