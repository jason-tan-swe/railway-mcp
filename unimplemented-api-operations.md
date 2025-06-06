# Unimplemented Railway GraphQL API Operations

This document lists all Railway GraphQL API operations that are available in the specification but not yet implemented in the MCP server.

## Currently Implemented Operations

### Projects
- **Queries**: projects, project, environments, services
- **Mutations**: projectCreate, projectDelete

### Services  
- **Queries**: services (via project query), serviceInstance
- **Mutations**: serviceCreate, serviceDelete, serviceInstanceUpdate, serviceInstanceRedeploy

### Deployments
- **Queries**: deployments, deployment, buildLogs, deploymentLogs
- **Mutations**: serviceInstanceDeployV2, deploymentRestart, deploymentRollback, deploymentCancel

### Domains
- **Queries**: domains, serviceDomainAvailable
- **Mutations**: serviceDomainCreate, serviceDomainDelete, serviceDomainUpdate

### Variables
- **Queries**: variables
- **Mutations**: variableUpsert, variableDelete

### Volumes
- **Queries**: volumes (via project query)
- **Mutations**: volumeCreate, volumeUpdate, volumeDelete

### TCP Proxies
- **Queries**: tcpProxies
- **Mutations**: tcpProxyCreate, tcpProxyDelete

## Unimplemented Operations

### Authentication & User Management
- **Queries**: 
  - me
  - apiTokens
  - inviteCode
  - integrationAuth
  - integrationAuths
  - providerAuths
  - twoFactorInfo
  - recoveryCode
  
- **Mutations**:
  - apiTokenCreate
  - apiTokenDelete
  - emailChangeConfirm
  - emailChangeInitiate
  - loginSessionAuth
  - loginSessionCancel
  - loginSessionConsume
  - loginSessionCreate
  - loginSessionVerify
  - logout
  - providerAuthRemove
  - recoveryCodeGenerate
  - recoveryCodeValidate
  - twoFactorInfoCreate
  - twoFactorInfoDelete
  - twoFactorInfoSecret
  - twoFactorInfoValidate
  - userDelete
  - userUpdate
  - userProfileUpdate
  - userTermsUpdate
  - userFlagsSet
  - userFlagsRemove
  - userBetaLeave
  - userDiscordDisconnect
  - userSlackDisconnect

### Custom Domains
- **Queries**: 
  - customDomain
  - customDomainAvailable
  - domainStatus
  
- **Mutations**:
  - customDomainCreate
  - customDomainDelete
  - customDomainUpdate

### Environment Management
- **Queries**: 
  - environment
  - environmentLogs
  - environmentPatches
  
- **Mutations**:
  - environmentCreate
  - environmentDelete
  - environmentRename
  - environmentTriggersDeploy
  - baseEnvironmentOverride

### Teams & Organizations
- **Queries**: 
  - teams
  - team
  - teamById
  - teamPermissions
  - teamSlackChannels
  - teamTrustedDomains
  
- **Mutations**:
  - teamCreate
  - teamUpdate
  - teamDelete
  - teamLeave
  - teamPermissionChange
  - teamSlackChannelsConnected
  - teamSlackChannelsDisconnect
  - teamTrustedDomainCreate
  - teamTrustedDomainDelete
  - teamUserInvite
  - teamUserRemove
  - upsertSlackChannelForTeam
  - workspaceDelete
  - workspaceLeave
  - workspaceUpdate
  - workspaceUpsertSlackChannel

### Project Management
- **Mutations**:
  - projectUpdate
  - projectClaim
  - projectInvitationAccept
  - projectInvitationCreate
  - projectInvitationDelete
  - projectInvitationResend
  - projectInviteUser
  - projectLeave
  - projectMemberRemove
  - projectMemberUpdate
  - projectTokenCreate
  - projectTokenDelete
  - projectTransferConfirm
  - projectTransferInitiate
  - projectTransferToTeam
  - projectTransferToUser

### Service Management
- **Mutations**:
  - serviceConnect
  - serviceDisconnect
  - serviceFeatureFlagAdd
  - serviceFeatureFlagRemove
  - serviceRepoUpdate

### Deployment Management
- **Queries**: 
  - deploymentEvents
  - deploymentInstanceExecutions
  - deploymentSnapshot
  - deploymentTriggers
  
