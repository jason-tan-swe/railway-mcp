import { RailwayApiClient } from "../api-client.js";
import { Domain } from "../../types.js";

export interface CustomDomain extends Domain {
  status?: 'ACTIVE' | 'PENDING' | 'ERROR';
  cnameTarget?: string;
  sslStatus?: 'ACTIVE' | 'PENDING' | 'ERROR';
}

export interface CustomDomainCreateInput {
  projectId: string;
  domain: string;
  serviceId?: string;
  environmentId?: string;
}

export interface CustomDomainUpdateInput {
  id: string;
  serviceId?: string;
  environmentId?: string;
}

export class CustomDomainRepository {
  constructor(private client: RailwayApiClient) {}

  async create(input: CustomDomainCreateInput): Promise<CustomDomain> {
    const query = `
      mutation customDomainCreate($input: CustomDomainCreateInput!) {
        customDomainCreate(input: $input) {
          id
          domain
          serviceId
          projectId
          status
          cnameTarget
          sslStatus
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.client.request<{ customDomainCreate: CustomDomain }>(
      query,
      { input }
    );

    return data.customDomainCreate;
  }

  async update(input: CustomDomainUpdateInput): Promise<CustomDomain> {
    const query = `
      mutation customDomainUpdate($input: CustomDomainUpdateInput!) {
        customDomainUpdate(input: $input) {
          id
          domain
          serviceId
          projectId
          status
          cnameTarget
          sslStatus
          updatedAt
        }
      }
    `;

    const data = await this.client.request<{ customDomainUpdate: CustomDomain }>(
      query,
      { input }
    );

    return data.customDomainUpdate;
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      mutation customDomainDelete($id: String!) {
        customDomainDelete(id: $id)
      }
    `;

    const data = await this.client.request<{ customDomainDelete: boolean }>(
      query,
      { id }
    );

    return data.customDomainDelete;
  }

  async list(projectId: string): Promise<CustomDomain[]> {
    const query = `
      query customDomains($projectId: String!) {
        customDomains(projectId: $projectId) {
          edges {
            node {
              id
              domain
              serviceId
              projectId
              status
              cnameTarget
              sslStatus
              createdAt
              updatedAt
            }
          }
        }
      }
    `;

    const data = await this.client.request<{
      customDomains: { edges: { node: CustomDomain }[] };
    }>(query, { projectId });

    return data.customDomains.edges.map(edge => edge.node);
  }

  async get(id: string): Promise<CustomDomain> {
    const query = `
      query customDomain($id: String!) {
        customDomain(id: $id) {
          id
          domain
          serviceId
          projectId
          status
          cnameTarget
          sslStatus
          createdAt
          updatedAt
        }
      }
    `;

    const data = await this.client.request<{ customDomain: CustomDomain }>(
      query,
      { id }
    );

    return data.customDomain;
  }
}