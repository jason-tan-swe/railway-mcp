import { RailwayApiClient } from '../api-client.js';
import { GraphQLResponse } from '@/types.js';

interface Template {
  id: string;
  name: string;
  description: string;
  source: {
    repo?: string;
    image?: string;
  };
  variables?: Record<string, string>;
  category: string;
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
              source {
                repo
                image
              }
              variables
              category
            }
          }
        }
      }
    `;

    const response = await this.client.request<GraphQLResponse<TemplatesResponse>>(query);
    if (!response.data) {
      throw new Error('Failed to fetch templates');
    }

    return response.data.templates.edges.map(edge => edge.node);
  }
} 