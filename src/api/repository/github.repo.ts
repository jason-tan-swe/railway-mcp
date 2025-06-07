import { RailwayApiClient } from "../api-client.js";

export interface GitHubRepo {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  isPrivate: boolean;
  installationId?: string;
}

export interface GitHubBranch {
  name: string;
}

export interface GitHubRepoAccess {
  hasAccess: boolean;
  isPublic: boolean;
}

export interface GitHubRepoDeployInput {
  projectId: string;
  repo: string;
  branch?: string;
  environmentId?: string;
}

export interface ServiceConnectInput {
  repo: string;
  branch?: string;
}

export class GitHubRepository {
  constructor(private client: RailwayApiClient) {}

  async checkRepoAccess(fullRepoName: string): Promise<GitHubRepoAccess> {
    const query = `
      query gitHubRepoAccessAvailable($fullRepoName: String!) {
        gitHubRepoAccessAvailable(fullRepoName: $fullRepoName) {
          hasAccess
          isPublic
        }
      }
    `;

    const data = await this.client.request<{ gitHubRepoAccessAvailable: GitHubRepoAccess }>(
      query,
      { fullRepoName }
    );

    return data.gitHubRepoAccessAvailable;
  }

  async listRepos(): Promise<GitHubRepo[]> {
    const query = `
      query githubRepos {
        githubRepos {
          id
          name
          fullName
          defaultBranch
          isPrivate
          installationId
        }
      }
    `;

    const data = await this.client.request<{ githubRepos: GitHubRepo[] }>(query);
    return data.githubRepos || [];
  }

  async getRepo(fullRepoName: string): Promise<GitHubRepo> {
    const query = `
      query githubRepo($fullRepoName: String!) {
        githubRepo(fullRepoName: $fullRepoName) {
          id
          name
          fullName
          defaultBranch
          isPrivate
        }
      }
    `;

    const data = await this.client.request<{ githubRepo: GitHubRepo }>(
      query,
      { fullRepoName }
    );

    return data.githubRepo;
  }

  async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const query = `
      query githubRepoBranches($owner: String!, $repo: String!) {
        githubRepoBranches(owner: $owner, repo: $repo) {
          name
        }
      }
    `;

    const data = await this.client.request<{ githubRepoBranches: GitHubBranch[] }>(
      query,
      { owner, repo }
    );

    return data.githubRepoBranches || [];
  }

  async deployRepo(input: GitHubRepoDeployInput): Promise<string> {
    const query = `
      mutation githubRepoDeploy($input: GitHubRepoDeployInput!) {
        githubRepoDeploy(input: $input)
      }
    `;

    const data = await this.client.request<{ githubRepoDeploy: string }>(
      query,
      { input }
    );

    return data.githubRepoDeploy;
  }

  async connectServiceToRepo(serviceId: string, input: ServiceConnectInput): Promise<boolean> {
    const query = `
      mutation serviceConnect($id: String!, $input: ServiceConnectInput!) {
        serviceConnect(id: $id, input: $input) {
          id
          name
        }
      }
    `;

    const data = await this.client.request<{ serviceConnect: { id: string; name: string } }>(
      query,
      { id: serviceId, input }
    );

    return !!data.serviceConnect.id;
  }

  async checkRepoNameAvailability(fullRepoName: string): Promise<boolean> {
    const query = `
      query githubIsRepoNameAvailable($fullRepoName: String!) {
        githubIsRepoNameAvailable(fullRepoName: $fullRepoName)
      }
    `;

    const data = await this.client.request<{ githubIsRepoNameAvailable: boolean }>(
      query,
      { fullRepoName }
    );

    return data.githubIsRepoNameAvailable;
  }
}