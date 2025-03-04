
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
}

export const DATABASE_CONFIGS: Record<DatabaseType, DatabaseConfig> = {
  [DatabaseType.POSTGRES]: {
    source: 'railwayapp-templates/postgres-ssl:15',
    defaultName: 'PostgreSQL',
    description: 'PostgreSQL database service',
    category: 'SQL Databases',
    variables: {
      POSTGRES_URL: "jdbc:postgresql://${{POSTGRESUSER}}:${{POSTGRESPASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{POSTGRESDB}}",
      POSTGRESUSER: "postgres-user",
      POSTGRESPASSWORD: "postgres-password",
      POSTGRESDB: "postgres-db"
    }
  },
  [DatabaseType.MYSQL]: {
    source: 'mysql:latest',
    defaultName: 'MySQL',
    description: 'MySQL database service',
    category: 'SQL Databases',
    variables: {
      MYSQL_PUBLIC_URL: "mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQL_DATABASE}}",
      MYSQL_URL: "mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_PRIVATE_DOMAIN}}:3306/${{MYSQL_DATABASE}}",
      MYSQLHOST: "${{RAILWAY_PRIVATE_DOMAIN}}",
      MYSQLPORT: "3306",
      MYSQLUSER: "root",
      MYSQLPASSWORD: "mysql-password",
      MYSQLDATABASE: "mysql-db",
      MYSQL_ROOT_PASSWORD: "mysql-password",
    }
  },
  [DatabaseType.MONGODB]: {
    source: 'mongo:6',
    defaultName: 'MongoDB',
    description: 'MongoDB NoSQL database service',
    category: 'NoSQL Databases',
  },
  [DatabaseType.REDIS]: {
    source: 'redis:7',
    defaultName: 'Redis',
    description: 'Redis in-memory data store',
    category: 'In-Memory Stores',
  },
  [DatabaseType.MINIO]: {
    source: 'minio:latest',
    defaultName: 'MinIO',
    description: 'MinIO object storage service',
    category: 'Object Storage',
  },
  [DatabaseType.SQLITE3]: {
    source: 'sqlite:latest',
    defaultName: 'SQLite',
    description: 'SQLite relational database',
    category: 'SQL Databases',
  },
  [DatabaseType.POCKETBASE]: {
    source: 'pocketbase/pocketbase:latest',
    defaultName: 'PocketBase',
    description: 'PocketBase lightweight, open-source, self-hosted backend',
    category: 'SQL Databases',
  },
  [DatabaseType.CLICKHOUSE]: {
    source: 'clickhouse/clickhouse-server:23',
    defaultName: 'ClickHouse',
    description: 'ClickHouse column-oriented database',
    category: 'Analytics Databases',
  },
  [DatabaseType.MARIADB]: {
    source: 'mariadb:10',
    defaultName: 'MariaDB',
    description: 'MariaDB relational database',
    category: 'SQL Databases',
  },
  [DatabaseType.PGVECTOR]: {
    source: 'postgres:14',
    defaultName: 'PGVector',
    description: 'PGVector vector database',
    category: 'Vector Databases',
  },
};
