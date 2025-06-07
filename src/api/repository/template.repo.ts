import { RailwayApiClient } from "../api-client.js";

export interface Template {
  id: string;
  name: string;
  description?: string;
  code: string;
  category?: string;
  tags?: string[];
  languages?: string[];
  image?: string;
  readme?: string;
  status?: string;
  isApproved?: boolean;
  isV2Template?: boolean;
  activeProjects?: number;
  createdAt?: string;
  userId?: string;
  teamId?: string;
}

export interface TemplateService {
  id: string;
  name: string;
  config?: any;
}

export interface TemplateDeployInput {
  templateCode?: string;
  templateId?: string;
  projectId?: string;
  environmentId?: string;
  projectName?: string;
  services?: Record<string, any>;
}

export interface TemplateDeployResult {
  projectId: string;
  workflowId?: string;
}

export class TemplateRepository {
  constructor(private client: RailwayApiClient) {}

  async list(): Promise<Template[]> {
    const query = `
      query templates {
        templates {
          edges {
            node {
              id
              name
              description
              code
              category
              tags
              languages
              image
              status
              isApproved
              isV2Template
              activeProjects
              createdAt
            }
          }
        }
      }
    `;

    const data = await this.client.request<{
      templates: { edges: { node: Template }[] };
    }>(query);

    return data.templates.edges.map(edge => edge.node);
  }

  async get(code: string): Promise<Template> {
    const query = `
      query template($code: String!) {
        template(code: $code) {
          id
          name
          description
          code
          category
          tags
          languages
          image
          readme
          status
          isApproved
          isV2Template
          activeProjects
          createdAt
          services {
            id
            name
          }
        }
      }
    `;

    const data = await this.client.request<{ template: Template & { services?: TemplateService[] } }>(
      query,
      { code }
    );

    return data.template;
  }

  async getUserTemplates(): Promise<Template[]> {
    const query = `
      query userTemplates {
        userTemplates {
          id
          name
          description
          code
          category
          tags
          status
          createdAt
        }
      }
    `;

    const data = await this.client.request<{ userTemplates: Template[] }>(query);
    return data.userTemplates || [];
  }

  async deploy(input: TemplateDeployInput): Promise<TemplateDeployResult> {
    const query = `
      mutation templateDeploy($input: TemplateDeployInput!) {
        templateDeploy(input: $input) {
          projectId
          workflowId
        }
      }
    `;

    const data = await this.client.request<{ templateDeploy: TemplateDeployResult }>(
      query,
      { input }
    );

    return data.templateDeploy;
  }

  async generate(projectId: string): Promise<string> {
    const query = `
      mutation templateGenerate($input: TemplateGenerateInput!) {
        templateGenerate(input: $input)
      }
    `;

    const data = await this.client.request<{ templateGenerate: string }>(
      query,
      { input: { projectId } }
    );

    return data.templateGenerate;
  }

  async searchByCategory(category: string): Promise<Template[]> {
    const allTemplates = await this.list();
    return allTemplates.filter(t => t.category === category);
  }

  async searchByTags(tags: string[]): Promise<Template[]> {
    const allTemplates = await this.list();
    return allTemplates.filter(t => 
      t.tags && tags.some(tag => t.tags!.includes(tag))
    );
  }
}