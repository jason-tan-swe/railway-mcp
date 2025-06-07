/**
 * Tool filtering utilities for Railway MCP server
 * Handles environment variable parsing and tool filtering logic
 */

import { TOOL_DEFINITIONS, CATEGORY_PRESETS, isValidTool, isValidCategory } from '@/config/tool-categories.js';

export interface ToolFilterConfig {
  enabled: boolean;
  categories: string[];
  specificTools: string[];
  filteredTools: Set<string>;
}

/**
 * Parse the RAILWAY_TOOLS_FILTER environment variable
 * Supports formats:
 * - "simple" (single category)
 * - "simple,deployment" (multiple categories)
 * - "project_list,service_create" (specific tools)
 * - "simple,project_delete" (mixed categories and tools)
 */
export function parseToolFilter(filterString?: string): ToolFilterConfig {
  // Default configuration - no filtering
  if (!filterString || filterString.trim() === '') {
    return {
      enabled: false,
      categories: [],
      specificTools: [],
      filteredTools: new Set(Object.keys(TOOL_DEFINITIONS))
    };
  }

  const items = filterString.split(',').map(item => item.trim()).filter(Boolean);
  const categories: string[] = [];
  const specificTools: string[] = [];
  const warnings: string[] = [];

  // Classify each item as category or specific tool
  for (const item of items) {
    if (isValidCategory(item)) {
      categories.push(item);
    } else if (isValidTool(item)) {
      specificTools.push(item);
    } else {
      warnings.push(`Unknown category or tool: "${item}"`);
    }
  }

  // Log warnings for invalid items
  if (warnings.length > 0) {
    console.error('Tool filter warnings:', warnings.join(', '));
  }

  // Build the final filtered tool set
  const filteredTools = new Set<string>();

  // Add tools from categories
  for (const category of categories) {
    for (const tool of CATEGORY_PRESETS[category].tools) {
      filteredTools.add(tool);
    }
  }

  // Add specific tools
  for (const tool of specificTools) {
    filteredTools.add(tool);
  }

  // If no valid items found, fall back to all tools
  if (filteredTools.size === 0) {
    console.error('No valid tools or categories found in filter, enabling all tools');
    for (const tool of Object.keys(TOOL_DEFINITIONS)) {
      filteredTools.add(tool);
    }
  }

  return {
    enabled: true,
    categories,
    specificTools,
    filteredTools
  };
}

/**
 * Check if a tool should be included based on the current filter configuration
 */
export function shouldIncludeTool(toolName: string, config: ToolFilterConfig): boolean {
  if (!config.enabled) {
    return true; // No filtering active
  }
  
  return config.filteredTools.has(toolName);
}

/**
 * Get filtering statistics for logging
 */
export function getFilterStats(config: ToolFilterConfig): string {
  if (!config.enabled) {
    return 'No tool filtering active - all tools enabled';
  }

  const totalTools = Object.keys(TOOL_DEFINITIONS).length;
  const enabledTools = config.filteredTools.size;
  const percentage = Math.round((enabledTools / totalTools) * 100);

  const parts = [];
  if (config.categories.length > 0) {
    parts.push(`categories: ${config.categories.join(', ')}`);
  }
  if (config.specificTools.length > 0) {
    parts.push(`tools: ${config.specificTools.join(', ')}`);
  }

  return `Tool filtering active: ${enabledTools}/${totalTools} tools (${percentage}%) - ${parts.join(' + ')}`;
}

/**
 * Initialize tool filtering from environment variables
 */
export function initializeToolFilter(): ToolFilterConfig {
  const filterString = process.env.RAILWAY_TOOLS_FILTER;
  const config = parseToolFilter(filterString);
  
  // Log filter status
  console.error(getFilterStats(config));
  
  return config;
}

/**
 * Get example filter configurations for documentation
 */
export function getFilterExamples(): Record<string, string> {
  return {
    'Basic users': 'simple',
    'Developers': 'intermediate,deployment',
    'DevOps teams': 'pro',
    'Monitoring focus': 'monitoring,simple',
    'Data management': 'data,core',
    'Enterprise setup': 'enterprise,team',
    'Custom selection': 'project_list,service_create,deployment_info',
    'Mixed approach': 'simple,backup-restore,security-audit-logs'
  };
}

/**
 * Validate filter configuration and provide helpful error messages
 */
export function validateFilterConfig(filterString: string): { valid: boolean; errors: string[]; suggestions: string[] } {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  if (!filterString.trim()) {
    return { valid: true, errors: [], suggestions: ['Empty filter disables filtering (all tools enabled)'] };
  }

  const items = filterString.split(',').map(item => item.trim()).filter(Boolean);
  let hasValidItems = false;

  for (const item of items) {
    if (isValidCategory(item) || isValidTool(item)) {
      hasValidItems = true;
    } else {
      errors.push(`Invalid category or tool: "${item}"`);
      
      // Suggest similar categories
      const availableCategories = Object.keys(CATEGORY_PRESETS);
      const similarCategory = availableCategories.find(cat => 
        cat.toLowerCase().includes(item.toLowerCase()) || 
        item.toLowerCase().includes(cat.toLowerCase())
      );
      
      if (similarCategory) {
        suggestions.push(`Did you mean "${similarCategory}"?`);
      }
    }
  }

  if (!hasValidItems) {
    errors.push('No valid categories or tools found');
    suggestions.push('Available categories: ' + Object.keys(CATEGORY_PRESETS).join(', '));
  }

  return {
    valid: hasValidItems,
    errors,
    suggestions
  };
}