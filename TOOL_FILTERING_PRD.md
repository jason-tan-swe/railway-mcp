# Railway MCP Tool Filtering Feature - PRD

## Overview
The Railway MCP server currently exposes 146+ tools, which can overwhelm LLMs when choosing appropriate tools for tasks. This feature introduces configurable tool filtering to expose only relevant subsets of tools based on use case and complexity level.

## Problem Statement
- **Tool Overload**: 146+ tools make tool selection difficult for LLMs
- **Context Pollution**: Large tool lists consume valuable context tokens
- **Use Case Mismatch**: Basic users don't need enterprise features
- **Performance Impact**: Processing large tool lists affects response time

## Goals
1. **Primary**: Enable selective tool exposure via environment variables
2. **Secondary**: Categorize tools by complexity and use case
3. **Tertiary**: Improve LLM decision-making accuracy
4. **Performance**: Reduce tool list processing overhead

## Non-Goals
- Dynamic tool filtering during runtime
- User-specific tool permissions
- Complex configuration files

## Requirements

### Functional Requirements

#### FR1: Environment Variable Configuration
- Support `RAILWAY_TOOLS_FILTER` environment variable
- Accept comma-separated tool names for specific tools
- Accept predefined category names for tool groups

#### FR2: Tool Categories
**Complexity Levels:**
- `simple`: Basic operations (list, info, status)
- `intermediate`: Creation, deletion, basic management
- `pro`: Advanced configuration, enterprise features

**Use Case Groups:**
- `deployment`: Core deployment operations
- `management`: Managing existing services
- `scaling`: Performance and scaling tools
- `enterprise`: Advanced enterprise features
- `monitoring`: Logs, metrics, alerting
- `networking`: Domains, proxies, networking
- `security`: Security, compliance, access control
- `database`: Database-specific operations

#### FR3: Filtering Logic
- Default: All tools enabled (backward compatibility)
- Single category: `RAILWAY_TOOLS_FILTER=simple`
- Multiple categories: `RAILWAY_TOOLS_FILTER=simple,deployment`
- Specific tools: `RAILWAY_TOOLS_FILTER=project_list,service_create`
- Mixed: `RAILWAY_TOOLS_FILTER=simple,project_delete`

### Non-Functional Requirements

#### NFR1: Performance
- Tool filtering adds <10ms to startup time
- Memory usage increases <5% for metadata storage

#### NFR2: Maintainability
- Tool categories defined in single configuration file
- Easy to add new tools to categories
- Clear category assignment validation

#### NFR3: Usability
- Invalid categories/tools log warnings but don't crash
- Clear error messages for configuration issues

## Technical Design

### Architecture
```
src/utils/tool-filter.ts        # Core filtering logic
src/config/tool-categories.ts   # Category definitions
src/tools/index.ts             # Updated registration logic
```

### Data Structures
```typescript
interface ToolCategory {
  name: string;
  description: string;
  complexity: 'simple' | 'intermediate' | 'pro';
  useCase: string[];
  tools: string[];
}

interface ToolFilterConfig {
  enabled: boolean;
  categories: string[];
  specificTools: string[];
}
```

### Environment Variable Format
```bash
# Category-based filtering
RAILWAY_TOOLS_FILTER="simple"
RAILWAY_TOOLS_FILTER="simple,deployment"
RAILWAY_TOOLS_FILTER="intermediate,monitoring,networking"

# Specific tool filtering  
RAILWAY_TOOLS_FILTER="project_list,service_create,deployment_info"

# Mixed filtering
RAILWAY_TOOLS_FILTER="simple,project_delete,service_restart"

# Disable filtering (default)
# RAILWAY_TOOLS_FILTER="" or unset
```

## Tool Categorization

### Simple (20-25 tools)
**Core Information:**
- `project_list`, `project_info`
- `service_list`, `service_info`
- `deployment_list`, `deployment_info`
- `environment_list`
- `logs_get`

**Basic Status:**
- `service_status`
- `deployment_status`
- `domain_list`

### Intermediate (40-50 tools)
**Creation & Management:**
- `project_create`, `project_delete`
- `service_create_*`, `service_delete`
- `deployment_create`, `deployment_trigger`
- `variable_set`, `variable_delete`
- `domain_create`, `domain_delete`

**Configuration:**
- `service_update`
- `environment_create`
- `volume_create`, `volume_delete`

