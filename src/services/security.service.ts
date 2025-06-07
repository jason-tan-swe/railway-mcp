import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class SecurityService extends BaseService {
  constructor() {
    super();
  }

  async getAuditLogs(projectId?: string, startDate?: string, endDate?: string, limit: number = 100) {
    try {
      const logs = await this.client.security.getAuditLogs(projectId, startDate, endDate, limit);
      
      const successCount = logs.filter(log => log.success).length;
      const failureCount = logs.length - successCount;
      
      const actionTypes = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topActions = Object.entries(actionTypes)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

      return createSuccessResponse({
        text: `Found ${logs.length} audit log entries (${successCount} successful, ${failureCount} failed)`,
        data: {
          summary: {
            totalLogs: logs.length,
            successCount,
            failureCount,
            dateRange: {
              from: startDate || 'N/A',
              to: endDate || 'N/A'
            }
          },
          topActions: topActions.map(([action, count]) => ({ action, count })),
          logs: logs.map(log => ({
            id: log.id,
            timestamp: log.timestamp,
            user: log.userEmail,
            action: log.action,
            resource: `${log.resourceType}:${log.resourceId}`,
            success: log.success,
            ipAddress: log.ipAddress,
            userAgent: log.userAgent?.substring(0, 50) + '...' || 'N/A'
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get audit logs: ${formatError(error)}`);
    }
  }

  async getVulnerabilities(projectId: string) {
    try {
      const vulnerabilities = await this.client.security.getVulnerabilities(projectId);
      
      const criticalCount = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
      const highCount = vulnerabilities.filter(v => v.severity === 'HIGH').length;
      const mediumCount = vulnerabilities.filter(v => v.severity === 'MEDIUM').length;
      const lowCount = vulnerabilities.filter(v => v.severity === 'LOW').length;

      const openCount = vulnerabilities.filter(v => v.status === 'OPEN').length;

      const byCategory = vulnerabilities.reduce((acc, vuln) => {
        if (!acc[vuln.category]) acc[vuln.category] = [];
        acc[vuln.category].push(vuln);
        return acc;
      }, {} as Record<string, typeof vulnerabilities>);

      return createSuccessResponse({
        text: `Found ${vulnerabilities.length} vulnerabilities (${openCount} open, ${criticalCount} critical)`,
        data: {
          projectId,
          summary: {
            totalCount: vulnerabilities.length,
            openCount,
            bySeverity: {
              critical: criticalCount,
              high: highCount,
              medium: mediumCount,
              low: lowCount
            }
          },
          byCategory: Object.entries(byCategory).map(([category, categoryVulns]) => ({
            category,
            count: categoryVulns.length,
            openCount: categoryVulns.filter(v => v.status === 'OPEN').length
          })),
          vulnerabilities: vulnerabilities.map(vuln => ({
            id: vuln.id,
            severity: vuln.severity,
            category: vuln.category,
            title: vuln.title,
            cve: vuln.cve || 'N/A',
            status: vuln.status,
            affectedComponent: vuln.affectedComponent,
            discoveredAt: vuln.discoveredAt,
            serviceId: vuln.serviceId
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get vulnerabilities: ${formatError(error)}`);
    }
  }

  async triggerSecurityScan(projectId: string, serviceId?: string) {
    try {
      const scan = await this.client.security.triggerSecurityScan(projectId, serviceId);

      return createSuccessResponse({
        text: `Security scan initiated`,
        data: {
          scanId: scan.scanId,
          status: scan.status,
          projectId,
          serviceId: serviceId || 'All services',
          message: 'Scan will complete in 5-15 minutes. Use security-vulnerabilities to check results.'
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to trigger security scan: ${formatError(error)}`);
    }
  }

  async listAccessTokens() {
    try {
      const tokens = await this.client.security.listAccessTokens();
      
      const activeCount = tokens.filter(t => t.isActive).length;
      const expiredCount = tokens.filter(t => 
        t.expiresAt && new Date(t.expiresAt) < new Date()
      ).length;

      return createSuccessResponse({
        text: `Found ${tokens.length} access tokens (${activeCount} active, ${expiredCount} expired)`,
        data: {
          summary: {
            totalCount: tokens.length,
            activeCount,
            expiredCount
          },
          tokens: tokens.map(token => ({
            id: token.id,
            name: token.name,
            permissions: token.permissions,
            isActive: token.isActive,
            lastUsed: token.lastUsed || 'Never',
            expiresAt: token.expiresAt || 'Never',
            createdAt: token.createdAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list access tokens: ${formatError(error)}`);
    }
  }

  async createAccessToken(name: string, permissions: string[], expiresAt?: string) {
    try {
      const result = await this.client.security.createAccessToken(name, permissions, expiresAt);

      return createSuccessResponse({
        text: `Access token "${name}" created successfully`,
        data: {
          token: {
            id: result.token.id,
            name: result.token.name,
            permissions: result.token.permissions,
            expiresAt: result.token.expiresAt || 'Never',
            createdAt: result.token.createdAt
          },
          secret: result.secret,
          warning: 'Store this secret securely - it will not be shown again!'
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create access token: ${formatError(error)}`);
    }
  }

  async revokeAccessToken(tokenId: string) {
    try {
      const success = await this.client.security.revokeAccessToken(tokenId);
      
      if (success) {
        return createSuccessResponse({
          text: "Access token revoked successfully"
        });
      } else {
        return createErrorResponse("Failed to revoke access token");
      }
    } catch (error) {
      return createErrorResponse(`Failed to revoke access token: ${formatError(error)}`);
    }
  }

  async listIPAllowLists(projectId: string) {
    try {
      const allowLists = await this.client.security.listIPAllowLists(projectId);
      
      const activeCount = allowLists.filter(list => list.isActive).length;
      const totalIPs = allowLists.reduce((sum, list) => sum + list.ipRanges.length, 0);

      return createSuccessResponse({
        text: `Found ${allowLists.length} IP allow lists (${activeCount} active, ${totalIPs} total IPs)`,
        data: {
          projectId,
          summary: {
            totalLists: allowLists.length,
            activeCount,
            totalIPs
          },
          allowLists: allowLists.map(list => ({
            id: list.id,
            name: list.name,
            description: list.description || 'No description',
            ipCount: list.ipRanges.length,
            isActive: list.isActive,
            ipRanges: list.ipRanges,
            createdAt: list.createdAt,
            updatedAt: list.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list IP allow lists: ${formatError(error)}`);
    }
  }

  async createIPAllowList(projectId: string, name: string, ipRanges: string[], description?: string) {
    try {
      const allowList = await this.client.security.createIPAllowList(projectId, name, ipRanges, description);

      return createSuccessResponse({
        text: `IP allow list "${name}" created with ${ipRanges.length} IP ranges`,
        data: {
          id: allowList.id,
          name: allowList.name,
          description: allowList.description,
          ipRanges: allowList.ipRanges,
          isActive: allowList.isActive,
          createdAt: allowList.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create IP allow list: ${formatError(error)}`);
    }
  }

  async generateComplianceReport(projectId: string, framework: string) {
    try {
      const report = await this.client.security.generateComplianceReport(projectId, framework);
      
      const passCount = report.findings.filter(f => f.status === 'PASS').length;
      const failCount = report.findings.filter(f => f.status === 'FAIL').length;
      const warningCount = report.findings.filter(f => f.status === 'WARNING').length;

      return createSuccessResponse({
        text: `${framework} compliance report generated - Score: ${report.score}% (${passCount} pass, ${failCount} fail, ${warningCount} warnings)`,
        data: {
          id: report.id,
          projectId: report.projectId,
          framework: report.framework,
          status: report.status,
          score: `${report.score}%`,
          summary: {
            totalControls: report.findings.length,
            passCount,
            failCount,
            warningCount
          },
          findings: report.findings.map(finding => ({
            control: finding.control,
            status: finding.status,
            description: finding.description,
            recommendation: finding.recommendation || 'No specific recommendation'
          })),
          generatedAt: report.generatedAt,
          expiresAt: report.expiresAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to generate compliance report: ${formatError(error)}`);
    }
  }
}

export const securityService = new SecurityService();