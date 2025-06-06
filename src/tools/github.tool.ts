import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { gitHubService } from "../services/github.service.js";

export const gitHubTools = [
  createTool(
    "github-repo-check",
    formatToolDescription({
      type: 'QUERY',
      description: "Check if you have access to a GitHub repository",
      bestFor: [
        "Verifying repository access before deployment",
        "Checking if a repository exists",
        "Determining if authentication is needed"
      ],
      relations: {
        nextSteps: ["github-repo-deploy", "github-repo-link"],
        related: ["github-repo-list"]
      }
    }),
    {
      fullRepoName: z.string().describe("Full repository name (owner/repo)")
    },
    async ({ fullRepoName }) => {
      return gitHubService.checkRepoAccess(fullRepoName);
    }
  ),

  createTool(
    "github-repo-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all GitHub repositories you have access to",
      bestFor: [
        "Discovering available repositories",
        "Finding repos to deploy",
        "Viewing private and public repos"
      ],
      relations: {
        nextSteps: ["github-repo-deploy", "github-branch-list"],
        related: ["github-repo-check"]
      }
    }),
    {},
    async () => {
      return gitHubService.listRepos();
    }
  ),

  createTool(
    "github-repo-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get details about a specific GitHub repository",
      bestFor: [
        "Getting repository information",
        "Finding default branch",
        "Checking repository privacy"
      ],
      relations: {
        prerequisites: ["github-repo-check"],
        nextSteps: ["github-branch-list", "github-repo-deploy"]
      }
    }),
    {
      fullRepoName: z.string().describe("Full repository name (owner/repo)")
    },
    async ({ fullRepoName }) => {
      return gitHubService.getRepo(fullRepoName);
    }
  ),

  createTool(
    "github-branch-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all branches for a GitHub repository",
      bestFor: [
        "Finding available branches to deploy",
        "Checking branch names",
        "Selecting deployment branch"
      ],
      relations: {
        prerequisites: ["github-repo-check"],
        nextSteps: ["github-repo-deploy", "service-create-from-repo"]
      }
    }),
    {
      fullRepoName: z.string().describe("Full repository name (owner/repo)")
    },
    async ({ fullRepoName }) => {
      return gitHubService.listBranches(fullRepoName);
    }
  ),

  createTool(
    "github-repo-deploy",
    formatToolDescription({
      type: 'WORKFLOW',
      description: "Deploy a GitHub repository to a Railway project",
      bestFor: [
        "Creating new services from GitHub repos",
        "Deploying specific branches",
        "Setting up continuous deployment"
      ],
      notFor: [
        "Updating existing services (use github-repo-link)",
        "Docker image deployments (use service-create-from-image)"
      ],
      relations: {
        prerequisites: ["project_list", "github-repo-check"],
        nextSteps: ["deployment_list", "service_list"],
        alternatives: ["service-create-from-repo"]
      }
    }),
    {
      projectId: z.string().describe("ID of the Railway project"),
      fullRepoName: z.string().describe("Full repository name (owner/repo)"),
      branch: z.string().optional().describe("Branch to deploy (uses default branch if not specified)"),
      environmentId: z.string().optional().describe("Environment to deploy to")
    },
    async ({ projectId, fullRepoName, branch, environmentId }) => {
      return gitHubService.deployRepo(projectId, fullRepoName, branch, environmentId);
    }
  ),

  createTool(
    "github-repo-link",
    formatToolDescription({
      type: 'API',
      description: "Connect an existing service to a GitHub repository",
      bestFor: [
        "Setting up continuous deployment for existing services",
        "Changing repository for a service",
        "Updating deployment source"
      ],
      notFor: [
        "Creating new services (use github-repo-deploy)",
        "Deploying without a service (use github-repo-deploy)"
      ],
      relations: {
        prerequisites: ["service_list", "github-repo-check"],
        nextSteps: ["deployment_trigger", "service_info"]
      }
    }),
    {
      serviceId: z.string().describe("ID of the service to connect"),
      fullRepoName: z.string().describe("Full repository name (owner/repo)"),
      branch: z.string().optional().describe("Branch to use (uses default branch if not specified)")
    },
    async ({ serviceId, fullRepoName, branch }) => {
      return gitHubService.connectServiceToRepo(serviceId, fullRepoName, branch);
    }
  )
];