### Pro (70+ tools)
**Advanced Operations:**
- `project_delete_batch`
- `deployment_rollback`
- `service_scale`
- `backup_*` tools
- `security_*` tools
- `monitoring_*` tools
- `networking_advanced`
- `webhook_*` tools

### Use Case Categories

#### Deployment (15-20 tools)
- `service_create_*`
- `deployment_*`
- `github_*`
- `template_*`

#### Management (25-30 tools)
- `service_*` (update, restart, scale)
- `variable_*`
- `volume_*`
- `environment_*`

#### Monitoring (15-20 tools)
- `logs_*`
- `monitoring_*`
- `usage_*`

#### Networking (10-15 tools)
- `domain_*`
- `customDomain_*`
- `tcpProxy_*`
- `networking_*`

#### Security (10-15 tools)
- `security_*`
- `backup_*`
- `webhook_*`

#### Enterprise (20+ tools)
- `team_*`
- Advanced security tools
- Compliance tools
- Advanced monitoring

## Implementation Plan

### Phase 1: Core Infrastructure (Tasks 1-3)
1. **Tool categorization system design**
2. **Environment variable parsing**
3. **Basic filtering mechanism**

### Phase 2: Categorization (Tasks 4-5)
4. **Define all tool categories**
5. **Assign existing tools to categories**

### Phase 3: Integration (Tasks 6-7)
6. **Update tool registration logic**
7. **Add validation and error handling**

### Phase 4: Testing & Documentation (Tasks 8-9)
8. **Comprehensive test suite**
9. **Documentation updates**

## Testing Plan

### Unit Tests
```bash
# Tool filtering logic
src/utils/tool-filter.test.ts

# Category validation
src/config/tool-categories.test.ts

# Environment variable parsing
src/config/env-config.test.ts
```

### Integration Tests
```bash
# Test each category loads correct tools
test-scripts/test-tool-filtering.sh

# Test mixed filtering scenarios
test-scripts/test-mixed-filtering.sh

# Test error handling
test-scripts/test-invalid-filters.sh
```

### Test Cases

#### Category Filtering
- ✅ `RAILWAY_TOOLS_FILTER=simple` loads only simple tools
- ✅ `RAILWAY_TOOLS_FILTER=simple,deployment` loads combined set
- ✅ `RAILWAY_TOOLS_FILTER=pro` loads all tools (pro includes all)

#### Specific Tool Filtering
- ✅ `RAILWAY_TOOLS_FILTER=project_list,service_info` loads only specified tools
- ✅ Mixed category and specific tools work correctly

#### Error Handling
- ✅ Invalid category names log warnings but don't crash
- ✅ Invalid tool names are ignored with warnings
- ✅ Empty filter string disables filtering

#### Performance
- ✅ Startup time impact <10ms
- ✅ Memory usage impact <5%

### Manual Testing Scenarios
1. **Basic User**: Set `simple` category, verify only essential tools available
2. **Developer**: Set `intermediate,deployment`, verify appropriate tool set
3. **Enterprise**: Set `pro`, verify all tools available
4. **Custom Setup**: Set specific tools, verify exact match

## Success Metrics
- **Usability**: Reduce tool count from 146+ to 20-50 based on category
- **Performance**: <10ms startup impact, <5% memory increase
- **Adoption**: Clear documentation with usage examples
- **Maintainability**: Easy to add new tools to categories

## Risks & Mitigations
- **Risk**: Complex configuration confuses users
  - **Mitigation**: Provide clear examples and sensible defaults
- **Risk**: Tool categorization becomes outdated
  - **Mitigation**: Regular review process, automated validation
- **Risk**: Performance impact on startup
  - **Mitigation**: Efficient filtering algorithm, lazy loading

## Future Enhancements
- Configuration file support for complex filtering rules
- Dynamic tool loading based on Railway project analysis
- Tool recommendation system based on project type
- Integration with Claude Code for context-aware filtering

## Implementation Tasks

### High Priority
1. ✅ Create PRD and testing plan
2. ⏳ Design tool categorization system
3. ⏳ Implement environment variable configuration
4. ⏳ Create tool filtering mechanism

### Medium Priority
5. ⏳ Categorize all existing tools
6. ⏳ Update tool registration logic
7. ⏳ Add validation and error handling
8. ⏳ Create comprehensive tests

### Low Priority
9. ⏳ Update documentation and examples