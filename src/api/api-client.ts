import { BaseApiClient } from './base-client.js';
import { DeploymentRepository } from './repository/deployment.repo.js';
import { ProjectRepository } from './repository/project.repo.js';
import { ServiceRepository } from './repository/service.repo.js';
import { VariableRepository } from './repository/variable.repo.js';

export class RailwayApiClient extends BaseApiClient {
  public readonly deployments: DeploymentRepository;
  public readonly projects: ProjectRepository;
  public readonly services: ServiceRepository;
  public readonly variables: VariableRepository;
  private initialized: boolean = false;

  public constructor() {
    super();
    this.deployments = new DeploymentRepository(this);
    this.projects = new ProjectRepository(this);
    this.services = new ServiceRepository(this);
    this.variables = new VariableRepository(this);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Initialize with environment token if available
    const envToken = process.env.RAILWAY_API_TOKEN;
    if (envToken) {
      console.error('Initializing with environment token:', envToken);
      try {
        this.token = envToken;
        await this.validateToken();
        console.error('Successfully initialized with environment token');
      } catch (error) {
        console.error('Failed to initialize with environment token:', error instanceof Error ? error.message : 'Unknown error');
        this.token = null;
      }
    } else {
      console.error('No environment token found');
    }

    this.initialized = true;
  }

  async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return super.request(query, variables);
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    if (token) {
      await this.validateToken();
    }
  }

  getToken(): string | null {
    return super.getToken();
  }

  private async validateToken(): Promise<void> {
    const query = `
      query {
        projects {
          edges {
            node {
              id
            }
          }
        }
      }
    `;
    
    try {
      await super.request(query);
    } catch (error) {
      throw new Error('Invalid API token. Please check your token and try again.');
    }
  }
}

// Initialize and export the singleton instance
export const railwayClient = new RailwayApiClient(); 