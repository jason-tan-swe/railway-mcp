import { z } from "zod";

/**
 * NOTE: ALL NON-METAL RAILWAY REGIONS -- TODO: Update when they've fully migrated to metal 🔄
 */
export const RegionCodeSchema = z.enum([
  "asia-southeast1",
  "asia-southeast1-eqsg3a", 
  "europe-west4",
  "europe-west4-drams3a",
  "us-east4",
  "us-east4-eqdc4a",
  "us-west1",
  "us-west2"
]);

// This creates the TypeScript type from the schema
export type RegionCode = z.infer<typeof RegionCodeSchema>;

export interface User {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
}

// GraphQL Edge Types
export interface Edge<T> {
  node: T;
}

export interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor?: string;
}

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  environments: Connection<Environment>;
  services: Connection<Service>;
  teamId?: string;
  baseEnvironmentId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  expiredAt?: string;
  isPublic: boolean;
  isTempProject: boolean;
  prDeploys: boolean;
  prEnvCopyVolData: boolean;
  botPrEnvironments: boolean;
  subscriptionType?: string;
  subscriptionPlanLimit?: number;
}

export interface Environment {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  isEphemeral: boolean;
  unmergedChangesCount: number;
}

export interface Service {
  id: string;
  name: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  icon?: string;
  templateServiceId?: string;
  templateThreadSlug?: string;
  featureFlags: string[];
}

export const ServiceInstanceSchema = z.object({
  id: z.string(),
  serviceId: z.string(),
  serviceName: z.string(),
  environmentId: z.string(),
  buildCommand: z.string().optional(),
  startCommand: z.string().optional(),
  rootDirectory: z.string().optional(),
  region: RegionCodeSchema.optional(),
  healthcheckPath: z.string().optional(),
  sleepApplication: z.boolean().optional(),
  numReplicas: z.number().optional(),
  builder: z.string().optional(),
  cronSchedule: z.string().optional(),
  healthcheckTimeout: z.number().optional(),
  isUpdatable: z.boolean().optional(),
  railwayConfigFile: z.string().optional(),
  restartPolicyType: z.string().optional(),
  restartPolicyMaxRetries: z.number().optional(),
  upstreamUrl: z.string().optional(),
  watchPatterns: z.array(z.string()).optional()
});

export type ServiceInstance = z.infer<typeof ServiceInstanceSchema>;

export interface Deployment {
  id: string;
  status: string;
  createdAt: string;
  serviceId: string;
  environmentId: string;
  url?: string;
  staticUrl?: string;
  canRedeploy?: boolean;
  canRollback?: boolean;
  projectId: string;
  meta?: Record<string, any>;
  snapshotId?: string;
  suggestAddServiceDomain?: boolean;
  deploymentStopped?: boolean;
}

export interface DeploymentLog {
  timestamp: string;
  message: string;
  severity: string;
  attributes: {
    key: string;
    value: string;
  }[];
  type: 'build' | 'deployment';
}

export interface Variable {
  name: string;
  value: string;
  serviceId?: string;
  environmentId: string;
  projectId: string;
}

// API Response types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: {
    message: string;
    locations?: { line: number; column: number }[];
    path?: string[];
  }[];
}

export interface ProjectsResponse {
  projects: Connection<Project>;
}

export interface ProjectResponse {
  project: Project;
}

export interface ServicesResponse {
  services: Connection<Service>;
}

export interface EnvironmentsResponse {
  environments: Connection<Environment>;
}

export interface DeploymentsResponse {
  deployments: Connection<Deployment>;
}

export interface VariablesResponse {
  variables: Record<string, string>;
}

// API Input types
export interface ServiceCreateInput {
  projectId: string;
  name?: string;
  source: {
    repo?: string;
    image?: string;
  };
}

export interface VariableUpsertInput {
  projectId: string;
  environmentId: string;
  serviceId?: string;
  name: string;
  value: string;
}

