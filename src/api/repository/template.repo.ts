import { RailwayApiClient } from '../api-client.js';

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

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  serializedConfig: {
    services: Record<string, ServiceConfig>;
  };
  projects: number;
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
              projects
            }
          }
        }
      }
    `;

    const response = await this.client.request<TemplatesResponse>(query);
    return response.templates.edges.map(edge => edge.node);
  }

  async deployTemplate(environmentId: string, projectId: string, serializedConfig: { services: Record<string, ServiceConfig> }, templateId: string, teamId?: string) {
    const query = `
      mutation deployTemplate($environmentId: String, $projectId: String, $templateId: String!, $teamId: String, $serializedConfig: SerializedTemplateConfig!) {
        templateDeployV2(input: {
          environmentId: $environmentId,
          projectId: $projectId,
          templateId: $templateId,
          teamId: $teamId,
          serializedConfig: $serializedConfig
        }) {
          projectId
          workflowId
        }
      }
    `;

    const response = await this.client.request<{ templateDeployV2: { projectId: string, workflowId: string } }>(query, {
      environmentId,
      projectId,
      templateId,
      teamId,
      serializedConfig,
    });

    return response.templateDeployV2;
  }

  async getWorkflowStatus(workflowId: string) {
    const query = `
      query workflowStatus($workflowId:String!){
        workflowStatus(workflowId:$workflowId) {
          status
          error
        }
      }
    `;

    const response = await this.client.request<{ workflowStatus: { status: string, error: string | null } }>(query, { workflowId });
    return response.workflowStatus;
  }
} 