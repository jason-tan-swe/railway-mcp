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
  domains: z.object({
    serviceDomains: z.array(z.object({
      domain: z.string(),
    })),
  }),
  source: z.object({
    image: z.string().optional(),
    repo: z.string().optional(),
    branch: z.string().optional(),
  }).optional(),
  upstreamUrl: z.string().optional(),
});

export type ServiceInstance = z.infer<typeof ServiceInstanceSchema>;

export interface ServiceMutation {
  id: string;
  name: string;
  projectId: string;
}

export interface Deployment {
  id: string;
  projectId?: string;
  environmentId?: string;
  serviceId?: string;
  createdAt: string;
  updatedAt?: string;
  status: DeploymentStatus;
  canRedeploy?: boolean;
  meta?: DeploymentMeta;
  url?: string;
  deploymentEvents?: Connection<DeploymentEvent>;
  deploymentStopped?: boolean;
}

export interface DeploymentEvent {
  id: string;
  deploymentId: string;
  status: DeploymentStatus;
  timestamp: string;
}

export type DeploymentStatus =
  | 'BUILDING'
  | 'CANCELLED'
  | 'CRASHED'
  | 'DEPLOYING'
  | 'FAILED'
  | 'INITIALIZING'
  | 'QUEUED'
  | 'REMOVED'
  | 'REMOVING'
  | 'RESTARTING'
  | 'SKIPPED'
  | 'SUCCESS'
  | 'WAITING';

export interface DeploymentMeta {
  repo?: string;
  branch?: string;
  prNumber?: string;
  prTitle?: string;
  commitHash?: string;
  commitMessage?: string;
  commitAuthor?: string;
}

export interface ServiceDomain {
  id: string;
  serviceId: string;
  environmentId: string;
  domain: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  targetPort?: number;
  projectId?: string;
  suffix?: string;
}

export interface Domain {
  id: string;
  domain: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  serviceId?: string;
  projectId?: string;
}

export interface DomainCheckResult {
  available: boolean;
  message: string;
}