export interface VariableDeleteInput {
  projectId: string;
  environmentId: string;
  serviceId?: string;
  name: string;
}

export interface DeploymentTriggerInput {
  commitSha?: string;
  environmentId: string;
  serviceId: string;
}

// Database types
export enum DatabaseType {
  POSTGRES = 'postgres',
  MYSQL = 'mysql',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  MINIO = 'minio',
  SQLITE3 = 'sqlite3',
  POCKETBASE = 'pocketbase',
  CLICKHOUSE = 'clickhouse',
  MARIADB = 'mariadb',
  PGVECTOR = 'pgvector',
}

export interface DatabaseConfig {
  source: string;
  defaultName: string;
  description: string;
  category: string;
  variables?: Record<string, string>;
  port: number;
}

/**
 * Input type for creating a service domain
 */
export interface ServiceDomainCreateInput {
  /** ID of the environment */
  environmentId: string;
  /** ID of the service */
  serviceId: string;
  /** Custom domain name (optional) */
  domain?: string;
  /** Suffix for the domain (optional) */
  suffix?: string;
  /** Target port for the domain (optional) */
  targetPort?: number;
}

/**
 * Input type for updating a service domain
 */
export interface ServiceDomainUpdateInput {
  /** ID of the domain to update */
  id: string;
  /** New target port for the domain */
  targetPort: number;
}

/**
 * Service domain model
 */
export interface ServiceDomain {
  /** Unique identifier */
  id: string;
  /** Creation timestamp */
  createdAt: string;
  /** Deletion timestamp, null if not deleted */
  deletedAt: string | null;
  /** Full domain name */
  domain: string;
  /** ID of the environment */
  environmentId: string;
  /** ID of the project */
  projectId: string;
  /** ID of the service */
  serviceId: string;
  /** Suffix part of the domain (for service domains) */
  suffix: string | null;
  /** Target port the domain maps to */
  targetPort: number | null;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Domain availability check result
 */
export interface DomainAvailabilityResult {
  /** Whether the domain is available */
  available: boolean;
  /** Message explaining availability status */
  message: string;
}

/**
 * Result of listing domains for a service
 */
export interface DomainsListResult {
  /** List of custom domains */
  customDomains: ServiceDomain[];
  /** List of service domains */
  serviceDomains: ServiceDomain[];
}

/**
 * TCP Proxy model
 */
export interface TcpProxy {
  /** Unique identifier */
  id: string;
  /** Creation timestamp */
  createdAt: string;
  /** Deletion timestamp, null if not deleted */
  deletedAt: string | null;
  /** Domain for the TCP proxy */
  domain: string;
  /** ID of the environment */
  environmentId: string;
  /** ID of the service */
  serviceId: string;
  /** Container port that will be proxied */
  applicationPort: number;
  /** Proxy port that gets exposed */
  proxyPort: number;
  /** Last update timestamp */
  updatedAt: string;
}

/**
 * Input type for creating a TCP proxy
 */
export interface TcpProxyCreateInput {
  /** ID of the environment */
  environmentId: string;
  /** ID of the service */
  serviceId: string;
  /** Container port that will be proxied */
  applicationPort: number;
}

export interface Volume {
  __typename?: string;
  createdAt: string;
  id: string;
  name: string;
  project: Project;
  projectId: string;
  volumeInstances: Connection<VolumeInstance[]>;
}

export interface VolumeCreateInput {
  projectId: string; // Project to create volume in
  serviceId: string; // Service to attach volume to
  environmentId: string; // Environment to create volume in
  mountPath: string; // Path to mount volume on
}

export interface VolumeUpdateInput {
  name: string;
}

export interface VolumeInstance {
  __typename?: string;
  createdAt: string;
  currentSizeMB?: number;
  environmentId: string;
  externalId?: string;
  id: string;
  mountPath?: string;
  region?: string;
  service: Service;
  serviceId?: string;
  sizeMB?: number;
  state?: string;
  type?: string;
  volume: Volume;
  volumeId: string;
}
