import { RailwayApiClient } from '../api-client.js';
import { GraphQLResponse } from '@/types.js';

interface ServiceConfig {
  icon?: string;
  name: string;
  build?: Record<string, unknown>;
  deploy?: Record<string, unknown>;
  source?: {
    image?: string;
    repo?: string;
  };
  variables?: Record<string, {
    isOptional?: boolean;
    description?: string;
    defaultValue: string;
  }>;
  networking?: {
    tcpProxies?: Record<string, Record<string, unknown>>;
    serviceDomains?: Record<string, Record<string, unknown>>;
  };
  volumeMounts?: Record<string, {
    mountPath: string;
  }>;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serializedConfig: {
    services: Record<string, ServiceConfig>;
  };
}

interface TemplatesResponse {
  templates: {
    edges: Array<{
      node: Template;
    }>;
  };
}

export class TemplateRepository {
  constructor(private client: RailwayApiClient) {}

  async listTemplates(): Promise<Template[]> {
    const query = `
      query {
        templates {
          edges {
            node {
              id
              name
              description
              category
              serializedConfig
            }
          }
        }
      }
    `;

    const response = await this.client.request<TemplatesResponse>(query);
    return response.templates.edges.map(edge => edge.node);
  }
} 