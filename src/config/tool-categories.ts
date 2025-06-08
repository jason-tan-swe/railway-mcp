/**
 * Tool categorization system for Railway MCP server
 * Defines complexity levels and use case categories for tool filtering
 */

export type ComplexityLevel = 'simple' | 'intermediate' | 'pro';
export type UseCase = 'core' | 'deployment' | 'data' | 'monitoring' | 'enterprise' | 'team' | 'integration' | 'utility';

export interface ToolCategory {
  name: string;
  description: string;
  complexity: ComplexityLevel;
  useCases: UseCase[];
}

export interface ToolDefinition {
  name: string;
  complexity: ComplexityLevel;
  useCases: UseCase[];
  description: string;
}

/**
 * All tools organized by complexity and use case
 */
export const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  // === SIMPLE TOOLS (Information, Listing, Status) ===
  
  // Core - Simple
  'project_list': {
    name: 'project_list',
    complexity: 'simple',
    useCases: ['core'],
    description: 'List all projects'
  },
  'project_info': {
    name: 'project_info',
    complexity: 'simple',
    useCases: ['core'],
    description: 'Get project details'
  },
  'project_environments': {
    name: 'project_environments',
    complexity: 'simple',
    useCases: ['core'],
    description: 'List project environments'
  },
  'service_list': {
    name: 'service_list',
    complexity: 'simple',
    useCases: ['core'],
    description: 'List services in project'
  },
  'service_info': {
    name: 'service_info',
    complexity: 'simple',
    useCases: ['core'],
    description: 'Get service details'
  },
  'environment-list': {
    name: 'environment-list',
    complexity: 'simple',
    useCases: ['core'],
    description: 'List environments'
  },
  'environment-info': {
    name: 'environment-info',
    complexity: 'simple',
    useCases: ['core'],
    description: 'Get environment details'
  },
  'deployment_list': {
    name: 'deployment_list',
    complexity: 'simple',
    useCases: ['core', 'deployment'],
    description: 'List deployments'
  },
  'deployment_status': {
    name: 'deployment_status',
    complexity: 'simple',
    useCases: ['core', 'deployment'],
    description: 'Check deployment status'
  },

  // Data - Simple  
  'list_service_variables': {
    name: 'list_service_variables',
    complexity: 'simple',
    useCases: ['data'],
    description: 'List environment variables'
  },
  'volume_list': {
    name: 'volume_list',
    complexity: 'simple',
    useCases: ['data'],
    description: 'List volumes'
  },
  'database_list_types': {
    name: 'database_list_types',
    complexity: 'simple',
    useCases: ['data'],
    description: 'List available database types'
  },
  'backup-list': {
    name: 'backup-list',
    complexity: 'simple',
    useCases: ['data'],
    description: 'List backups'
  },
  'backup-get': {
    name: 'backup-get',
    complexity: 'simple',
    useCases: ['data'],
    description: 'Get backup details'
  },
  'backup-policy-list': {
    name: 'backup-policy-list',
    complexity: 'simple',
    useCases: ['data'],
    description: 'List backup policies'
  },

  // Monitoring - Simple
  'logs-build': {
    name: 'logs-build',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get build logs'
  },
  'logs-deployment': {
    name: 'logs-deployment',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get runtime logs'
  },
  'logs-environment': {
    name: 'logs-environment',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get environment logs'
  },
  'logs-http': {
    name: 'logs-http',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get HTTP request logs'
  },
  'logs-plugin': {
    name: 'logs-plugin',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get database plugin logs'
  },
  'deployment_logs': {
    name: 'deployment_logs',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'Get deployment logs'
  },
  'monitoring-alerts': {
    name: 'monitoring-alerts',
    complexity: 'simple',
    useCases: ['monitoring'],
    description: 'List monitoring alerts'
  },

  // Team - Simple
  'team-list': {
    name: 'team-list',
    complexity: 'simple',
    useCases: ['team'],
    description: 'List all teams'
  },
  'team-get': {
    name: 'team-get',
    complexity: 'simple',
    useCases: ['team'],
    description: 'Get team details'
  },
  'team-members': {
    name: 'team-members',
    complexity: 'simple',
    useCases: ['team'],
    description: 'List team members'
  },
  'usage-team': {
    name: 'usage-team',
    complexity: 'simple',
    useCases: ['team'],
    description: 'Get team usage metrics'
  },
  'usage-project': {
    name: 'usage-project',
    complexity: 'simple',
    useCases: ['team'],
    description: 'Get project usage metrics'
  },
  'billing-info': {
    name: 'billing-info',
    complexity: 'simple',
    useCases: ['team'],
    description: 'Get billing information'
  },
  'usage-alerts': {
    name: 'usage-alerts',
    complexity: 'simple',
    useCases: ['team'],
    description: 'Get usage alerts'
  },

  // Integration - Simple
  'webhook-list': {
    name: 'webhook-list',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'List webhooks'
  },
  'webhook-get': {
    name: 'webhook-get',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'Get webhook details'
  },
  'webhook-deliveries': {
    name: 'webhook-deliveries',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'Get delivery history'
  },
  'webhook-events': {
    name: 'webhook-events',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'List supported events'
  },
  'template-list': {
    name: 'template-list',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'List available templates'
  },
  'template-get': {
    name: 'template-get',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'Get template details'
  },
  'template-search': {
    name: 'template-search',
    complexity: 'simple',
    useCases: ['integration'],
    description: 'Search templates'
  },

  // Enterprise - Simple
  'security-access-tokens': {
    name: 'security-access-tokens',
    complexity: 'simple',
    useCases: ['enterprise'],
    description: 'List access tokens'
  },

  // Utility - Simple
  'configure_api_token': {
    name: 'configure_api_token',
    complexity: 'simple',
    useCases: ['utility'],
    description: 'Configure Railway API token'
  },
  'tool_filter_examples': {
    name: 'tool_filter_examples',
    complexity: 'simple',
    useCases: ['utility'],
    description: 'Get example tool filter configurations'
  },
  'tool_filter_categories': {
    name: 'tool_filter_categories',
    complexity: 'simple',
    useCases: ['utility'],
    description: 'List available tool categories'
  },
  'tool_filter_current': {
    name: 'tool_filter_current',
    complexity: 'simple',
    useCases: ['utility'],
    description: 'Show current filter configuration'
  },
  'tool_filter_validate': {
    name: 'tool_filter_validate',
    complexity: 'simple',
    useCases: ['utility'],
    description: 'Validate tool filter configuration'
  },

  // === INTERMEDIATE TOOLS (CRUD Operations, Basic Management) ===
  
  // Core - Intermediate
  'project_create': {
    name: 'project_create',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Create new project'
  },
  'project_delete': {
    name: 'project_delete',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Delete project'
  },
  'service_create_from_repo': {
    name: 'service_create_from_repo',
    complexity: 'intermediate',
    useCases: ['core', 'deployment'],
    description: 'Create service from GitHub'
  },
  'service_create_from_image': {
    name: 'service_create_from_image',
    complexity: 'intermediate',
    useCases: ['core', 'deployment'],
    description: 'Create service from Docker image'
  },
  'service_update': {
    name: 'service_update',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Update service configuration'
  },
  'service_delete': {
    name: 'service_delete',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Delete service'
  },
  'service_restart': {
    name: 'service_restart',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Restart service'
  },
  'environment-create': {
    name: 'environment-create',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Create environment'
  },
  'environment-update': {
    name: 'environment-update',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Update environment'
  },
  'environment-delete': {
    name: 'environment-delete',
    complexity: 'intermediate',
    useCases: ['core'],
    description: 'Delete environment'
  },
  'deployment_trigger': {
    name: 'deployment_trigger',
    complexity: 'intermediate',
    useCases: ['core', 'deployment'],
    description: 'Trigger new deployment'
  },

  // Data - Intermediate
  'variable_set': {
    name: 'variable_set',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Set/update variable'
  },
  'variable_delete': {
    name: 'variable_delete',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Delete variable'
  },
  'volume_create': {
    name: 'volume_create',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Create persistent volume'
  },
  'volume_update': {
    name: 'volume_update',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Update volume'
  },
  'volume_delete': {
    name: 'volume_delete',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Delete volume'
  },
  'backup-create': {
    name: 'backup-create',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Create backup'
  },
  'backup-delete': {
    name: 'backup-delete',
    complexity: 'intermediate',
    useCases: ['data'],
    description: 'Delete backup'
  },

  // Monitoring - Intermediate
  'metrics-get': {
    name: 'metrics-get',
    complexity: 'intermediate',
    useCases: ['monitoring'],
    description: 'Get resource usage metrics'
  },
  'monitoring-metric-create': {
    name: 'monitoring-metric-create',
    complexity: 'intermediate',
    useCases: ['monitoring'],
    description: 'Create custom metric'
  },
  'monitoring-alert-update': {
    name: 'monitoring-alert-update',
    complexity: 'intermediate',
    useCases: ['monitoring'],
    description: 'Update alert'
  },
  'monitoring-alert-delete': {
    name: 'monitoring-alert-delete',
    complexity: 'intermediate',
    useCases: ['monitoring'],
    description: 'Delete alert'
  },

  // Team - Intermediate
  'team-create': {
    name: 'team-create',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Create team'
  },
  'team-update': {
    name: 'team-update',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Update team'
  },
  'team-invite': {
    name: 'team-invite',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Invite user to team'
  },
  'team-member-remove': {
    name: 'team-member-remove',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Remove team member'
  },
  'team-member-role-update': {
    name: 'team-member-role-update',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Update member role'
  },
  'usage-compare': {
    name: 'usage-compare',
    complexity: 'intermediate',
    useCases: ['team'],
    description: 'Compare usage across projects'
  },

  // Integration - Intermediate
  'webhook-create': {
    name: 'webhook-create',
    complexity: 'intermediate',
    useCases: ['integration'],
    description: 'Create webhook'
  },
  'webhook-update': {
    name: 'webhook-update',
    complexity: 'intermediate',
    useCases: ['integration'],
    description: 'Update webhook'
  },
  'webhook-delete': {
    name: 'webhook-delete',
    complexity: 'intermediate',
    useCases: ['integration'],
    description: 'Delete webhook'
  },
  'webhook-test': {
    name: 'webhook-test',
    complexity: 'intermediate',
    useCases: ['integration'],
    description: 'Test webhook'
  },

  // Enterprise - Intermediate
  'networking-private-networks': {
    name: 'networking-private-networks',
    complexity: 'intermediate',
    useCases: ['enterprise'],
    description: 'List private networks'
  },
  'networking-load-balancers': {
    name: 'networking-load-balancers',
    complexity: 'intermediate',
    useCases: ['enterprise'],
    description: 'List load balancers'
  },
  'security-audit-logs': {
    name: 'security-audit-logs',
    complexity: 'intermediate',
    useCases: ['enterprise'],
    description: 'View security audit logs'
  },
  'security-vulnerabilities': {
    name: 'security-vulnerabilities',
    complexity: 'intermediate',
    useCases: ['enterprise'],
    description: 'Get vulnerability report'
  },
  'security-ip-allowlists': {
    name: 'security-ip-allowlists',
    complexity: 'intermediate',
    useCases: ['enterprise'],
    description: 'List IP allow lists'
  },

  // === PRO TOOLS (Advanced Workflows, Enterprise Features) ===
  
  // Core - Pro
  'project_delete_batch': {
    name: 'project_delete_batch',
    complexity: 'pro',
    useCases: ['core'],
    description: 'Delete multiple projects'
  },
  'environment-clone': {
    name: 'environment-clone',
    complexity: 'pro',
    useCases: ['core'],
    description: 'Clone environment with variables'
  },
  'environment-deploy': {
    name: 'environment-deploy',
    complexity: 'pro',
    useCases: ['core', 'deployment'],
    description: 'Deploy all services in environment'
  },

  // Data - Pro
  'database_deploy_from_template': {
    name: 'database_deploy_from_template',
    complexity: 'pro',
    useCases: ['data', 'deployment'],
    description: 'Deploy database from template'
  },
  'variable_bulk_set': {
    name: 'variable_bulk_set',
    complexity: 'pro',
    useCases: ['data'],
    description: 'Set multiple variables'
  },
  'variable_copy': {
    name: 'variable_copy',
    complexity: 'pro',
    useCases: ['data'],
    description: 'Copy variables between environments'
  },
  'backup-restore': {
    name: 'backup-restore',
    complexity: 'pro',
    useCases: ['data'],
    description: 'Restore from backup'
  },
  'backup-policy-create': {
    name: 'backup-policy-create',
    complexity: 'pro',
    useCases: ['data'],
    description: 'Create backup policy'
  },

  // Monitoring - Pro
  'monitoring-metrics-query': {
    name: 'monitoring-metrics-query',
    complexity: 'pro',
    useCases: ['monitoring'],
    description: 'Query custom metrics'
  },
  'monitoring-apm-data': {
    name: 'monitoring-apm-data',
    complexity: 'pro',
    useCases: ['monitoring'],
    description: 'Get APM data'
  },
  'monitoring-alert-create': {
    name: 'monitoring-alert-create',
    complexity: 'pro',
    useCases: ['monitoring'],
    description: 'Create monitoring alert'
  },
  'monitoring-traces': {
    name: 'monitoring-traces',
    complexity: 'pro',
    useCases: ['monitoring'],
    description: 'Get distributed tracing'
  },
  'monitoring-trace-details': {
    name: 'monitoring-trace-details',
    complexity: 'pro',
    useCases: ['monitoring'],
    description: 'Get detailed trace info'
  },

  // Team - Pro
  'team-delete': {
    name: 'team-delete',
    complexity: 'pro',
    useCases: ['team'],
    description: 'Delete team'
  },

  // Integration - Pro
  'template-deploy': {
    name: 'template-deploy',
    complexity: 'pro',
    useCases: ['integration', 'deployment'],
    description: 'Deploy from template'
  },

  // Enterprise - Pro
  'networking-network-create': {
    name: 'networking-network-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create private network'
  },
  'networking-endpoint-add': {
    name: 'networking-endpoint-add',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Add service to network'
  },
  'networking-endpoint-remove': {
    name: 'networking-endpoint-remove',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Remove service from network'
  },
  'networking-load-balancer-create': {
    name: 'networking-load-balancer-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create load balancer'
  },
  'networking-lb-target-add': {
    name: 'networking-lb-target-add',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Add target to LB'
  },
  'networking-lb-target-remove': {
    name: 'networking-lb-target-remove',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Remove target from LB'
  },
  'networking-lb-health-check-update': {
    name: 'networking-lb-health-check-update',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Update LB health check'
  },
  'networking-load-balancer-delete': {
    name: 'networking-load-balancer-delete',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Delete load balancer'
  },
  'networking-routes': {
    name: 'networking-routes',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'List network routes'
  },
  'networking-route-create': {
    name: 'networking-route-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create network route'
  },
  'networking-route-delete': {
    name: 'networking-route-delete',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Delete network route'
  },
  'networking-security-groups': {
    name: 'networking-security-groups',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'List security groups'
  },
  'networking-security-group-create': {
    name: 'networking-security-group-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create security group'
  },
  'security-scan-trigger': {
    name: 'security-scan-trigger',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Trigger security scan'
  },
  'security-token-create': {
    name: 'security-token-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create access token'
  },
  'security-token-revoke': {
    name: 'security-token-revoke',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Revoke access token'
  },
  'security-ip-allowlist-create': {
    name: 'security-ip-allowlist-create',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Create IP allow list'
  },
  'security-compliance-report': {
    name: 'security-compliance-report',
    complexity: 'pro',
    useCases: ['enterprise'],
    description: 'Generate compliance report'
  }
};

