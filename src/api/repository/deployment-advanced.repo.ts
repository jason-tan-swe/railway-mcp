import { BaseApiClient } from '../base-client.js';

export interface DeploymentVersion {
  id: string;
  serviceId: string;
  deploymentId: string;
  version: string;
  gitSha: string;
  gitBranch: string;
  buildId: string;
  status: 'BUILDING' | 'READY' | 'ACTIVE' | 'FAILED' | 'ROLLED_BACK';
  environment: Record<string, string>;
  buildTime: number;
  deployTime: number;
  createdAt: string;
  activatedAt?: string;
  deactivatedAt?: string;
}

export interface RollbackOperation {
  id: string;
  serviceId: string;
  fromVersionId: string;
  toVersionId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  reason: string;
  triggeredBy: string;
  rollbackStrategy: 'INSTANT' | 'BLUE_GREEN' | 'CANARY';
  progress: number;
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface BuildJob {
  id: string;
  serviceId: string;
  status: 'QUEUED' | 'BUILDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  gitSha: string;
  gitBranch: string;
  buildConfig: {
    buildCommand?: string;
    dockerfilePath?: string;
    buildArgs?: Record<string, string>;
    cacheEnabled: boolean;
  };
  buildTime: number;
  queueTime: number;
  logs: string;
  artifacts: Array<{
    type: 'DOCKER_IMAGE' | 'BINARY' | 'STATIC_FILES';
    path: string;
    size: number;
  }>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface CanaryDeployment {
  id: string;
  serviceId: string;
  newVersionId: string;
  currentVersionId: string;
  trafficSplit: number; // percentage for new version
  status: 'STARTING' | 'ACTIVE' | 'PROMOTING' | 'ROLLING_BACK' | 'COMPLETED';
  metrics: {
    errorRate: number;
    responseTime: number;
    throughput: number;
  };
  rules: Array<{
    metric: string;
    threshold: number;
    action: 'PROMOTE' | 'ROLLBACK';
  }>;
  createdAt: string;
  promotedAt?: string;
}

export interface BlueGreenDeployment {
  id: string;
  serviceId: string;
  blueVersionId: string;
  greenVersionId: string;
  activeSlot: 'BLUE' | 'GREEN';
  status: 'PREPARING' | 'READY_TO_SWITCH' | 'SWITCHING' | 'COMPLETED' | 'FAILED';
  switchTime?: string;
  createdAt: string;
  completedAt?: string;
}

export class DeploymentAdvancedRepository {
  constructor(private client: BaseApiClient) {}

  async listDeploymentVersions(serviceId: string, limit: number = 20): Promise<DeploymentVersion[]> {
    const query = `
      query listDeploymentVersions($serviceId: String!, $limit: Int!) {
        service(id: $serviceId) {
          deploymentVersions(first: $limit, orderBy: { createdAt: DESC }) {
            edges {
              node {
                id
                serviceId
                deploymentId
                version
                gitSha
                gitBranch
                buildId
                status
                environment
                buildTime
                deployTime
                createdAt
                activatedAt
                deactivatedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      service: { deploymentVersions: { edges: Array<{ node: DeploymentVersion }> } };
    }>(query, { serviceId, limit });

    return response.service.deploymentVersions.edges.map(edge => edge.node);
  }

  async createRollback(serviceId: string, toVersionId: string, reason: string, strategy: string): Promise<RollbackOperation> {
    const query = `
      mutation createRollback($serviceId: String!, $toVersionId: String!, $reason: String!, $strategy: RollbackStrategy!) {
        rollbackCreate(serviceId: $serviceId, toVersionId: $toVersionId, reason: $reason, strategy: $strategy) {
          id
          serviceId
          fromVersionId
          toVersionId
          status
          reason
          triggeredBy
          rollbackStrategy
          progress
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ rollbackCreate: RollbackOperation }>(query, {
      serviceId, toVersionId, reason, strategy
    });

    return response.rollbackCreate;
  }

  async getRollbackStatus(rollbackId: string): Promise<RollbackOperation> {
    const query = `
      query getRollbackStatus($rollbackId: String!) {
        rollback(id: $rollbackId) {
          id
          serviceId
          fromVersionId
          toVersionId
          status
          reason
          triggeredBy
          rollbackStrategy
          progress
          createdAt
          completedAt
          errorMessage
        }
      }
    `;

    const response = await this.client.request<{ rollback: RollbackOperation }>(query, { rollbackId });
    return response.rollback;
  }

  async listRollbacks(serviceId: string): Promise<RollbackOperation[]> {
    const query = `
      query listRollbacks($serviceId: String!) {
        service(id: $serviceId) {
          rollbacks {
            edges {
              node {
                id
                serviceId
                fromVersionId
                toVersionId
                status
                reason
                triggeredBy
                rollbackStrategy
                progress
                createdAt
                completedAt
                errorMessage
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      service: { rollbacks: { edges: Array<{ node: RollbackOperation }> } };
    }>(query, { serviceId });

    return response.service.rollbacks.edges.map(edge => edge.node);
  }

  async listBuildJobs(serviceId: string, limit: number = 20): Promise<BuildJob[]> {
    const query = `
      query listBuildJobs($serviceId: String!, $limit: Int!) {
        service(id: $serviceId) {
          buildJobs(first: $limit, orderBy: { createdAt: DESC }) {
            edges {
              node {
                id
                serviceId
                status
                gitSha
                gitBranch
                buildConfig {
                  buildCommand
                  dockerfilePath
                  buildArgs
                  cacheEnabled
                }
                buildTime
                queueTime
                logs
                artifacts {
                  type
                  path
                  size
                }
                createdAt
                startedAt
                completedAt
              }
            }
          }
        }
      }
    `;

    const response = await this.client.request<{
      service: { buildJobs: { edges: Array<{ node: BuildJob }> } };
    }>(query, { serviceId, limit });

    return response.service.buildJobs.edges.map(edge => edge.node);
  }

  async triggerBuild(serviceId: string, gitSha?: string, buildConfig?: any): Promise<BuildJob> {
    const query = `
      mutation triggerBuild($serviceId: String!, $gitSha: String, $buildConfig: BuildConfigInput) {
        buildTrigger(serviceId: $serviceId, gitSha: $gitSha, buildConfig: $buildConfig) {
          id
          serviceId
          status
          gitSha
          gitBranch
          buildConfig {
            buildCommand
            dockerfilePath
            buildArgs
            cacheEnabled
          }
          queueTime
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ buildTrigger: BuildJob }>(query, {
      serviceId, gitSha, buildConfig
    });

    return response.buildTrigger;
  }

  async cancelBuild(buildId: string): Promise<boolean> {
    const query = `
      mutation cancelBuild($buildId: String!) {
        buildCancel(id: $buildId)
      }
    `;

    const response = await this.client.request<{ buildCancel: boolean }>(query, { buildId });
    return response.buildCancel;
  }

  async getBuildLogs(buildId: string, lines?: number): Promise<string> {
    const query = `
      query getBuildLogs($buildId: String!, $lines: Int) {
        buildJob(id: $buildId) {
          logs(lines: $lines)
        }
      }
    `;

    const response = await this.client.request<{
      buildJob: { logs: string };
    }>(query, { buildId, lines });

    return response.buildJob.logs;
  }

  async createCanaryDeployment(serviceId: string, newVersionId: string, trafficSplit: number, rules: any[]): Promise<CanaryDeployment> {
    const query = `
      mutation createCanaryDeployment($serviceId: String!, $newVersionId: String!, $trafficSplit: Int!, $rules: [CanaryRuleInput!]!) {
        canaryDeploymentCreate(serviceId: $serviceId, newVersionId: $newVersionId, trafficSplit: $trafficSplit, rules: $rules) {
          id
          serviceId
          newVersionId
          currentVersionId
          trafficSplit
          status
          metrics {
            errorRate
            responseTime
            throughput
          }
          rules {
            metric
            threshold
            action
          }
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ canaryDeploymentCreate: CanaryDeployment }>(query, {
      serviceId, newVersionId, trafficSplit, rules
    });

    return response.canaryDeploymentCreate;
  }

  async promoteCanaryDeployment(canaryId: string): Promise<CanaryDeployment> {
    const query = `
      mutation promoteCanaryDeployment($canaryId: String!) {
        canaryDeploymentPromote(id: $canaryId) {
          id
          status
          promotedAt
        }
      }
    `;

    const response = await this.client.request<{ canaryDeploymentPromote: CanaryDeployment }>(query, { canaryId });
    return response.canaryDeploymentPromote;
  }

  async createBlueGreenDeployment(serviceId: string, newVersionId: string): Promise<BlueGreenDeployment> {
    const query = `
      mutation createBlueGreenDeployment($serviceId: String!, $newVersionId: String!) {
        blueGreenDeploymentCreate(serviceId: $serviceId, newVersionId: $newVersionId) {
          id
          serviceId
          blueVersionId
          greenVersionId
          activeSlot
          status
          createdAt
        }
      }
    `;

    const response = await this.client.request<{ blueGreenDeploymentCreate: BlueGreenDeployment }>(query, {
      serviceId, newVersionId
    });

    return response.blueGreenDeploymentCreate;
  }

  async switchBlueGreenDeployment(blueGreenId: string): Promise<BlueGreenDeployment> {
    const query = `
      mutation switchBlueGreenDeployment($blueGreenId: String!) {
        blueGreenDeploymentSwitch(id: $blueGreenId) {
          id
          activeSlot
          status
          switchTime
          completedAt
        }
      }
    `;

    const response = await this.client.request<{ blueGreenDeploymentSwitch: BlueGreenDeployment }>(query, { blueGreenId });
    return response.blueGreenDeploymentSwitch;
  }
}