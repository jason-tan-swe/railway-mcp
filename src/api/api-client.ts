import { BaseApiClient } from './base-client.js';
import { CustomDomainRepository } from './repository/customDomain.repo.js';
import { DeploymentRepository } from './repository/deployment.repo.js';
import { DomainRepository } from './repository/domain.repo.js';
import { EnvironmentRepository } from './repository/environment.repo.js';
import { GitHubRepository } from './repository/github.repo.js';
import { LogsRepository } from './repository/logs.repo.js';
import { ProjectRepository } from './repository/project.repo.js';
import { ServiceRepository } from './repository/service.repo.js';
import { TcpProxyRepository } from './repository/tcpProxy.repo.js';
import { VariableRepository } from './repository/variable.repo.js';
import { VolumeRepository } from './repository/volume.repo.js';

export class RailwayApiClient extends BaseApiClient {
  public readonly customDomains: CustomDomainRepository;
  public readonly deployments: DeploymentRepository;
  public readonly domains: DomainRepository;
  public readonly environments: EnvironmentRepository;
  public readonly github: GitHubRepository;
  public readonly logs: LogsRepository;
  public readonly projects: ProjectRepository;
  public readonly services: ServiceRepository;
  public readonly tcpProxies: TcpProxyRepository;
  public readonly variables: VariableRepository;
  public readonly volumes: VolumeRepository;
  private initialized: boolean = false;

  public constructor() {
    super();
    this.customDomains = new CustomDomainRepository(this);
    this.deployments = new DeploymentRepository(this);
    this.domains = new DomainRepository(this);
    this.environments = new EnvironmentRepository(this);
    this.github = new GitHubRepository(this);
    this.logs = new LogsRepository(this);
    this.projects = new ProjectRepository(this);
    this.services = new ServiceRepository(this);
    this.tcpProxies = new TcpProxyRepository(this);
    this.variables = new VariableRepository(this);
    this.volumes = new VolumeRepository(this);
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