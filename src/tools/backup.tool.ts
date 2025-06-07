import { z } from "zod";
import { createTool, formatToolDescription } from "../utils/tools.js";
import { backupService } from "../services/backup.service.js";

export const backupTools = [
  createTool(
    "backup-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List all backups for a project",
      bestFor: [
        "Viewing backup history",
        "Checking backup status",
        "Managing backup storage"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["backup-get", "backup-create", "backup-restore"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return backupService.listBackups(projectId);
    }
  ),

  createTool(
    "backup-create",
    formatToolDescription({
      type: 'API',
      description: "Create a backup of project, service, volume, or database",
      bestFor: [
        "Creating manual backups before changes",
        "Data protection and recovery preparation",
        "Compliance and audit requirements"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["backup-get", "backup-list"],
        related: ["backup-policy-create"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      type: z.enum(['PROJECT', 'SERVICE', 'VOLUME', 'DATABASE']).describe("Type of backup to create"),
      serviceId: z.string().optional().describe("ID of service (for SERVICE/DATABASE backups)"),
      volumeId: z.string().optional().describe("ID of volume (for VOLUME backups)"),
      description: z.string().optional().describe("Description of the backup"),
      retentionDays: z.number().min(1).max(365).optional().describe("Days to retain backup (default: 30)")
    },
    async ({ projectId, type, serviceId, volumeId, description, retentionDays }) => {
      return backupService.createBackup(projectId, type, serviceId, volumeId, description, retentionDays);
    }
  ),

  createTool(
    "backup-get",
    formatToolDescription({
      type: 'QUERY',
      description: "Get detailed information about a specific backup",
      bestFor: [
        "Checking backup details and status",
        "Verifying backup integrity",
        "Planning restore operations"
      ],
      relations: {
        prerequisites: ["backup-list"],
        nextSteps: ["backup-restore", "backup-delete"]
      }
    }),
    {
      backupId: z.string().describe("ID of the backup")
    },
    async ({ backupId }) => {
      return backupService.getBackup(backupId);
    }
  ),

  createTool(
    "backup-restore",
    formatToolDescription({
      type: 'API',
      description: "Restore data from a backup",
      bestFor: [
        "Disaster recovery",
        "Rolling back to previous state",
        "Migrating data between projects"
      ],
      notFor: [
        "Testing (data will be overwritten)"
      ],
      relations: {
        prerequisites: ["backup-get"],
        nextSteps: ["backup-restore-status", "project_list"]
      }
    }),
    {
      backupId: z.string().describe("ID of the backup to restore"),
      targetProjectId: z.string().describe("ID of target project for restore"),
      targetServiceId: z.string().optional().describe("ID of target service (if restoring to specific service)"),
      overwrite: z.boolean().optional().describe("Whether to overwrite existing data (default: false)")
    },
    async ({ backupId, targetProjectId, targetServiceId, overwrite }) => {
      return backupService.restoreBackup(backupId, targetProjectId, targetServiceId, overwrite);
    }
  ),

  createTool(
    "backup-restore-status",
    formatToolDescription({
      type: 'QUERY',
      description: "Check the status of a restore operation",
      bestFor: [
        "Monitoring restore progress",
        "Checking for restore errors",
        "Verifying restore completion"
      ],
      relations: {
        prerequisites: ["backup-restore"],
        nextSteps: ["backup-list", "project_list"]
      }
    }),
    {
      restoreId: z.string().describe("ID of the restore operation")
    },
    async ({ restoreId }) => {
      return backupService.getRestoreStatus(restoreId);
    }
  ),

  createTool(
    "backup-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete a backup (WARNING: Cannot be undone)",
      bestFor: [
        "Cleaning up old backups",
        "Managing storage costs",
        "Removing unnecessary backups"
      ],
      notFor: [
        "Active backups still needed for recovery"
      ],
      relations: {
        prerequisites: ["backup-get"],
        nextSteps: ["backup-list"]
      }
    }),
    {
      backupId: z.string().describe("ID of the backup to delete")
    },
    async ({ backupId }) => {
      return backupService.deleteBackup(backupId);
    }
  ),

  createTool(
    "backup-policy-list",
    formatToolDescription({
      type: 'QUERY',
      description: "List automated backup policies for a project",
      bestFor: [
        "Viewing backup automation settings",
        "Managing backup schedules",
        "Compliance and governance"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["backup-policy-create", "backup-policy-update"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project")
    },
    async ({ projectId }) => {
      return backupService.listBackupPolicies(projectId);
    }
  ),

  createTool(
    "backup-policy-create",
    formatToolDescription({
      type: 'API',
      description: "Create an automated backup policy",
      bestFor: [
        "Setting up automated backups",
        "Ensuring regular data protection",
        "Compliance requirements"
      ],
      relations: {
        prerequisites: ["project_list"],
        nextSteps: ["backup-policy-list", "backup-list"]
      }
    }),
    {
      projectId: z.string().describe("ID of the project"),
      name: z.string().describe("Name for the backup policy"),
      schedule: z.string().describe("Cron expression for backup schedule (e.g., '0 2 * * *' for daily at 2 AM)"),
      backupType: z.enum(['PROJECT', 'SERVICE', 'VOLUME', 'DATABASE']).describe("Type of backup"),
      retentionDays: z.number().min(1).max(365).describe("Days to retain backups"),
      targets: z.array(z.object({
        serviceId: z.string().optional(),
        volumeId: z.string().optional()
      })).describe("Specific targets for backup (services or volumes)")
    },
    async ({ projectId, name, schedule, backupType, retentionDays, targets }) => {
      return backupService.createBackupPolicy(projectId, name, schedule, backupType, retentionDays, targets);
    }
  ),

  createTool(
    "backup-policy-update",
    formatToolDescription({
      type: 'API',
      description: "Update an automated backup policy",
      bestFor: [
        "Modifying backup schedules",
        "Updating retention policies",
        "Enabling/disabling backup automation"
      ],
      relations: {
        prerequisites: ["backup-policy-list"],
        nextSteps: ["backup-policy-list"]
      }
    }),
    {
      policyId: z.string().describe("ID of the backup policy"),
      name: z.string().optional().describe("New name for the policy"),
      schedule: z.string().optional().describe("New cron schedule"),
      retentionDays: z.number().min(1).max(365).optional().describe("New retention period"),
      isActive: z.boolean().optional().describe("Enable or disable the policy")
    },
    async ({ policyId, name, schedule, retentionDays, isActive }) => {
      return backupService.updateBackupPolicy(policyId, name, schedule, retentionDays, isActive);
    }
  ),

  createTool(
    "backup-policy-delete",
    formatToolDescription({
      type: 'API',
      description: "Delete an automated backup policy",
      bestFor: [
        "Removing unused backup policies",
        "Cleaning up automation"
      ],
      notFor: [
        "Active policies protecting critical data"
      ],
      relations: {
        prerequisites: ["backup-policy-list"],
        nextSteps: ["backup-policy-list"]
      }
    }),
    {
      policyId: z.string().describe("ID of the backup policy to delete")
    },
    async ({ policyId }) => {
      return backupService.deleteBackupPolicy(policyId);
    }
  )
];