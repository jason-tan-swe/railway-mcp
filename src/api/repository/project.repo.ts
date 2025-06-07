import { RailwayApiClient } from '@/api/api-client.js';
import { Project, ProjectResponse, ProjectsResponse, Environment, Service, Connection } from '@/types.js';

export class ProjectRepository {
  constructor(private client: RailwayApiClient) {}

  async listProjects(): Promise<Project[]> {
    const data = await this.client.request<ProjectsResponse>(`
      query projects {
        projects {
          edges {
            node {
              id
              name
              description
              environments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              services {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              teamId
              baseEnvironmentId
              createdAt
              updatedAt
              deletedAt
              expiredAt
              isPublic
              isTempProject
              prDeploys
              botPrEnvironments
              subscriptionType
              subscriptionPlanLimit
            }
          }
        }
      }
    `);

    return data.projects.edges.map(edge => ({
      ...edge.node,
      environments: edge.node.environments || { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } },
      services: edge.node.services || { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } }
    }));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const data = await this.client.request<ProjectResponse>(`
      query project($projectId: String!) {
        project(id: $projectId) {
          id
          name
          description
          environments {
            edges {
              node {
                id
                name
                projectId
                createdAt
                updatedAt
                deletedAt
                isEphemeral
                unmergedChangesCount
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
          services {
            edges {
              node {
                id
                name
                projectId
                createdAt
                updatedAt
                deletedAt
                icon
                templateServiceId
                templateThreadSlug
                featureFlags
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
          teamId
          baseEnvironmentId
          createdAt
          updatedAt
          deletedAt
          expiredAt
          isPublic
          isTempProject
          prDeploys
          botPrEnvironments
          subscriptionType
          subscriptionPlanLimit
        }
      }
    `, { projectId });

    if (!data.project) {
      return null;
    }

    return data.project;
  }

  async createProject(name: string, teamId?: string): Promise<Project> {
    const data = await this.client.request<{ projectCreate: Project }>(`
      mutation projectCreate($name: String!, $teamId: String) {
        projectCreate(
        input: {
          name: $name,
          teamId: $teamId
        }) {
          id
          name
          description
          environments {
            edges {
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
          services {
            edges {
              node {
                id
                name
              }
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
            }
          }
        }
      }
    `, { name, teamId });

    return {
      ...data.projectCreate,
      environments: data.projectCreate.environments || { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } },
      services: data.projectCreate.services || { edges: [], pageInfo: { hasNextPage: false, hasPreviousPage: false } }
    };
  }

  async deleteProject(projectId: string): Promise<void> {
    await this.client.request<{ projectDelete: boolean }>(`
      mutation projectDelete($projectId: String!) {
        projectDelete(id: $projectId)
      }
    `, { projectId });
  }

  async listEnvironments(projectId: string): Promise<Environment[]> {
    const data = await this.client.request<{ environments: Connection<Environment> }>(`
      query environments($projectId: String!) {
        environments(projectId: $projectId) {
          edges {
            node {
              id
              name
              projectId
              createdAt
              updatedAt
              deletedAt
              isEphemeral
              unmergedChangesCount
            }
          }
        }
      }
    `, { projectId });

    return data.environments.edges.map(edge => edge.node);
  }

  async listServices(projectId: string): Promise<Service[]> {
    const data = await this.client.request<{ services: Connection<Service> }>(`
      query services($projectId: String!) {
        services(projectId: $projectId) {
          edges {
            node {
              id
              name
              projectId
              createdAt
              updatedAt
              deletedAt
              icon
              templateServiceId
              templateThreadSlug
              featureFlags
            }
          }
        }
      }
    `, { projectId });

    return data.services.edges.map(edge => edge.node);
  }
} 