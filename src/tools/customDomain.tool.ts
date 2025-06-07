import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { customDomainService } from "../services/customDomain.service.js";

export const customDomainTools = [
  createTool(
    "custom-domain-create",
    formatToolDescription({
      type: 'API',
      description: "Add a custom domain to a Railway project",
      bestFor: [
        "Setting up production domains",
        "Adding branded URLs to services",
        "Configuring custom domains with SSL"
      ],
      notFor: [
        "Railway-generated domains (use domain_create instead)",
        "TCP/UDP endpoints (use tcp_proxy_create)"
      ],
      relations: {
        prerequisites: ["project_list", "service_list"],
        nextSteps: ["custom-domain-status", "custom-domain-list"],
        alternatives: ["domain_create"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      domain: z.string().describe("Custom domain name (e.g., app.example.com)"),
      serviceId: z.string().optional().describe("ID of the service to route to (optional)"),
      environmentId: z.string().optional().describe("ID of the environment (optional)")
    },
    async ({ projectId, domain, serviceId, environmentId }) => {
      return customDomainService.create(projectId, domain, serviceId, environmentId);
    }
  ),

  createTool(
    "custom-domain-update",
    formatToolDescription({
      type: 'API',
      description: "Update custom domain routing configuration",
      bestFor: [
        "Changing which service a domain points to",
        "Updating environment routing"
      ],
      notFor: [
        "Changing the domain name itself (delete and recreate)",
        "DNS configuration changes"
      ],
      relations: {
        prerequisites: ["custom-domain-list"],
        nextSteps: ["custom-domain-status"]
      }
    }),
    {
      id: z.string().describe("ID of the custom domain"),
      serviceId: z.string().optional().describe("New service ID to route to"),
      environmentId: z.string().optional().describe("New environment ID")
    },
    async ({ id, serviceId, environmentId }) => {
      return customDomainService.update(id, serviceId, environmentId);
    }
  ),

  createTool(
    "custom-domain-delete",
    formatToolDescription({
      type: 'API',
      description: "Remove a custom domain from a project",
      bestFor: [
        "Removing unused custom domains",
        "Domain cleanup",
        "Before transferring domain to another project"
      ],
      relations: {
        prerequisites: ["custom-domain-list"],
        related: ["custom-domain-create"]
      }
    }),
    {
      id: z.string().describe("ID of the custom domain to delete")
    },
    async ({ id }) => {
      return customDomainService.delete(id);
    }
  ),

  createTool(
    "custom-domain-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all custom domains for a project",
      bestFor: [
        "Viewing all custom domains",
        "Checking domain status",
        "Finding domain IDs"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["custom-domain-status", "custom-domain-update", "custom-domain-delete"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return customDomainService.list(projectId);
    }
  ),

  createTool(
    "custom-domain-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a custom domain",
      bestFor: [
        "Viewing domain configuration",
        "Checking CNAME targets",
        "Getting domain details"
      ],
      relations: {
        prerequisites: ["custom-domain-list"],
        nextSteps: ["custom-domain-status", "custom-domain-update"]
      }
    }),
    {
      id: z.string().describe("ID of the custom domain")
    },
    async ({ id }) => {
      return customDomainService.get(id);
    }
  ),

  createTool(
    "custom-domain-status",
    formatToolDescription({
      type: 'QUERY',
      description: "Check DNS and SSL status of a custom domain",
      bestFor: [
        "Verifying DNS configuration",
        "Checking SSL certificate status",
        "Troubleshooting domain issues",
        "Getting setup instructions"
      ],
      relations: {
        prerequisites: ["custom-domain-create", "custom-domain-list"],
        related: ["custom-domain-get"]
      }
    }),
    {
      id: z.string().describe("ID of the custom domain")
    },
    async ({ id }) => {
      return customDomainService.checkStatus(id);
    }
  )
];