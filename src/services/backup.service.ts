import { BaseService } from "./base.service.js";
import { createSuccessResponse, createErrorResponse, formatError } from "../utils/responses.js";

export class BackupService extends BaseService {
  constructor() {
    super();
  }

  async listBackups(projectId: string) {
    try {
      const backups = await this.client.backup.listBackups(projectId);
      
      const completedCount = backups.filter(b => b.status === 'COMPLETED').length;
      const inProgressCount = backups.filter(b => b.status === 'IN_PROGRESS').length;
      const failedCount = backups.filter(b => b.status === 'FAILED').length;

      const totalSize = backups
        .filter(b => b.size)
        .reduce((sum, b) => sum + (b.size || 0), 0);

      const byType = backups.reduce((acc, backup) => {
        if (!acc[backup.type]) acc[backup.type] = [];
        acc[backup.type].push(backup);
        return acc;
      }, {} as Record<string, typeof backups>);

      return createSuccessResponse({
        text: `Found ${backups.length} backups (${completedCount} completed, ${inProgressCount} in progress, ${failedCount} failed)`,
        data: {
          projectId,
          summary: {
            totalCount: backups.length,
            completedCount,
            inProgressCount,
            failedCount,
            totalSizeGB: (totalSize / (1024 * 1024 * 1024)).toFixed(2)
          },
          byType: Object.entries(byType).map(([type, typeBackups]) => ({
            type,
            count: typeBackups.length,
            latestBackup: typeBackups.sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0]?.createdAt
          })),
          backups: backups.map(backup => ({
            id: backup.id,
            type: backup.type,
            status: backup.status,
            size: backup.size ? `${(backup.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A',
            createdAt: backup.createdAt,
            completedAt: backup.completedAt,
            expiresAt: backup.expiresAt,
            description: backup.metadata?.description || 'No description',
            serviceId: backup.serviceId,
            volumeId: backup.volumeId
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list backups: ${formatError(error)}`);
    }
  }

  async createBackup(projectId: string, type: string, serviceId?: string, volumeId?: string, description?: string, retentionDays?: number) {
    try {
      const backup = await this.client.backup.createBackup({
        projectId,
        type: type as any,
        serviceId,
        volumeId,
        description,
        retentionDays: retentionDays || 30
      });

      return createSuccessResponse({
        text: `${type} backup created successfully`,
        data: {
          id: backup.id,
          type: backup.type,
          status: backup.status,
          projectId: backup.projectId,
          serviceId: backup.serviceId,
          volumeId: backup.volumeId,
          description: backup.metadata?.description,
          retentionDays: backup.metadata?.retentionDays,
          createdAt: backup.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create backup: ${formatError(error)}`);
    }
  }

  async getBackup(backupId: string) {
    try {
      const backup = await this.client.backup.getBackup(backupId);

      const progress = backup.status === 'COMPLETED' ? 100 : 
                     backup.status === 'IN_PROGRESS' ? 50 : 0;

      return createSuccessResponse({
        text: `Backup details for ${backup.type} backup`,
        data: {
          id: backup.id,
          type: backup.type,
          status: backup.status,
          progress: `${progress}%`,
          projectId: backup.projectId,
          serviceId: backup.serviceId,
          volumeId: backup.volumeId,
          size: backup.size ? `${(backup.size / (1024 * 1024)).toFixed(2)} MB` : 'N/A',
          metadata: {
            description: backup.metadata?.description || 'No description',
            retentionDays: backup.metadata?.retentionDays || 30,
            tags: backup.metadata?.tags || [],
            compressionType: backup.metadata?.compressionType || 'gzip'
          },
          timing: {
            createdAt: backup.createdAt,
            completedAt: backup.completedAt || 'N/A',
            expiresAt: backup.expiresAt || 'N/A'
          }
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get backup: ${formatError(error)}`);
    }
  }

  async restoreBackup(backupId: string, targetProjectId: string, targetServiceId?: string, overwrite?: boolean) {
    try {
      const restore = await this.client.backup.restoreBackup({
        backupId,
        targetProjectId,
        targetServiceId,
        options: {
          overwrite: overwrite || false,
          excludeVolumes: false
        }
      });

      return createSuccessResponse({
        text: `Restore operation initiated`,
        data: {
          restoreId: restore.id,
          backupId: restore.backupId,
          targetProjectId: restore.targetProjectId,
          targetServiceId: restore.targetServiceId,
          status: restore.status,
          progress: `${restore.progress || 0}%`,
          createdAt: restore.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to restore backup: ${formatError(error)}`);
    }
  }

  async getRestoreStatus(restoreId: string) {
    try {
      const restore = await this.client.backup.getRestoreStatus(restoreId);

      return createSuccessResponse({
        text: `Restore operation is ${restore.status.toLowerCase()}`,
        data: {
          id: restore.id,
          backupId: restore.backupId,
          status: restore.status,
          progress: `${restore.progress || 0}%`,
          targetProjectId: restore.targetProjectId,
          targetServiceId: restore.targetServiceId,
          timing: {
            createdAt: restore.createdAt,
            completedAt: restore.completedAt || 'N/A'
          },
          errorMessage: restore.errorMessage || null
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to get restore status: ${formatError(error)}`);
    }
  }

  async deleteBackup(backupId: string) {
    try {
      const success = await this.client.backup.deleteBackup(backupId);
      
      if (success) {
        return createSuccessResponse({
          text: "Backup deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete backup");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete backup: ${formatError(error)}`);
    }
  }

  async listBackupPolicies(projectId: string) {
    try {
      const policies = await this.client.backup.listBackupPolicies(projectId);
      
      const activeCount = policies.filter(p => p.isActive).length;
      const inactiveCount = policies.length - activeCount;

      return createSuccessResponse({
        text: `Found ${policies.length} backup policies (${activeCount} active, ${inactiveCount} inactive)`,
        data: {
          projectId,
          summary: {
            totalCount: policies.length,
            activeCount,
            inactiveCount
          },
          policies: policies.map(policy => ({
            id: policy.id,
            name: policy.name,
            schedule: policy.schedule,
            backupType: policy.backupType,
            retentionDays: policy.retentionDays,
            isActive: policy.isActive,
            targetCount: policy.targets.length,
            createdAt: policy.createdAt,
            updatedAt: policy.updatedAt
          }))
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to list backup policies: ${formatError(error)}`);
    }
  }

  async createBackupPolicy(projectId: string, name: string, schedule: string, backupType: string, retentionDays: number, targets: Array<{serviceId?: string, volumeId?: string}>) {
    try {
      const policy = await this.client.backup.createBackupPolicy({
        projectId,
        name,
        schedule,
        backupType: backupType as any,
        retentionDays,
        targets
      });

      return createSuccessResponse({
        text: `Backup policy "${name}" created successfully`,
        data: {
          id: policy.id,
          name: policy.name,
          schedule: policy.schedule,
          backupType: policy.backupType,
          retentionDays: policy.retentionDays,
          isActive: policy.isActive,
          targetCount: policy.targets.length,
          createdAt: policy.createdAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to create backup policy: ${formatError(error)}`);
    }
  }

  async updateBackupPolicy(policyId: string, name?: string, schedule?: string, retentionDays?: number, isActive?: boolean) {
    try {
      const policy = await this.client.backup.updateBackupPolicy(policyId, {
        name,
        schedule,
        retentionDays
      });

      return createSuccessResponse({
        text: `Backup policy updated successfully`,
        data: {
          id: policy.id,
          name: policy.name,
          schedule: policy.schedule,
          retentionDays: policy.retentionDays,
          isActive: policy.isActive,
          updatedAt: policy.updatedAt
        }
      });
    } catch (error) {
      return createErrorResponse(`Failed to update backup policy: ${formatError(error)}`);
    }
  }

  async deleteBackupPolicy(policyId: string) {
    try {
      const success = await this.client.backup.deleteBackupPolicy(policyId);
      
      if (success) {
        return createSuccessResponse({
          text: "Backup policy deleted successfully"
        });
      } else {
        return createErrorResponse("Failed to delete backup policy");
      }
    } catch (error) {
      return createErrorResponse(`Failed to delete backup policy: ${formatError(error)}`);
    }
  }
}

export const backupService = new BackupService();