- **Mutations**:
  - deploymentApprove
  - deploymentRemove
  - deploymentStop
  - deploymentInstanceExecutionCreate
  - deploymentTriggerCreate
  - deploymentTriggerDelete
  - deploymentTriggerUpdate

### Template Management
- **Queries**: 
  - starterTemplates
  - template
  - templates
  - userTemplates
  
- **Mutations**:
  - templateClone
  - templateDelete
  - templateDeploy
  - templateDeployV2
  - templateGenerate
  - templateMaybeUnsetCommunityThreadSlug
  - templatePublish
  - templateServiceSourceEject
  - templateUnpublish

### Logs & Monitoring
- **Queries**: 
  - httpLogs
  - events
  - metrics
  - estimatedUsage
  - observabilityDashboards
  
- **Mutations**:
  - observabilityDashboardCreate
  - observabilityDashboardReset
  - observabilityDashboardUpdate
  - eventBatchTrack
  - eventTrack
  - telemetrySend

### Integrations
- **Queries**: 
  - githubIsRepoNameAvailable
  - gitHubRepoAccessAvailable
  - githubRepo
  - githubRepoBranches
  - githubRepos
  - githubWritableScopes
  - herokuApps
  - integrations
  
- **Mutations**:
  - githubRepoDeploy
  - githubRepoUpdate
  - herokuImportVariables
  - integrationCreate
  - integrationDelete
  - integrationUpdate

### Volume Management
- **Queries**: 
  - adminVolumeInstancesForVolume
  
- **Mutations**:
  - volumeInstanceBackupCreate
  - volumeInstanceBackupDelete
  - volumeInstanceBackupLock
  - volumeInstanceBackupRestore
  - volumeInstanceBackupScheduleUpdate
  - volumeInstanceUpdate

### Database & Plugins
- **Queries**: 
  - plugin
  
- **Mutations**:
  - pluginCreate
  - pluginDelete
  - pluginReset
  - pluginResetCredentials
  - pluginRestart
  - pluginStart
  - pluginUpdate

### Billing & Usage
- **Queries**: 
  - creditTransferMetrics
  
- **Mutations**:
  - customerMigrateToHobbyPlan
  - customerTogglePayoutsToCredits
  - usageLimitRemove
  - usageLimitSet

### Miscellaneous
- **Queries**: 
  - changelogBlockImage
  - node
  - nodes
  - regions
  - referralInfo
  - sockets
  
- **Mutations**:
  - dockerComposeImport
  - egressGatewayAssociationCreate
  - egressGatewayAssociationsClear
  - fairUseAgree
  - featureFlagAdd
  - featureFlagRemove
  - helpStationCreateThread
  - hobbyToTeamDenyMigration
  - hobbyToTeamMigrate
  - inviteCodeUse
  - jobApplicationCreate
  - missingCommandAlert
  - preferenceOverridesCreateUpdate
  - preferenceOverridesDestroyForResource
  - preferencesUpdate
  - privateNetworkCreateOrGet
  - privateNetworkEndpointCreateOrGet
  - privateNetworkEndpointDelete
  - privateNetworkEndpointRename
  - privateNetworksForEnvironmentDelete
  - referralInfoUpdate
  - sendCommunityThreadNotificationEmail
  - variableCollectionUpsert
  - webhookCreate
  - webhookDelete
  - webhookUpdate

## Recommended Implementation Priority

Based on typical Railway workflows, here are the most important unimplemented operations to add:

### High Priority
1. **Environment Management**: environmentCreate, environmentDelete, environment query
2. **Custom Domains**: customDomainCreate, customDomainDelete, customDomain query
3. **Logs & Monitoring**: httpLogs, metrics queries
4. **Database/Plugins**: plugin operations for database management
5. **Deployment Triggers**: deploymentTriggerCreate/Delete/Update

### Medium Priority
1. **Teams**: Basic team operations for collaborative features
2. **Templates**: templateDeploy for quick project setup
3. **GitHub Integration**: githubRepo queries and deploy mutations
4. **Volume Backups**: volumeInstanceBackup operations
5. **User/Auth**: me query for user context

### Low Priority
1. **Billing/Usage**: For enterprise features
2. **Slack/Discord**: Integration operations
3. **Advanced networking**: Private networks, egress gateways
4. **Preferences**: User preference management
5. **Telemetry**: Analytics operations