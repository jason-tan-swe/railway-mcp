import { z } from 'zod';
import { createTool, formatToolDescription } from '@/utils/tools.js';
import { createSuccessResponse, createErrorResponse } from '@/utils/responses.js';
import { 
  validateFilterConfig, 
  getFilterExamples, 
  parseToolFilter,
  getFilterStats 
} from '@/utils/tool-filter.js';
import { CATEGORY_PRESETS, getAvailableCategories } from '@/config/tool-categories.js';

export const toolFilterTools = [
  createTool(
    "tool_filter_validate",
    formatToolDescription({
      type: 'UTILITY',
      description: "Validate a tool filter configuration before applying it",
      bestFor: [
        "Testing filter configurations",
        "Debugging filter issues",
        "Learning filter syntax"
      ],
      relations: {
        related: ["tool_filter_examples", "tool_filter_categories"]
      }
    }),
    {
      filter: z.string().describe("Tool filter string to validate (e.g., 'simple,deployment' or 'project_list,service_create')")
    },
    async ({ filter }) => {
      try {
        const validation = validateFilterConfig(filter);
        const config = parseToolFilter(filter);
        
        if (validation.valid) {
          const stats = getFilterStats(config);
          
          return createSuccessResponse({
            text: `✅ Valid filter configuration\n\n${stats}\n\nEnabled tools: ${Array.from(config.filteredTools).sort().join(', ')}`,
            data: {
              valid: true,
              stats,
              enabledTools: Array.from(config.filteredTools).sort(),
              totalEnabled: config.filteredTools.size
            }
          });
        } else {
          let errorText = `❌ Invalid filter configuration\n\nErrors:\n${validation.errors.map(e => `  • ${e}`).join('\n')}`;
          
          if (validation.suggestions.length > 0) {
            errorText += `\n\nSuggestions:\n${validation.suggestions.map(s => `  • ${s}`).join('\n')}`;
          }
          
          return createErrorResponse(errorText);
        }
      } catch (error) {
        return createErrorResponse(`Error validating filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  ),

  createTool(
    "tool_filter_examples",
    formatToolDescription({
      type: 'UTILITY',
      description: "Get example tool filter configurations for different use cases",
      bestFor: [
        "Learning filter syntax",
        "Finding appropriate filters",
        "Configuration guidance"
      ],
      relations: {
        related: ["tool_filter_validate", "tool_filter_categories"]
      }
    }),
    {},
    async () => {
      try {
        const examples = getFilterExamples();
        
        const exampleText = Object.entries(examples)
          .map(([useCase, filter]) => `**${useCase}**: \`${filter}\``)
          .join('\n');
        
        const text = `# Tool Filter Examples

Set \`RAILWAY_TOOLS_FILTER\` environment variable to filter tools:

${exampleText}

## How to use:
\`\`\`bash
# Single category
export RAILWAY_TOOLS_FILTER="simple"

# Multiple categories  
export RAILWAY_TOOLS_FILTER="intermediate,deployment"

# Specific tools
export RAILWAY_TOOLS_FILTER="project_list,service_create"

# Mixed approach
export RAILWAY_TOOLS_FILTER="simple,backup-restore"
\`\`\``;

        return createSuccessResponse({
          text,
          data: examples
        });
      } catch (error) {
        return createErrorResponse(`Error getting examples: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  ),

  createTool(
    "tool_filter_categories",
    formatToolDescription({
      type: 'UTILITY',
      description: "List all available tool categories and their descriptions",
      bestFor: [
        "Understanding available categories",
        "Planning filter configurations",
        "Category exploration"
      ],
      relations: {
        related: ["tool_filter_examples", "tool_filter_validate"]
      }
    }),
    {},
    async () => {
      try {
        const categories = getAvailableCategories();
        
        const categoryDetails = categories.map(category => {
          const preset = CATEGORY_PRESETS[category];
          return `**${category}** (${preset.tools.length} tools): ${preset.description}`;
        });
        
        const text = `# Available Tool Categories

${categoryDetails.join('\n\n')}

## Category Hierarchy:

**Complexity Levels:**
- \`simple\`: Basic information and listing (${CATEGORY_PRESETS.simple.tools.length} tools)
- \`intermediate\`: Includes simple + CRUD operations (${CATEGORY_PRESETS.intermediate.tools.length} tools)  
- \`pro\`: All tools including advanced features (${CATEGORY_PRESETS.pro.tools.length} tools)

**Use Case Categories:**
- \`core\`: Essential project/service management (${CATEGORY_PRESETS.core.tools.length} tools)
- \`deployment\`: Service creation and deployment (${CATEGORY_PRESETS.deployment.tools.length} tools)
- \`data\`: Database, volumes, variables, backups (${CATEGORY_PRESETS.data.tools.length} tools)
- \`monitoring\`: Logs, metrics, alerts, tracing (${CATEGORY_PRESETS.monitoring.tools.length} tools)
- \`enterprise\`: Advanced networking, security (${CATEGORY_PRESETS.enterprise.tools.length} tools)
- \`team\`: Team management, usage, billing (${CATEGORY_PRESETS.team.tools.length} tools)
- \`integration\`: Webhooks, templates, GitHub (${CATEGORY_PRESETS.integration.tools.length} tools)
- \`utility\`: Configuration and helper tools (${CATEGORY_PRESETS.utility.tools.length} tools)`;

        return createSuccessResponse({
          text,
          data: {
            categories: Object.fromEntries(
              categories.map(cat => [cat, CATEGORY_PRESETS[cat]])
            )
          }
        });
      } catch (error) {
        return createErrorResponse(`Error getting categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  ),

  createTool(
    "tool_filter_current",
    formatToolDescription({
      type: 'UTILITY',
      description: "Show the current tool filter configuration and enabled tools",
      bestFor: [
        "Checking active filters",
        "Debugging tool availability",
        "Verifying configuration"
      ],
      relations: {
        related: ["tool_filter_validate", "tool_filter_examples"]
      }
    }),
    {},
    async () => {
      try {
        const currentFilter = process.env.RAILWAY_TOOLS_FILTER;
        const config = parseToolFilter(currentFilter);
        const stats = getFilterStats(config);
        
        let text = `# Current Tool Filter Configuration\n\n${stats}`;
        
        if (config.enabled) {
          text += `\n\n**Filter String**: \`${currentFilter}\``;
          
          if (config.categories.length > 0) {
            text += `\n\n**Active Categories**: ${config.categories.join(', ')}`;
          }
          
          if (config.specificTools.length > 0) {
            text += `\n\n**Specific Tools**: ${config.specificTools.join(', ')}`;
          }
          
          text += `\n\n**Enabled Tools** (${config.filteredTools.size}):\n${Array.from(config.filteredTools).sort().join(', ')}`;
        } else {
          text += `\n\n**All ${config.filteredTools.size} tools are enabled** (no filtering active)`;
        }

        return createSuccessResponse({
          text,
          data: {
            filterString: currentFilter || null,
            enabled: config.enabled,
            categories: config.categories,
            specificTools: config.specificTools,
            enabledTools: Array.from(config.filteredTools).sort(),
            totalEnabled: config.filteredTools.size
          }
        });
      } catch (error) {
        return createErrorResponse(`Error getting current filter: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  )
];