import { BaseApiClient } from '../base-client.js';

export interface Backup {
  id: string;
  projectId: string;
  serviceId?: string;
  volumeId?: string;
  type: 'PROJECT' | 'SERVICE' | 'VOLUME' | 'DATABASE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  size?: number;
  createdAt: string;
  completedAt?: string;
  expiresAt?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    retentionDays?: number;
    compressionType?: string;
  };
}

export interface BackupCreateInput {
  projectId: string;
  serviceId?: string;
  volumeId?: string;
  type: 'PROJECT' | 'SERVICE' | 'VOLUME' | 'DATABASE';
  description?: string;
  retentionDays?: number;
  tags?: string[];
}

export interface RestoreOperation {
  id: string;
  backupId: string;
  targetProjectId: string;
  targetServiceId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  progress?: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface RestoreInput {
  backupId: string;
  targetProjectId: string;
  targetServiceId?: string;
  options?: {
    overwrite?: boolean;
    renamePattern?: string;
    excludeVolumes?: boolean;
  };
}

export interface BackupPolicy {
  id: string;
  projectId: string;
  name: string;
  schedule: string; // cron expression
  retentionDays: number;
  isActive: boolean;
  backupType: 'PROJECT' | 'SERVICE' | 'VOLUME' | 'DATABASE';
  targets: Array<{
    serviceId?: string;
    volumeId?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BackupPolicyCreateInput {
  projectId: string;
  name: string;
  schedule: string;
  retentionDays: number;
  backupType: 'PROJECT' | 'SERVICE' | 'VOLUME' | 'DATABASE';
  targets: Array<{
    serviceId?: string;
    volumeId?: string;
  }>;
}

export class BackupRepository {
  constructor(private client: BaseApiClient) {}

  async listBackups(projectId: string): Promise<Backup[]> {
    const query = `
      query listBackups($projectId: String!) {
        project(id: $projectId) {
          backups {
            edges {
              node {
                id
                projectId
                serviceId
                volumeId
                type
                status
                size
                createdAt
                completedAt
                expiresAt
                metadata {
                  description
                  tags
                  retentionDays
                  compressionType
                }
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { backups: { edges: Array<{ node: Backup }> } };
    }>(query, { projectId });

    return response.project.backups.edges.map(edge => edge.node);
  }

  async getBackup(backupId: string): Promise<Backup> {
    const query = `
      query getBackup($backupId: String!) {
        backup(id: $backupId) {
          id
          projectId
          serviceId
          volumeId
          type
          status
          size
          createdAt
          completedAt
          expiresAt
          metadata {
            description
            tags
            retentionDays
            compressionType
          }
        }
      }
    `;

    const response = await this.client.request<{ backup: Backup }>(query, { backupId });
    return response.backup;
  }

  async createBackup(input: BackupCreateInput): Promise<Backup> {
    const query = `
      mutation createBackup($input: BackupCreateInput!) {
        backupCreate(input: $input) {
          id
          projectId
          serviceId
          volumeId
          type
          status
          createdAt
          metadata {
            description
            retentionDays
            tags
          }
        }
      }
    `;

    const response = await this.client.request<{ backupCreate: Backup }>(query, { input });
    return response.backupCreate;
  }

  async deleteBackup(backupId: string): Promise<boolean> {
    const query = `
      mutation deleteBackup($backupId: String!) {
        backupDelete(id: $backupId)
      }
    `;

    const response = await this.client.request<{ backupDelete: boolean }>(query, { backupId });
    return response.backupDelete;
  }

  async restoreBackup(input: RestoreInput): Promise<RestoreOperation> {
    const query = `
      mutation restoreBackup($input: RestoreInput!) {
        backupRestore(input: $input) {
          id
          backupId
          targetProjectId
          targetServiceId
          status
          progress
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ backupRestore: RestoreOperation }>(query, { input });
    return response.backupRestore;
  }

  async getRestoreStatus(restoreId: string): Promise<RestoreOperation> {
    const query = `
      query getRestoreStatus($restoreId: String!) {
        restoreOperation(id: $restoreId) {
          id
          backupId
          targetProjectId
          targetServiceId
          status
          progress
          createdAt
          completedAt
          errorMessage
        }
      }
    `;

    const response = await this.client.request<{ restoreOperation: RestoreOperation }>(query, { restoreId });
    return response.restoreOperation;
  }

  async listBackupPolicies(projectId: string): Promise<BackupPolicy[]> {
    const query = `
      query listBackupPolicies($projectId: String!) {
        project(id: $projectId) {
          backupPolicies {
            edges {
              node {
                id
                projectId
                name
                schedule
                retentionDays
                isActive
                backupType
                targets {
                  serviceId
                  volumeId
                }
                createdAt
                updatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      project: { backupPolicies: { edges: Array<{ node: BackupPolicy }> } };
    }>(query, { projectId });

    return response.project.backupPolicies.edges.map(edge => edge.node);
  }

  async createBackupPolicy(input: BackupPolicyCreateInput): Promise<BackupPolicy> {
    const query = `
      mutation createBackupPolicy($input: BackupPolicyCreateInput!) {
        backupPolicyCreate(input: $input) {
          id
          projectId
          name
          schedule
          retentionDays
          isActive
          backupType
          targets {
            serviceId
            volumeId
          }
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ backupPolicyCreate: BackupPolicy }>(query, { input });
    return response.backupPolicyCreate;
  }

  async updateBackupPolicy(policyId: string, updates: Partial<BackupPolicyCreateInput>): Promise<BackupPolicy> {
    const query = `
      mutation updateBackupPolicy($policyId: String!, $updates: BackupPolicyUpdateInput!) {
        backupPolicyUpdate(id: $policyId, input: $updates) {
          id
          name
          schedule
          retentionDays
          isActive
          updatedAt
        }
      }
    `;

    const response = await this.client.request<{ backupPolicyUpdate: BackupPolicy }>(query, { policyId, updates });
    return response.backupPolicyUpdate;
  }

  async deleteBackupPolicy(policyId: string): Promise<boolean> {
    const query = `
      mutation deleteBackupPolicy($policyId: String!) {
        backupPolicyDelete(id: $policyId)
      }
    `;

    const response = await this.client.request<{ backupPolicyDelete: boolean }>(query, { policyId });
    return response.backupPolicyDelete;
  }
}