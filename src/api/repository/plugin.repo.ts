import { RailwayApiClient } from "../api-client.js";

export interface Plugin {
  id: string;
  name: string;
  friendlyName?: string;
  status?: string;
  logsEnabled?: boolean;
  migrationDatabaseServiceId?: string;
  createdAt?: string;
  deletedAt?: string;
  deprecatedAt?: string;
  environmentId?: string;
  projectId?: string;
}

export interface PluginCreateInput {
  projectId: string;
  name: string;
  environmentId?: string;
  friendlyName?: string;
}

export interface PluginUpdateInput {
  friendlyName?: string;
  logsEnabled?: boolean;
}

export interface PluginRestartInput {
  environmentId: string;
}

export class PluginRepository {
  constructor(private client: RailwayApiClient) {}

  async create(input: PluginCreateInput): Promise<Plugin> {
    const query = `
      mutation pluginCreate($input: PluginCreateInput!) {
        pluginCreate(input: $input) {
          id
          name
          friendlyName
          status
          logsEnabled
          createdAt
        }
      }
    `;

    const data = await this.client.request<{ pluginCreate: Plugin }>(
      query,
      { input }
    );

    return data.pluginCreate;
  }

  async get(id: string): Promise<Plugin> {
    const query = `
      query plugin($id: String!) {
        plugin(id: $id) {
          id
          name
          friendlyName
          status
          logsEnabled
          migrationDatabaseServiceId
          createdAt
          deletedAt
          deprecatedAt
        }
      }
    `;

    const data = await this.client.request<{ plugin: Plugin }>(
      query,
      { id }
    );

    return data.plugin;
  }

  async update(id: string, input: PluginUpdateInput): Promise<Plugin> {
    const query = `
      mutation pluginUpdate($id: String!, $input: PluginUpdateInput!) {
        pluginUpdate(id: $id, input: $input) {
          id
          name
          friendlyName
          status
          logsEnabled
        }
      }
    `;

    const data = await this.client.request<{ pluginUpdate: Plugin }>(
      query,
      { id, input }
    );

    return data.pluginUpdate;
  }

  async delete(id: string, environmentId?: string): Promise<boolean> {
    const query = `
      mutation pluginDelete($id: String!, $environmentId: String) {
        pluginDelete(id: $id, environmentId: $environmentId)
      }
    `;

    const data = await this.client.request<{ pluginDelete: boolean }>(
      query,
      { id, environmentId }
    );

    return data.pluginDelete;
  }

  async restart(id: string, environmentId: string): Promise<Plugin> {
    const query = `
      mutation pluginRestart($id: String!, $input: PluginRestartInput!) {
        pluginRestart(id: $id, input: $input) {
          id
          name
          friendlyName
          status
        }
      }
    `;

    const data = await this.client.request<{ pluginRestart: Plugin }>(
      query,
      { id, input: { environmentId } }
    );

    return data.pluginRestart;
  }

  async start(id: string, environmentId: string): Promise<boolean> {
    const query = `
      mutation pluginStart($id: String!, $input: PluginRestartInput!) {
        pluginStart(id: $id, input: $input)
      }
    `;

    const data = await this.client.request<{ pluginStart: boolean }>(
      query,
      { id, input: { environmentId } }
    );

    return data.pluginStart;
  }

  async resetCredentials(id: string): Promise<boolean> {
    const query = `
      mutation pluginResetCredentials($id: String!, $input: ResetPluginCredentialsInput!) {
        pluginResetCredentials(id: $id, input: $input)
      }
    `;

    const data = await this.client.request<{ pluginResetCredentials: boolean }>(
      query,
      { id, input: {} }
    );

    return data.pluginResetCredentials;
  }
}