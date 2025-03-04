import { RailwayApiClient } from '@/api/api-client.js';
import { ServiceDomain, ServiceDomainCreateInput, ServiceDomainUpdateInput, DomainAvailabilityResult, DomainsListResult } from '@/types.js';

export class DomainRepository {
  constructor(private client: RailwayApiClient) {}

  async serviceDomainCreate(input: ServiceDomainCreateInput): Promise<ServiceDomain> {
    const query = `
      mutation serviceDomainCreate($input: ServiceDomainCreateInput!) {
        serviceDomainCreate(input: $input) {
          id
          createdAt
          deletedAt
          domain
          environmentId
          projectId
          serviceId
          suffix
          targetPort
          updatedAt
        }
      }
    `;

    const variables = { input };
    const response = await this.client.request<{ serviceDomainCreate: ServiceDomain }>(query, variables);
    return response.serviceDomainCreate;
  }

  async serviceDomainDelete(id: string): Promise<boolean> {
    const query = `
      mutation serviceDomainDelete($id: String!) {
        serviceDomainDelete(id: $id)
      }
    `;

    const variables = { id };
    const response = await this.client.request<{ serviceDomainDelete: boolean }>(query, variables);
    return response.serviceDomainDelete;
  }

  async serviceDomainUpdate(input: ServiceDomainUpdateInput): Promise<boolean> {
    const query = `
      mutation serviceDomainUpdate($input: ServiceDomainUpdateInput!) {
        serviceDomainUpdate(input: $input)
      }
    `;

    const variables = { input };
    const response = await this.client.request<{ serviceDomainUpdate: boolean }>(query, variables);
    return response.serviceDomainUpdate;
  }

  async domains(projectId: string, environmentId: string, serviceId: string): Promise<DomainsListResult> {
    const query = `
      query domains($projectId: String!, $environmentId: String!, $serviceId: String!) {
        domains(
          projectId: $projectId
          environmentId: $environmentId
          serviceId: $serviceId
        ) {
          customDomains {
            id
            createdAt
            deletedAt
            domain
            environmentId
            projectId
            serviceId
            targetPort
            updatedAt
          }
          serviceDomains {
            id
            createdAt
            deletedAt
            domain
            environmentId
            projectId
            serviceId
            suffix
            targetPort
            updatedAt
          }
        }
      }
    `;

    const variables = { projectId, environmentId, serviceId };
    const response = await this.client.request<{ domains: DomainsListResult }>(query, variables);
    return response.domains;
  }

  async serviceDomainAvailable(domain: string): Promise<DomainAvailabilityResult> {
    const query = `
      query serviceDomainAvailable($domain: String!) {
        serviceDomainAvailable(domain: $domain) {
          available
          message
        }
      }
    `;

    const variables = { domain };
    const response = await this.client.request<{ serviceDomainAvailable: DomainAvailabilityResult }>(query, variables);
    return response.serviceDomainAvailable;
  }
} 