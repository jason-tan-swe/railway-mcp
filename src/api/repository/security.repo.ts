import { BaseApiClient } from '../base-client.js';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  metadata?: Record<string, any>;
}

export interface VulnerabilityReport {
  id: string;
  projectId: string;
  serviceId?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'DEPENDENCY' | 'CONTAINER' | 'CONFIGURATION' | 'CODE';
  title: string;
  description: string;
  cve?: string;
  affectedComponent: string;
  recommendation: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'FIXED' | 'IGNORED';
  discoveredAt: string;
  fixedAt?: string;
}

export interface SecurityPolicy {
  id: string;
  projectId: string;
  name: string;
  type: 'ACCESS_CONTROL' | 'NETWORK' | 'DATA_PROTECTION' | 'COMPLIANCE';
  rules: Array<{
    id: string;
    condition: string;
    action: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
    priority: number;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccessToken {
  id: string;
  name: string;
  permissions: string[];
  lastUsed?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
}

export interface IPAllowList {
  id: string;
  projectId: string;
  name: string;
  ipRanges: string[];
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id: string;
  projectId: string;
  framework: 'SOC2' | 'GDPR' | 'HIPAA' | 'PCI_DSS' | 'ISO27001';
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PARTIAL' | 'PENDING';
  score: number;
  findings: Array<{
    control: string;
    status: 'PASS' | 'FAIL' | 'WARNING';
    description: string;
    recommendation?: string;
  }>;
  generatedAt: string;
  expiresAt?: string;
}

export class SecurityRepository {
  constructor(private client: BaseApiClient) {}

  async getAuditLogs(projectId?: string, startDate?: string, endDate?: string, limit: number = 100): Promise<SecurityAuditLog[]> {
    const query = `
      query getAuditLogs($projectId: String, $startDate: String, $endDate: String, $limit: Int) {
        auditLogs(projectId: $projectId, startDate: $startDate, endDate: $endDate, first: $limit) {
          edges {
            node {
              id
              timestamp
              userId
              userEmail
              action
              resourceType
              resourceId
              ipAddress
              userAgent
              success
              metadata
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      auditLogs: { edges: Array<{ node: SecurityAuditLog }> };
    }>(query, { projectId, startDate, endDate, limit });

    return response.auditLogs.edges.map(edge => edge.node);
  }

  async getVulnerabilities(projectId: string): Promise<VulnerabilityReport[]> {
    const query = `
      query getVulnerabilities($projectId: String!) {
        project(id: $projectId) {
          vulnerabilities {
            edges {
              node {
                id
                projectId
                serviceId
                severity
                category
                title
                description
                cve
                affectedComponent
                recommendation
                status
                discoveredAt
                fixedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { vulnerabilities: { edges: Array<{ node: VulnerabilityReport }> } };
    }>(query, { projectId });

    return response.project.vulnerabilities.edges.map(edge => edge.node);
  }

  async triggerSecurityScan(projectId: string, serviceId?: string): Promise<{ scanId: string; status: string }> {
    const query = `
      mutation triggerSecurityScan($projectId: String!, $serviceId: String) {
        securityScanTrigger(projectId: $projectId, serviceId: $serviceId) {
          scanId
          status
        }
      }
    `;

    const response = await this.client.request<{
      securityScanTrigger: { scanId: string; status: string };
    }>(query, { projectId, serviceId });

    return response.securityScanTrigger;
  }

  async updateVulnerabilityStatus(vulnerabilityId: string, status: string): Promise<VulnerabilityReport> {
    const query = `
      mutation updateVulnerabilityStatus($vulnerabilityId: String!, $status: VulnerabilityStatus!) {
        vulnerabilityUpdate(id: $vulnerabilityId, status: $status) {
          id
          status
          fixedAt
        }
      }
    `;

    const response = await this.client.request<{
      vulnerabilityUpdate: VulnerabilityReport;
    }>(query, { vulnerabilityId, status });

    return response.vulnerabilityUpdate;
  }

  async listSecurityPolicies(projectId: string): Promise<SecurityPolicy[]> {
    const query = `
      query listSecurityPolicies($projectId: String!) {
        project(id: $projectId) {
          securityPolicies {
            edges {
              node {
                id
                projectId
                name
                type
                rules {
                  id
                  condition
                  action
                  priority
                }
                isActive
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { securityPolicies: { edges: Array<{ node: SecurityPolicy }> } };
    }>(query, { projectId });

    return response.project.securityPolicies.edges.map(edge => edge.node);
  }

  async listAccessTokens(): Promise<AccessToken[]> {
    const query = `
      query listAccessTokens {
        accessTokens {
          edges {
            node {
              id
              name
              permissions
              lastUsed
              expiresAt
              isActive
              createdAt
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      accessTokens: { edges: Array<{ node: AccessToken }> };
    }>(query);

    return response.accessTokens.edges.map(edge => edge.node);
  }

  async createAccessToken(name: string, permissions: string[], expiresAt?: string): Promise<{ token: AccessToken; secret: string }> {
    const query = `
      mutation createAccessToken($name: String!, $permissions: [String!]!, $expiresAt: String) {
        accessTokenCreate(name: $name, permissions: $permissions, expiresAt: $expiresAt) {
          token {
            id
            name
            permissions
            expiresAt
            createdAt
          }
          secret
        }
      }
    `;

    const response = await this.client.request<{
      accessTokenCreate: { token: AccessToken; secret: string };
    }>(query, { name, permissions, expiresAt });

    return response.accessTokenCreate;
  }

  async revokeAccessToken(tokenId: string): Promise<boolean> {
    const query = `
      mutation revokeAccessToken($tokenId: String!) {
        accessTokenRevoke(id: $tokenId)
      }
    `;

    const response = await this.client.request<{
      accessTokenRevoke: boolean;
    }>(query, { tokenId });

    return response.accessTokenRevoke;
  }

  async listIPAllowLists(projectId: string): Promise<IPAllowList[]> {
    const query = `
      query listIPAllowLists($projectId: String!) {
        project(id: $projectId) {
          ipAllowLists {
            edges {
              node {
                id
                projectId
                name
                ipRanges
                description
                isActive
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { ipAllowLists: { edges: Array<{ node: IPAllowList }> } };
    }>(query, { projectId });

    return response.project.ipAllowLists.edges.map(edge => edge.node);
  }

  async createIPAllowList(projectId: string, name: string, ipRanges: string[], description?: string): Promise<IPAllowList> {
    const query = `
      mutation createIPAllowList($projectId: String!, $name: String!, $ipRanges: [String!]!, $description: String) {
        ipAllowListCreate(projectId: $projectId, name: $name, ipRanges: $ipRanges, description: $description) {
          id
          projectId
          name
          ipRanges
          description
          isActive
          createdAt
        }
      }
    `;

    const response = await this.client.request<{
      ipAllowListCreate: IPAllowList;
    }>(query, { projectId, name, ipRanges, description });

    return response.ipAllowListCreate;
  }

  async updateIPAllowList(allowListId: string, ipRanges?: string[], isActive?: boolean): Promise<IPAllowList> {
    const query = `
      mutation updateIPAllowList($allowListId: String!, $ipRanges: [String!], $isActive: Boolean) {
        ipAllowListUpdate(id: $allowListId, ipRanges: $ipRanges, isActive: $isActive) {
          id
          name
          ipRanges
          isActive
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{
      ipAllowListUpdate: IPAllowList;
    }>(query, { allowListId, ipRanges, isActive });

    return response.ipAllowListUpdate;
  }

  async generateComplianceReport(projectId: string, framework: string): Promise<ComplianceReport> {
    const query = `
      mutation generateComplianceReport($projectId: String!, $framework: ComplianceFramework!) {
        complianceReportGenerate(projectId: $projectId, framework: $framework) {
          id
          projectId
          framework
          status
          score
          findings {
            control
            status
            description
            recommendation
          }
          generatedAt
          expiresAt
        }
      }
    `;

    const response = await this.client.request<{
      complianceReportGenerate: ComplianceReport;
    }>(query, { projectId, framework });

    return response.complianceReportGenerate;
  }

  async getComplianceReports(projectId: string): Promise<ComplianceReport[]> {
    const query = `
      query getComplianceReports($projectId: String!) {
        project(id: $projectId) {
          complianceReports {
            edges {
              node {
                id
                projectId
                framework
                status
                score
                findings {
                  control
                  status
                  description
                  recommendation
                }
                generatedAt
                expiresAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { complianceReports: { edges: Array<{ node: ComplianceReport }> } };
    }>(query, { projectId });

    return response.project.complianceReports.edges.map(edge => edge.node);
  }
}