export interface Variable {
  id: string;
  name: string;
  value: string;
  serviceId?: string;
  environmentId: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface TcpProxy {
  id: string;
  serviceId: string;
  environmentId: string;
  domain: string;
  proxyType: 'TCP';
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
  applicationPort: number;
  proxyPort: number;
}

export interface Volume {
  id: string;
  projectId: string;
  environmentId: string;
  serviceId?: string;
  name: string;
  mountPath: string;
  size: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface VolumeInstance {
  id: string;
  volumeId: string;
  environmentId: string;
  mountPath: string;
  state?: VolumeState;
  size?: number;
  region?: string;
  externalId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type VolumeState = 'ATTACHED' | 'CREATED' | 'CREATING' | 'DELETING' | 'DETACHED' | 'ERRORED' | 'UPDATING';

// API Response Types
export interface BaseResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export interface ProjectResponse {
  project: Project;
}

export interface ProjectsResponse {
  projects: Connection<Project>;
}

export interface ServiceResponse {
  service: Service;
}

export interface ServiceCreateResponse {
  serviceCreate: Service;
}

export interface ServiceDeleteResponse {
  serviceDelete: boolean;
}

export interface ServiceMutationResponse {
  serviceUpdate: ServiceMutation;
}

export interface DeploymentResponse {
  deployment: Deployment;
}

export interface DeploymentsResponse {
  deployments: Connection<Deployment>;
}

export interface DeploymentCreateResponse {
  deploymentCreate: Deployment;
}

export interface DomainCheckResponse {
  domainAvailable: DomainCheckResult;
}

export interface ServiceDomainCreateResponse {
  serviceDomainCreate: ServiceDomain;
}

export interface ServiceDomainsResponse {
  serviceDomains: Connection<ServiceDomain>;
}

export interface VariablesResponse {
  variables: Record<string, string>;
}

export interface TcpProxyCreateResponse {
  tcpProxyCreate: TcpProxy;
}

export interface VolumeResponse {
  volume: Volume;
}

export interface VolumeInstanceResponse {
  volumeInstance: VolumeInstance;
}

// Service types
export interface DatabaseService extends Service {
  databaseType?: string;
  databaseName?: string;
  databaseUser?: string;
}

// Database configs
export type DatabaseCategory = 'TRADITIONAL' | 'CACHE' | 'SEARCH' | 'MODERN' | 'TIME_SERIES' | 'EMBEDDED';

export interface DatabaseConfig {
  name: string;
  type: DatabaseType;
  category: DatabaseCategory;
  description: string;
  connectionStringPattern: string;
  defaultPort: number;
  variables: string[];
  defaultUser?: string;
  defaultDatabase?: string;
  requiresPassword?: boolean;
  imageName?: string;
  volumePath?: string;
  startCommand?: string;
  port: number;
  defaultName: string;
  source: string;
}

// All supported database types
export const DatabaseType = {
  PostgreSQL: 'postgresql',
  MySQL: 'mysql',
  Redis: 'redis',
  MongoDB: 'mongodb',
  // MariaDB: 'mariadb',
  // SQLite: 'sqlite',
  // ElasticSearch: 'elasticsearch',
  // CockroachDB: 'cockroachdb',
  // Cassandra: 'cassandra',
  // Neo4j: 'neo4j',
  // InfluxDB: 'influxdb',
  // Prometheus: 'prometheus',
  // Grafana: 'grafana',
  // RabbitMQ: 'rabbitmq',
  // Kafka: 'kafka',
  // Memcached: 'memcached',
  // Etcd: 'etcd',
  // Consul: 'consul',
  // Vault: 'vault'
} as const;

export type DatabaseType = typeof DatabaseType[keyof typeof DatabaseType];

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  [DatabaseType.PostgreSQL]: {
    name: 'PostgreSQL',
    type: DatabaseType.PostgreSQL,
    category: 'TRADITIONAL',
    description: 'Advanced open-source relational database with JSON support',
    connectionStringPattern: 'postgresql://${{PGUSER}}:${{PGPASSWORD}}@${{PGHOST}}:${{PGPORT}}/${{PGDATABASE}}',
    defaultPort: 5432,
    variables: ['PGUSER', 'PGPASSWORD', 'PGHOST', 'PGPORT', 'PGDATABASE', 'DATABASE_URL', 'POSTGRES_USER', 'POSTGRES_PASSWORD', 'POSTGRES_DB'],
    defaultUser: 'postgres',
    defaultDatabase: 'railway',
    requiresPassword: true,
    imageName: 'postgres',
    volumePath: '/var/lib/postgresql/data',
    port: 5432,
    defaultName: 'postgres',
    source: 'postgresql'
  },
  [DatabaseType.MySQL]: {
    name: 'MySQL',
    type: DatabaseType.MySQL,
    category: 'TRADITIONAL',
    description: 'Popular open-source relational database',
    connectionStringPattern: 'mysql://${{MYSQL_USER}}:${{MYSQL_PASSWORD}}@${{MYSQL_HOST}}:${{MYSQL_PORT}}/${{MYSQL_DATABASE}}',
    defaultPort: 3306,
    variables: ['MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_HOST', 'MYSQL_PORT', 'MYSQL_DATABASE', 'MYSQL_ROOT_PASSWORD'],
    defaultUser: 'root',
    defaultDatabase: 'railway',
    requiresPassword: true,
    imageName: 'mysql',
    volumePath: '/var/lib/mysql',
    port: 3306,
    defaultName: 'mysql',
    source: 'mysql'
  },
  [DatabaseType.Redis]: {
    name: 'Redis',
    type: DatabaseType.Redis,
    category: 'CACHE',
    description: 'In-memory data structure store and cache',
    connectionStringPattern: 'redis://:${{REDIS_PASSWORD}}@${{REDIS_HOST}}:${{REDIS_PORT}}',
    defaultPort: 6379,
    variables: ['REDIS_URL', 'REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'],
    requiresPassword: true,
    imageName: 'redis',
    startCommand: 'redis-server --requirepass ${{REDIS_PASSWORD}}',
    port: 6379,
    defaultName: 'redis',
    source: 'redis'
  },
  [DatabaseType.MongoDB]: {
    name: 'MongoDB',
    type: DatabaseType.MongoDB,
    category: 'MODERN',
    description: 'Document-oriented NoSQL database',
    connectionStringPattern: 'mongodb://${{MONGO_INITDB_ROOT_USERNAME}}:${{MONGO_INITDB_ROOT_PASSWORD}}@${{MONGO_HOST}}:${{MONGO_PORT}}',
    defaultPort: 27017,
    variables: ['MONGO_URL', 'MONGO_HOST', 'MONGO_PORT', 'MONGO_INITDB_ROOT_USERNAME', 'MONGO_INITDB_ROOT_PASSWORD'],
    defaultUser: 'root',
    requiresPassword: true,
    imageName: 'mongo',
    volumePath: '/data/db',
    port: 27017,
    defaultName: 'mongo',
    source: 'mongodb'
  }
};

// Logs and Monitoring Types
export interface LogEntry {
  id?: string;
  timestamp: string;
  message: string;
  severity?: LogSeverity;
  attributes?: Record<string, any>;
  tags?: string[];
  deploymentId?: string;
  environmentId?: string;
  serviceId?: string;
}

export type LogSeverity = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface HttpLogEntry {
  id?: string;
  timestamp: string;
  requestId: string;
  deploymentId: string;
  deploymentInstanceId?: string;
  environmentId?: string;
  serviceId?: string;
  
  // Request details
  method: string;
  path: string;
  host: string;
  clientUa?: string;
  srcIp?: string;
  
  // Response details
  httpStatus: number;
  responseDetails?: string;
  totalDuration: number;
  
  // Network details
  downstreamProto?: string;
  upstreamProto?: string;
  upstreamAddress?: string;
  upstreamRqDuration?: number;
  edgeRegion?: string;
  
  // Data transfer
  rxBytes: number;
  txBytes: number;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  tags: Record<string, string>;
}

export interface Metric {
  measurement: MetricMeasurement;
  tags: Record<string, string>;
  values: MetricDataPoint[];
}

export type MetricMeasurement = 
  | 'CPU_USAGE'
  | 'MEMORY_USAGE'
  | 'NETWORK_RX'
  | 'NETWORK_TX'
  | 'DISK_USAGE'
  | 'HTTP_REQUEST_COUNT'
  | 'HTTP_REQUEST_DURATION';

export type MetricTag =
  | 'PROJECT_ID'
  | 'ENVIRONMENT_ID'
  | 'SERVICE_ID'
  | 'DEPLOYMENT_ID'
  | 'PLUGIN_ID'
  | 'VOLUME_ID';

// GraphQL Response Types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: (string | number)[];
    extensions?: Record<string, any>;
  }>;
}

