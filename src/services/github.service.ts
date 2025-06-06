import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class GitHubService extends BaseService {
  constructor() {
    super();
  }

  async checkRepoAccess(fullRepoName: string) {
    try {
      const access = await this.client.github.checkRepoAccess(fullRepoName);
      
      const message = access.hasAccess 
        ? `You have access to ${fullRepoName}` 
        : access.isPublic 
          ? `${fullRepoName} is a public repository` 
          : `You don't have access to ${fullRepoName}`;

      return createSuccessResponse({
        text: message,
        data: {
          repository: fullRepoName,
          hasAccess: access.hasAccess,
          isPublic: access.isPublic,
          needsAuth: !access.hasAccess && !access.isPublic
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to check repository access: ${formatError(error)}`);
    }
  }

  async listRepos() {
    try {
      const repos = await this.client.github.listRepos();
      
      const groupedRepos = {
        private: repos.filter(r => r.isPrivate),
        public: repos.filter(r => !r.isPrivate)
      };

      return createSuccessResponse({
        text: `Found ${repos.length} accessible repositories`,
        data: {
          totalCount: repos.length,
          privateCount: groupedRepos.private.length,
          publicCount: groupedRepos.public.length,
          repositories: repos.map(repo => ({
            name: repo.name,
            fullName: repo.fullName,
            defaultBranch: repo.defaultBranch,
            isPrivate: repo.isPrivate
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list GitHub repositories: ${formatError(error)}`);
    }
  }

  async getRepo(fullRepoName: string) {
    try {
      const repo = await this.client.github.getRepo(fullRepoName);
      
      return createSuccessResponse({
        text: `Retrieved repository ${repo.fullName}`,
        data: {
          id: repo.id,
          name: repo.name,
          fullName: repo.fullName,
          defaultBranch: repo.defaultBranch,
          isPrivate: repo.isPrivate
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get repository: ${formatError(error)}`);
    }
  }

  async listBranches(fullRepoName: string) {
    try {
      const [owner, repo] = fullRepoName.split('/');
      if (!owner || !repo) {
        return createErrorResponse("Invalid repository name format. Use 'owner/repo'");
      }

      const branches = await this.client.github.listBranches(owner, repo);
      
      return createSuccessResponse({
        text: `Found ${branches.length} branches in ${fullRepoName}`,
        data: {
          repository: fullRepoName,
          branchCount: branches.length,
          branches: branches.map(b => b.name)
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list branches: ${formatError(error)}`);
    }
  }

  async deployRepo(projectId: string, fullRepoName: string, branch?: string, environmentId?: string) {
    try {
      const result = await this.client.github.deployRepo({
        projectId,
        repo: fullRepoName,
        branch,
        environmentId
      });

      return createSuccessResponse({
        text: `GitHub repository ${fullRepoName} deployed successfully`,
        data: {
          repository: fullRepoName,
          branch: branch || 'default',
          projectId,
          environmentId,
          deploymentId: result
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to deploy repository: ${formatError(error)}`);
    }
  }

  async connectServiceToRepo(serviceId: string, fullRepoName: string, branch?: string) {
    try {
      const success = await this.client.github.connectServiceToRepo(serviceId, {
        repo: fullRepoName,
        branch
      });

      if (success) {
        return createSuccessResponse({
          text: `Service connected to ${fullRepoName}`,
          data: {
            serviceId,
            repository: fullRepoName,
            branch: branch || 'default'
          }
        });
      } else {
        return createErrorResponse("Failed to connect service to repository");
      }
    } catch (error) {
      return createErrorResponse(`Failed to connect service to repository: ${formatError(error)}`);
    }
  }
}

export const gitHubService = new GitHubService();