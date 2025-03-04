// General types
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

export interface ServiceInstance {
  id: string;
  serviceId: string;
  serviceName: string;
  environmentId: string;
  buildCommand?: string;
  startCommand?: string;
  rootDirectory?: string;
  region?: string;
  healthcheckPath?: string;
  sleepApplication?: boolean;
  numReplicas?: number;
  builder?: string;
  cronSchedule?: string;
  healthcheckTimeout?: number;
  isUpdatable?: boolean;
  railwayConfigFile?: string;
  restartPolicyType?: string;
  restartPolicyMaxRetries?: number;
  upstreamUrl?: string;
  watchPatterns?: string[];
}

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

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  [DatabaseType.POSTGRES]: {
    source: 'ghcr.io/railwayapp-templates/postgres-ssl:15',
    defaultName: 'PostgreSQL',
    description: 'PostgreSQL database service',
    category: 'SQL Databases',
    port: 5432,
    variables: {
      // Variables for Railway
      DATABASE_PUBLIC_URL: "postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{PGDATABASE}}",
      DATABASE_URL: "postgresql://${{PGUSER}}:${{POSTGRES_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:${{PGPORT}}/${{PGDATABASE}}",
      PGDATA: "/var/lib/postgresql/data/pgdata", // for Volume Mounting in Railway
      PGDATABASE: "${{POSTGRES_DB}}",
      PGHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
      PGPASSWORD: "${{POSTGRES_PASSWORD}}",
      PGPORT: "5432",
      PGUSER: "${{POSTGRES_USER}}",
      
      // Docker variables
      POSTGRES_DB: "postgres-db",
      POSTGRES_PASSWORD: "postgres-password",
      POSTGRES_USER: "postgres-user",
    }
  },
  [DatabaseType.MYSQL]: {
    source: 'mysql:latest',
    defaultName: 'MySQL',
    description: 'MySQL database service',
    category: 'SQL Databases',
    port: 3306,
    variables: {
      // Railway variables
      MYSQLHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
      MYSQLPASSWORD: "${{MYSQL_ROOT_PASSWORD}}",
      MYSQLDATABASE: "${{MYSQL_DATABASE}}",

      // Docker variables
      MYSQL_DATABASE: "mysql-db",
      MYSQL_PUBLIC_URL: "mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQL_DATABASE}}",
      MYSQL_URL: "mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:${{MYSQLPORT}}/${{MYSQL_DATABASE}}",
      MYSQL_ROOT_PASSWORD: "mysql-password",
      MYSQLUSER: "root",
      MYSQLPORT: "3306",
    },
  },
  [DatabaseType.MONGODB]: {
    source: 'mongo:7',
    defaultName: 'MongoDB',
    description: 'MongoDB NoSQL database service',
    category: 'NoSQL Databases',
    port: 27017,
    variables: {
      // Docker
      MONGO_INITDB_ROOT_PASSWORD: "mongo-password",
      MONGO_INITDB_ROOT_USERNAME: "mongo-user",
      MONGO_PUBLIC_URL: "mongodb://${{MONGO_INITDB_ROOT_USERNAME}}:${{MONGO_INITDB_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}",
      MONGO_URL: "mongodb://${{MONGO_INITDB_ROOT_USERNAME}}:${{MONGO_INITDB_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:${{MONGO_PORT}}",

      // Railway
      MONGOHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
      MONGOPASSWORD: "${{MONGO_INITDB_ROOT_PASSWORD}}",
      MONGOPORT: "27017",
      MONGOUSER: "${{MONGO_INITDB_ROOT_USERNAME}}",
    },
  },
  [DatabaseType.REDIS]: {
    source: 'bitnami/redis:7.2.5',
    defaultName: 'Redis',
    description: 'Redis in-memory data store',
    category: 'In-Memory Stores',
    port: 6379,
    variables: {
      // Docker
      REDIS_PASSWORD: "redis-password",
      REDIS_PORT: "6379",
      REDISUSER: "default",
      REDIS_RDB_POLICY: "3600#1 300#100 60#10000",
      REDISPORT: "6379",
      REDIS_AOF_ENABLED: "no",
      
      // Railway
      REDISPASSWORD: "${{REDIS_PASSWORD}}",
      REDISHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
      RAILWAY_RUN_UID: "0",
      REDIS_PUBLIC_URL: "redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}",
      REDIS_URL: "redis://${{REDISUSER}}:${{REDIS_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:${{REDISPORT}}",
      RAILWAY_RUN_AS_ROOT: "true",
    },
  },
  [DatabaseType.MINIO]: {
    source: 'minio:latest',
    defaultName: 'MinIO',
    description: 'MinIO object storage service',
    category: 'Object Storage',
    port: 9000,
  },
  [DatabaseType.SQLITE3]: {
    source: 'sqlite:latest',
    defaultName: 'SQLite',
    description: 'SQLite relational database',
    category: 'SQL Databases',
    port: 5432,
  },
  [DatabaseType.POCKETBASE]: {
    source: 'pocketbase/pocketbase:latest',
    defaultName: 'PocketBase',
    description: 'PocketBase lightweight, open-source, self-hosted backend',
    category: 'SQL Databases',
    port: 8080,
  },
  [DatabaseType.CLICKHOUSE]: {
    source: 'clickhouse/clickhouse-server:23',
    defaultName: 'ClickHouse',
    description: 'ClickHouse column-oriented database',
    category: 'Analytics Databases',
    port: 8123,
  },
  [DatabaseType.MARIADB]: {
    source: 'mariadb:10',
    defaultName: 'MariaDB',
    description: 'MariaDB relational database',
    category: 'SQL Databases',
    port: 3306,
  },
  [DatabaseType.PGVECTOR]: {
    source: 'postgres:14',
    defaultName: 'PGVector',
    description: 'PGVector vector database',
    category: 'Vector Databases',
    port: 5432,
  },
};

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
