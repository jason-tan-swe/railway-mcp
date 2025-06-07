import { z } from 'zod';
import { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';

export type ToolType = 'API' | 'WORKFLOW' | 'COMPOSITE' | 'QUERY' | 'UTILITY';

export type Tool<T extends z.ZodRawShape = z.ZodRawShape> = [
  string,
  string,
  T,
  ToolCallback<T>
];

export function createTool<T extends z.ZodRawShape>(
  name: string,
  description: string,
  schema: T,
  handler: ToolCallback<T>
): Tool<T> {
  return [
    name,
    description,
    schema,
    handler
  ] as const;
} 
export interface ToolRelations {
  prerequisites?: string[];
  alternatives?: string[];
  nextSteps?: string[];
  related?: string[];
}

export const formatToolDescription = ({
  type,
  description,
  bestFor = [],
  notFor = [],
  relations = {},
}: {
  type: ToolType;
  description: string;
  bestFor?: string[];
  notFor?: string[];
  relations?: ToolRelations;
}) => {
  const sections = [
    `[${type}] ${description}`,
    
    // Best For section
    bestFor.length > 0 && [
      '⚡️ Best for:',
      ...bestFor.map(b => `  ✓ ${b}`)
    ].join('\n'),
    
    // Not For section
    notFor.length > 0 && [
      '⚠️ Not for:',
      ...notFor.map(n => `  × ${n}`)
    ].join('\n'),
    
    // Prerequisites section
    (relations?.prerequisites?.length ?? 0) > 0 &&
      `→ Prerequisites: ${relations?.prerequisites?.join(', ')}`,
    
    // Alternatives section
    (relations?.alternatives?.length ?? 0) > 0 &&
      `→ Alternatives: ${relations?.alternatives?.join(', ')}`,
    
    // Next Steps section
    (relations?.nextSteps?.length ?? 0) > 0 &&
      `→ Next steps: ${relations?.nextSteps?.join(', ')}`,
    
    // Related section
    (relations?.related?.length ?? 0) > 0 &&
      `→ Related: ${relations?.related?.join(', ')}`
  ];

  // Filter out falsy values and join with newlines
  return sections.filter(Boolean).join('\n\n');
};