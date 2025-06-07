import { RailwayApiClient } from "../api-client.js";
import { Environment } from "../../types.js";

export class EnvironmentRepository {
  constructor(private client: RailwayApiClient) {}

  async create(projectId: string, name: string, isEphemeral: boolean = false) {
    const query = `
      mutation environmentCreate($input: EnvironmentCreateInput!) {
        environmentCreate(input: $input) {
          id
          name
          projectId
          createdAt
          updatedAt
          isEphemeral
          unmergedChangesCount
        }
      }
    `;

    const variables = {
      input: {
        projectId,
        name,
        isEphemeral
      }
    };

    const data = await this.client.request<{ environmentCreate: Environment }>(
      query,
      variables
    );

    return data.environmentCreate;
  }

  async delete(environmentId: string) {
    const query = `
      mutation environmentDelete($id: String!) {
        environmentDelete(id: $id)
      }
    `;

    const variables = {
      id: environmentId
    };

    const data = await this.client.request<{ environmentDelete: boolean }>(
      query,
      variables
    );

    return data.environmentDelete;
  }

  async rename(environmentId: string, name: string) {
    const query = `
      mutation environmentRename($id: String!, $input: EnvironmentRenameInput!) {
        environmentRename(id: $id, input: $input) {
          id
          name
          projectId
          createdAt
          updatedAt
          isEphemeral
          unmergedChangesCount
        }
      }
    `;

    const variables = {
      id: environmentId,
      input: {
        name
      }
    };

    const data = await this.client.request<{ environmentRename: Environment }>(
      query,
      variables
    );

    return data.environmentRename;
  }

  async get(environmentId: string) {
    const query = `
      query environment($id: String!) {
        environment(id: $id) {
          id
          name
          projectId
          createdAt
          updatedAt
          isEphemeral
          unmergedChangesCount
        }
      }
    `;

    const variables = {
      id: environmentId
    };

    const data = await this.client.request<{ environment: Environment }>(
      query,
      variables
    );

    return data.environment;
  }

  async list(projectId: string, isEphemeral?: boolean) {
    const query = `
      query environments($projectId: String!, $isEphemeral: Boolean) {
        environments(projectId: $projectId, isEphemeral: $isEphemeral) {
          edges {
            node {
              id
              name
              projectId
              createdAt
              updatedAt
              isEphemeral
              unmergedChangesCount
            }
          }
        }
      }
    `;

    const variables: any = {
      projectId
    };

    if (isEphemeral !== undefined) {
      variables.isEphemeral = isEphemeral;
    }

    const data = await this.client.request<{
      environments: { edges: { node: Environment }[] };
    }>(query, variables);

    return data.environments.edges.map(edge => edge.node);
  }

  async cloneWithVariables(sourceEnvironmentId: string, targetEnvironmentId: string) {
    // This is a utility method that copies variables from one environment to another
    // It requires fetching variables from source and creating them in target
    // This will be implemented using the variable repository
    
    // For now, return a placeholder indicating this needs variable repository integration
    return {
      success: true,
      message: "Environment clone with variables requires variable repository integration"
    };
  }

  async triggerDeploy(environmentId: string, serviceId?: string) {
    const query = `
      mutation environmentTriggersDeploy($input: EnvironmentTriggersDeployInput!) {
        environmentTriggersDeploy(input: $input)
      }
    `;

    const variables = {
      input: {
        environmentId,
        serviceId
      }
    };

    const data = await this.client.request<{ environmentTriggersDeploy: boolean }>(
      query,
      variables
    );

    return data.environmentTriggersDeploy;
  }
}