/**
 * Predefined category combinations for easy filtering
 */
export const CATEGORY_PRESETS: Record<string, { description: string; tools: string[] }> = {
  'extra-simple': {
    description: 'Absolute essentials for basic service management (9 tools)',
    tools: [
      'project_list',
      'service_list', 
      'service_info',
      'deployment_list',
      'deployment_status',
      'logs-deployment',
      'service_restart',
      'variable_list',
      'variable_set'
    ]
  },
  simple: {
    description: 'Basic information and listing operations',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => TOOL_DEFINITIONS[name].complexity === 'simple')
  },
  intermediate: {
    description: 'CRUD operations and basic management',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].complexity === 'simple' || TOOL_DEFINITIONS[name].complexity === 'intermediate'
    )
  },
  pro: {
    description: 'All tools including advanced workflows and enterprise features',
    tools: Object.keys(TOOL_DEFINITIONS)
  },
  core: {
    description: 'Essential project, service, and deployment management',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('core')
    )
  },
  deployment: {
    description: 'Deployment and service creation tools',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('deployment')
    )
  },
  data: {
    description: 'Database, volume, backup, and variable management',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('data')
    )
  },
  monitoring: {
    description: 'Logs, metrics, alerts, and observability',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('monitoring')
    )
  },
  enterprise: {
    description: 'Advanced networking, security, and compliance',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('enterprise')
    )
  },
  team: {
    description: 'Team management, usage, and billing',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('team')
    )
  },
  integration: {
    description: 'Webhooks, templates, and external integrations',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('integration')
    )
  },
  utility: {
    description: 'Configuration and utility tools',
    tools: Object.keys(TOOL_DEFINITIONS).filter(name => 
      TOOL_DEFINITIONS[name].useCases.includes('utility')
    )
  }
};

/**
 * Get tools for a specific complexity level
 */
export function getToolsByComplexity(complexity: ComplexityLevel): string[] {
  return Object.keys(TOOL_DEFINITIONS).filter(name => 
    TOOL_DEFINITIONS[name].complexity === complexity
  );
}

/**
 * Get tools for specific use cases
 */
export function getToolsByUseCase(useCase: UseCase): string[] {
  return Object.keys(TOOL_DEFINITIONS).filter(name => 
    TOOL_DEFINITIONS[name].useCases.includes(useCase)
  );
}

/**
 * Get all available categories and presets
 */
export function getAvailableCategories(): string[] {
  return Object.keys(CATEGORY_PRESETS);
}

/**
 * Validate if a tool exists in our definitions
 */
export function isValidTool(toolName: string): boolean {
  return toolName in TOOL_DEFINITIONS;
}

/**
 * Validate if a category exists in our presets
 */
export function isValidCategory(category: string): boolean {
  return category in CATEGORY_PRESETS;
}