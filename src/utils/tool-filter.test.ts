import { 
  parseToolFilter, 
  shouldIncludeTool, 
  getFilterStats, 
  validateFilterConfig,
  getFilterExamples 
} from './tool-filter.js';

describe('Tool Filter', () => {
  describe('parseToolFilter', () => {
    it('should return all tools when no filter is provided', () => {
      const config = parseToolFilter();
      expect(config.enabled).toBe(false);
      expect(config.categories).toEqual([]);
      expect(config.specificTools).toEqual([]);
      expect(config.filteredTools.size).toBeGreaterThan(0);
    });

    it('should return all tools when empty filter is provided', () => {
      const config = parseToolFilter('');
      expect(config.enabled).toBe(false);
      expect(config.categories).toEqual([]);
      expect(config.specificTools).toEqual([]);
    });

    it('should parse single category correctly', () => {
      const config = parseToolFilter('simple');
      expect(config.enabled).toBe(true);
      expect(config.categories).toEqual(['simple']);
      expect(config.specificTools).toEqual([]);
      expect(config.filteredTools.has('project_list')).toBe(true);
    });

    it('should parse multiple categories correctly', () => {
      const config = parseToolFilter('simple,deployment');
      expect(config.enabled).toBe(true);
      expect(config.categories).toContain('simple');
      expect(config.categories).toContain('deployment');
      expect(config.specificTools).toEqual([]);
    });

    it('should parse specific tools correctly', () => {
      const config = parseToolFilter('project_list,service_create_from_repo');
      expect(config.enabled).toBe(true);
      expect(config.categories).toEqual([]);
      expect(config.specificTools).toContain('project_list');
      expect(config.specificTools).toContain('service_create_from_repo');
      expect(config.filteredTools.has('project_list')).toBe(true);
      expect(config.filteredTools.has('service_create_from_repo')).toBe(true);
    });

    it('should parse mixed categories and tools correctly', () => {
      const config = parseToolFilter('simple,project_delete');
      expect(config.enabled).toBe(true);
      expect(config.categories).toContain('simple');
      expect(config.specificTools).toContain('project_delete');
      expect(config.filteredTools.has('project_list')).toBe(true); // from simple
      expect(config.filteredTools.has('project_delete')).toBe(true); // specific tool
    });

    it('should handle invalid categories and tools gracefully', () => {
      const config = parseToolFilter('invalid_category,nonexistent_tool');
      expect(config.enabled).toBe(true);
      expect(config.categories).toEqual([]);
      expect(config.specificTools).toEqual([]);
      // Should fall back to all tools when no valid items found
      expect(config.filteredTools.size).toBeGreaterThan(100);
    });

    it('should handle whitespace and empty items', () => {
      const config = parseToolFilter(' simple , , deployment ');
      expect(config.enabled).toBe(true);
      expect(config.categories).toContain('simple');
      expect(config.categories).toContain('deployment');
      expect(config.categories.length).toBe(2);
    });
  });

  describe('shouldIncludeTool', () => {
    it('should include all tools when filtering is disabled', () => {
      const config = parseToolFilter();
      expect(shouldIncludeTool('project_list', config)).toBe(true);
      expect(shouldIncludeTool('nonexistent_tool', config)).toBe(true);
    });

    it('should only include filtered tools when filtering is enabled', () => {
      const config = parseToolFilter('project_list,service_info');
      expect(shouldIncludeTool('project_list', config)).toBe(true);
      expect(shouldIncludeTool('service_info', config)).toBe(true);
      expect(shouldIncludeTool('project_delete', config)).toBe(false);
    });

    it('should include tools from categories', () => {
      const config = parseToolFilter('simple');
      expect(shouldIncludeTool('project_list', config)).toBe(true);
      expect(shouldIncludeTool('service_list', config)).toBe(true);
      // Pro-level tool should not be included in simple category
      expect(shouldIncludeTool('project_delete_batch', config)).toBe(false);
    });
  });

  describe('getFilterStats', () => {
    it('should return correct stats for disabled filtering', () => {
      const config = parseToolFilter();
      const stats = getFilterStats(config);
      expect(stats).toContain('No tool filtering active');
    });

    it('should return correct stats for category filtering', () => {
      const config = parseToolFilter('simple');
      const stats = getFilterStats(config);
      expect(stats).toContain('Tool filtering active');
      expect(stats).toContain('categories: simple');
    });

    it('should return correct stats for specific tool filtering', () => {
      const config = parseToolFilter('project_list,service_info');
      const stats = getFilterStats(config);
      expect(stats).toContain('Tool filtering active');
      expect(stats).toContain('tools: project_list, service_info');
    });

    it('should return correct stats for mixed filtering', () => {
      const config = parseToolFilter('simple,project_delete');
      const stats = getFilterStats(config);
      expect(stats).toContain('Tool filtering active');
      expect(stats).toContain('categories: simple');
      expect(stats).toContain('tools: project_delete');
    });
  });

  describe('validateFilterConfig', () => {
    it('should validate empty filter as valid', () => {
      const result = validateFilterConfig('');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
      expect(result.suggestions.length).toBeGreaterThan(0);
    });

    it('should validate correct categories as valid', () => {
      const result = validateFilterConfig('simple,deployment');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate correct tools as valid', () => {
      const result = validateFilterConfig('project_list,service_info');
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should identify invalid categories and tools', () => {
      const result = validateFilterConfig('invalid_category,nonexistent_tool');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBe(3); // 2 invalid items + no valid items found
      expect(result.errors[0]).toContain('Invalid category or tool: "invalid_category"');
      expect(result.errors[1]).toContain('Invalid category or tool: "nonexistent_tool"');
    });

    it('should provide suggestions for similar categories', () => {
      const result = validateFilterConfig('simpl'); // Close to 'simple'
      expect(result.valid).toBe(false);
      expect(result.suggestions.some(s => s.includes('simple'))).toBe(true);
    });

    it('should handle mixed valid and invalid items', () => {
      const result = validateFilterConfig('simple,invalid_category');
      expect(result.valid).toBe(true); // Has at least one valid item
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Invalid category or tool: "invalid_category"');
    });
  });

  describe('getFilterExamples', () => {
    it('should return a non-empty object of examples', () => {
      const examples = getFilterExamples();
      expect(typeof examples).toBe('object');
      expect(Object.keys(examples).length).toBeGreaterThan(0);
    });

    it('should have meaningful example names and values', () => {
      const examples = getFilterExamples();
      expect(examples['Basic users']).toBeDefined();
      expect(examples['Developers']).toBeDefined();
      expect(examples['Enterprise setup']).toBeDefined();
    });
  });

  describe('Complex filtering scenarios', () => {
    it('should handle intermediate category correctly', () => {
      const config = parseToolFilter('intermediate');
      // Should include simple tools
      expect(config.filteredTools.has('project_list')).toBe(true);
      // Should include intermediate tools
      expect(config.filteredTools.has('project_create')).toBe(true);
      // Should not include pro-only tools
      expect(config.filteredTools.has('project_delete_batch')).toBe(false);
    });

    it('should handle pro category correctly', () => {
      const config = parseToolFilter('pro');
      // Should include all tools
      expect(config.filteredTools.has('project_list')).toBe(true);
      expect(config.filteredTools.has('project_create')).toBe(true);
      expect(config.filteredTools.has('project_delete_batch')).toBe(true);
    });

    it('should handle use case categories correctly', () => {
      const config = parseToolFilter('core');
      expect(config.filteredTools.has('project_list')).toBe(true);
      expect(config.filteredTools.has('service_list')).toBe(true);
      // Should not include tools that are only in other use cases
      expect(config.filteredTools.has('webhook-list')).toBe(false);
    });

    it('should deduplicate tools from multiple categories', () => {
      const config = parseToolFilter('simple,core');
      const toolsArray = Array.from(config.filteredTools);
      const uniqueTools = new Set(toolsArray);
      expect(toolsArray.length).toBe(uniqueTools.size);
    });
  });
});