// Additional missing types
export interface DeploymentLog {
  id: string;
  message: string;
  timestamp: string;
  severity: LogSeverity;
  type: string;
}

export interface DeploymentTriggerInput {
  serviceId: string;
  environmentId: string;
  commitSha?: string;
}

export interface ServiceDomainCreateInput {
  serviceId: string;
  environmentId: string;
  domain?: string;
  suffix?: string;
}

export interface ServiceDomainUpdateInput {
  id: string;
  domain?: string;
  targetPort?: number;
}

export interface DomainAvailabilityResult {
  available: boolean;
  message: string;
}

export interface DomainsListResult {
  domains: Domain[];
  serviceDomains: ServiceDomain[];
  customDomains: Domain[];
}

export interface ServiceCreateInput {
  projectId: string;
  name: string;
  source?: {
    image?: string;
    repo?: string;
    branch?: string;
  };
}

export interface TcpProxyCreateInput {
  serviceId: string;
  environmentId: string;
  applicationPort: number;
}

export interface VolumeCreateInput {
  projectId: string;
  environmentId: string;
  name: string;
  mountPath: string;
  size?: number;
}

export interface VolumeUpdateInput {
  name?: string;
  mountPath?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  services: Array<{
    id: string;
    name: string;
    source?: {
      image?: string;
      repo?: string;
      branch?: string;
    };
  }>;
  creator?: {
    id: string;
    name: string;
  };
  isOfficial: boolean;
  popularity: number;
  createdAt: string;
  updatedAt: string;
}