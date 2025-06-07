import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export interface CommandResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  data?: unknown;
  isError?: boolean;
}

export function createSuccessResponse(response: { text: string; data?: unknown }): CallToolResult {
  return {
    content: [{
      type: 'text',
      text: response.text
    }],
    data: response.data
  };
}

export function createErrorResponse(message: string): CallToolResult {
  return {
    content: [{
      type: 'text',
      text: message
    }],
    isError: true
  };
}

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    // Sanitize error messages to avoid exposing sensitive information
    const message = error.message;
    
    // Remove potential file paths, API keys, and other sensitive data
    const sanitized = message
      .replace(/\/[^\s]+/g, '[PATH]') // Remove file paths
      .replace(/[A-Za-z0-9+\/=]{32,}/g, '[REDACTED]') // Remove potential tokens/keys
      .replace(/Bearer\s+[^\s]+/g, 'Bearer [REDACTED]') // Remove Bearer tokens
      .replace(/token[:\s]+[^\s]+/gi, 'token: [REDACTED]') // Remove token values
      .replace(/key[:\s]+[^\s]+/gi, 'key: [REDACTED]') // Remove key values
      .replace(/password[:\s]+[^\s]+/gi, 'password: [REDACTED]'); // Remove passwords
    
    return sanitized;
  }
  return 'An unknown error occurred';
} 