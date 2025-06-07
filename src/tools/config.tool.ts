import { z } from 'zod';
import { createTool, formatToolDescription } from '@/utils/tools.js';
import { railwayClient } from '@/api/api-client.js';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses.js';

export const configTools = [
  createTool(
    "configure_api_token",
    formatToolDescription({
      type: 'UTILITY',
      description: "Configure the Railway API token for authentication (only needed if not set in environment variables)",
      bestFor: [
        "Initial setup",
        "Token updates",
        "Authentication configuration"
      ],
      notFor: [
        "Project configuration",
        "Service settings",
        "Environment variables"
      ],
      relations: {
        nextSteps: ["project_list", "service_list"],
        related: ["project_create"]
      }
    }),
    {
      token: z.string().describe("Railway API token (create one at https://railway.app/account/tokens)")
    },
    async ({ token }) => {
      try {
        await railwayClient.setToken(token);      
        return createSuccessResponse({
          text: "✅ Successfully connected to Railway API"
        });
      } catch (error) {
        return createErrorResponse(`❌ Failed to connect to Railway API: ${formatError(error)}`);
      }
    }
  )
];
