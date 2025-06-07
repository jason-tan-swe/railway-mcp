import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { securityService } from "../services/security.service.js";

export const securityTools = [
  createTool(
    "security-audit-logs",
    formatToolDescription({
      type: 'QUERY',
      description: "View security audit logs with analysis",
      bestFor: [
        "Security monitoring and compliance",
        "Investigating suspicious activity",
        "Understanding user access patterns"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-vulnerabilities", "security-compliance-report"]
      }
    }),
    {
      projectId: z.string().optional().describe("ID of project (omit for account-wide logs)"),
      startDate: z.string().optional().describe("Start date (ISO format, e.g., '2024-01-01')"),
      endDate: z.string().optional().describe("End date (ISO format, e.g., '2024-01-31')"),
      limit: z.number().min(1).max(1000).optional().describe("Maximum number of logs to return (default: 100)")
    },
    async ({ projectId, startDate, endDate, limit }) => {
      return securityService.getAuditLogs(projectId, startDate, endDate, limit);
    }
  ),

  createTool(
    "security-vulnerabilities",
    formatToolDescription({
      type: 'QUERY',
      description: "Get vulnerability report for a project",
      bestFor: [
        "Security assessment and monitoring",
        "Identifying security risks",
        "Planning security fixes"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-scan-trigger", "security-vulnerability-update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return securityService.getVulnerabilities(projectId);
    }
  ),

  createTool(
    "security-scan-trigger",
    formatToolDescription({
      type: 'API',
      description: "Trigger a security scan for project or service",
      bestFor: [
        "Proactive security assessment",
        "Checking for new vulnerabilities",
        "Post-deployment security verification"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-vulnerabilities"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      serviceId: z.string().optional().describe("ID of specific service (omit for full project scan)")
    },
    async ({ projectId, serviceId }) => {
      return securityService.triggerSecurityScan(projectId, serviceId);
    }
  ),

  createTool(
    "security-access-tokens",
    formatToolDescription({
      type: 'QUERY',
      description: "List all access tokens with usage information",
      bestFor: [
        "Managing API access tokens",
        "Auditing token usage",
        "Security token cleanup"
      ],
      relations: {
        nextSteps: ["security-token-create", "security-token-revoke"]
      }
    }),
    {},
    async () => {
      return securityService.listAccessTokens();
    }
  ),

  createTool(
    "security-token-create",
    formatToolDescription({
      type: 'API',
      description: "Create a new access token with specific permissions",
      bestFor: [
        "Setting up API access",
        "Creating service tokens",
        "Implementing least-privilege access"
      ],
      relations: {
        prerequisites: ["security-access-tokens"],
        nextSteps: ["security-access-tokens"]
      }
    }),
    {
      name: z.string().describe("Name for the access token"),
      permissions: z.array(z.string()).describe("List of permissions (e.g., ['project:read', 'service:write'])"),
      expiresAt: z.string().optional().describe("Expiration date (ISO format, e.g., '2024-12-31T23:59:59Z')")
    },
    async ({ name, permissions, expiresAt }) => {
      return securityService.createAccessToken(name, permissions, expiresAt);
    }
  ),

  createTool(
    "security-token-revoke",
    formatToolDescription({
      type: 'API',
      description: "Revoke an access token (WARNING: Cannot be undone)",
      bestFor: [
        "Removing compromised tokens",
        "Cleaning up unused tokens",
        "Emergency access revocation"
      ],
      notFor: [
        "Active tokens still in use"
      ],
      relations: {
        prerequisites: ["security-access-tokens"],
        nextSteps: ["security-access-tokens"]
      }
    }),
    {
      tokenId: z.string().describe("ID of the access token to revoke")
    },
    async ({ tokenId }) => {
      return securityService.revokeAccessToken(tokenId);
    }
  ),

  createTool(
    "security-ip-allowlists",
    formatToolDescription({
      type: 'QUERY',
      description: "List IP allow lists for network access control",
      bestFor: [
        "Managing network security",
        "Viewing access restrictions",
        "Compliance and audit requirements"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-ip-allowlist-create", "security-ip-allowlist-update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return securityService.listIPAllowLists(projectId);
    }
  ),

  createTool(
    "security-ip-allowlist-create",
    formatToolDescription({
      type: 'API',
      description: "Create IP allow list for network access control",
      bestFor: [
        "Restricting access to specific IP ranges",
        "Implementing network security policies",
        "Compliance requirements"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-ip-allowlists"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      name: z.string().describe("Name for the IP allow list"),
      ipRanges: z.array(z.string()).describe("IP addresses or CIDR ranges (e.g., ['192.168.1.0/24', '10.0.0.1'])"),
      description: z.string().optional().describe("Description of the allow list purpose")
    },
    async ({ projectId, name, ipRanges, description }) => {
      return securityService.createIPAllowList(projectId, name, ipRanges, description);
    }
  ),

  createTool(
    "security-compliance-report",
    formatToolDescription({
      type: 'API',
      description: "Generate compliance report for security frameworks",
      bestFor: [
        "Compliance audits and assessments",
        "Security posture evaluation",
        "Regulatory requirement verification"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["security-audit-logs", "security-vulnerabilities"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      framework: z.enum(['SOC2', 'GDPR', 'HIPAA', 'PCI_DSS', 'ISO27001']).describe("Compliance framework to evaluate against")
    },
    async ({ projectId, framework }) => {
      return securityService.generateComplianceReport(projectId, framework);
    }
  )
];