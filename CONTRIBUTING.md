# Contributing to Railway MCP Server

## Table of Contents

- [Introduction](#introduction)
  - [Why Contribute?](#why-contribute)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [First-time Setup](#first-time-setup)
  - [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Branch Strategy](#branch-strategy)
  - [Commit Messages](#commit-messages)
  - [TypeScript Guidelines](#typescript-guidelines)
  - [Testing Requirements](#testing-requirements)
- [Contribution Process](#contribution-process)
  - [Find or Create an Issue](#find-or-create-an-issue)
  - [Make Changes](#make-changes)
  - [Submit Changes](#submit-changes)
  - [Code Review](#code-review)
- [Debugging](#debugging)
  - [Development Debugging with MCP Inspector](#development-debugging-with-mcp-inspector)
  - [Production Debugging](#production-debugging)
- [Additional Resources](#additional-resources)
- [Example Implementations](#example-implementations)
  - [Tool Implementation](#1-tool-implementation-srctoolsexampletoolts)
  - [Service Implementation](#2-service-implementation-srcservicesexampleservicets)
  - [Repository Implementation](#3-repository-implementation-srcapirepositoryexamplerepots)

## Introduction

Railway MCP Server is a Model Context Protocol (MCP) server that enables AI agents to manage Railway.app infrastructure through natural language. Our goal is to make infrastructure management more accessible and efficient through AI-powered automation.

### Why Contribute?

Your contributions help make Railway infrastructure management more accessible to AI agents and their users. We welcome:
- Code contributions (new tools, API integrations)
- Documentation improvements
- Bug reports and fixes
- Feature requests and ideas
- Testing and feedback

## Getting Started

### Prerequisites

- Node.js 18+ (required for built-in fetch API)
- TypeScript 5.8+
- npm or yarn
- A Railway.app account and API token
- Basic understanding of GraphQL and MCP

### First-time Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/jason-tan-swe/railway-mcp.git
   cd railway-mcp
   npm install
   ```

2. **Verify Setup**
   ```bash
   npm run build
   npm run dev  # Starts the server with MCP Inspector
   ```

### Project Structure

```
src/
├── api/        # API-related code and GraphQL operations
├── services/   # Core business logic and service implementations
├── tools/      # MCP tool implementations
├── utils/      # Shared utilities and helper functions
├── types.ts    # TypeScript type definitions
└── index.ts    # Main entry point
```

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `test:` - Test-related changes

### TypeScript Guidelines

- Use strict type checking
- Avoid `any` types unless absolutely necessary
- Document complex types in `types.ts`
- Use interfaces for API responses and tool parameters

### Testing Requirements

1. Write tests for new tools and API integrations
2. Test error handling scenarios
3. Verify type safety
4. Test with MCP Inspector before submitting PRs

## Contribution Process

1. **Find or Create an Issue**
   - Check existing issues or create a new one
   - Get approval for new features before starting

2. **Make Changes**
   - Create a new branch: `git checkout -b feature/your-feature`
   - Follow code style and TypeScript guidelines
   - Add necessary tests
   - Update documentation

3. **Submit Changes**
   - Push to your fork: `git push origin feature/your-feature`
   - Create a pull request
   - Link related issues
   - Provide clear description of changes

4. **Code Review**
   - Address review feedback
   - Ensure CI checks pass
   - Keep commits clean and focused

## Debugging

### Development Debugging with MCP Inspector

The MCP Inspector is our primary development debugging tool. Learn more about it [here](https://modelcontextprotocol.io/docs/tools/inspector).

1. **Running the Inspector**
   ```bash
   npm run dev
   ```

2. **Key Features**
   - Server Connection monitoring
   - Tool testing interface
   - Real-time logs and notifications
   - Resource inspection

3. **Development Flow**
   1. Start Inspector with server
   2. Make code changes
   3. Auto-rebuild triggers
   4. Test in Inspector
   5. Monitor logs

4. **Testing with MCP Clients**

   To test your development server with MCP clients (like Claude for Desktop), you need to modify the client's configuration to point to your local development build:

   ```json
   {
     "mcpServers": {
       "railway": {
         "command": "node",
         "args": ["/YOUR/PATH/TO/railway-mcp/build/index.js"],
         "env": {
           "RAILWAY_API_TOKEN": "your-railway-token",
           "DEBUG": "railway:*"
         }
       }
     }
   }
   ```

   > **Important**: The key difference for development testing is using `node /YOUR/PATH/TO/railway-mcp/build/index.js` instead of the NPM package. This ensures your MCP client runs your local development build.
   
   Steps for development testing:
   1. Make your code changes
   2. Run `npm run build` to compile
   3. Your MCP client will use the newly built code
   
   While the exact configuration may vary by MCP client, the principle remains the same: point the client to your local `build/index.js` file instead of the published package.

### Production Debugging

To enable debug logging in production:

1. Configure your MCP client's environment:
   ```json
   {
     "mcpServers": {
       "railway": {
         "command": "npx",
         "args": ["-y", "@jasontanswe/railway-mcp"],
         "env": {
           "RAILWAY_API_TOKEN": "your-token",
           "DEBUG": "railway:*"
         }
       }
     }
   }
   ```

2. Available debug options:
   - `railway:*` - All debug logs
   - `railway:api` - API request/response logs
   - `railway:tools` - Tool execution logs

3. Monitor logs:
   ```bash
   tail -n 20 -F ~/Library/Logs/Claude/mcp-server-railway.log
   ```

## Additional Resources

- [Railway.app Documentation](https://docs.railway.app/)
- [MCP Specification](https://modelcontextprotocol.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)

## Example Implementations

Our codebase follows a three-layer architecture for implementing MCP tools:

1. **Tool Layer** (`tools/`) - Defines the tool interface and parameters
2. **Service Layer** (`services/`) - Implements business logic and handles responses
3. **Repository Layer** (`api/repository/`) - Manages GraphQL API interactions

Here's how these layers work together:

### 1. Tool Implementation (`src/tools/example.tool.ts`)

```typescript
import { z } from 'zod';
import { createTool, formatToolDescription } from '@/utils/tools';
import { exampleService } from '@/services/example.service';

export const exampleTools = [
  createTool(
    "example-action",
    formatToolDescription({
      type: 'API',
      description: "Description of what this tool does",
      bestFor: [
        "Use case 1",
        "Use case 2"
      ],
      notFor: [
        "Anti-pattern 1"
      ],
      relations: {
        prerequisites: ["required-tool"],
        alternatives: ["alternative-tool"],
        nextSteps: ["next-tool"],
        related: ["related-tool"]
      }
    }),
    {
      param1: z.string().describe("Description of parameter 1"),
      param2: z.number().optional().describe("Optional parameter 2"),
    },
    async ({ param1, param2 }) => {
      return exampleService.performAction(param1, param2);
    }
  )
];
```

### 2. Service Implementation (`src/services/example.service.ts`)

```typescript
import { BaseService } from '@/services/base.service';
import { createSuccessResponse, createErrorResponse, formatError } from '@/utils/responses';

export class ExampleService extends BaseService {
  async performAction(param1: string, param2?: number) {
    try {
      const result = await this.client.example.someAction(param1, param2);
      return createSuccessResponse({
        text: `Action completed: ${result}`,
        data: result
      });
    } catch (error) {
      return createErrorResponse(`Error: ${formatError(error)}`);
    }
  }
}

// Initialize and export the singleton instance
export const exampleService = new ExampleService();
```

### 3. Repository Implementation (`src/api/repository/example.repo.ts`)

```typescript
import { RailwayApiClient } from '@/api/api-client';
import { ExampleResponse } from '@/types';

export class ExampleRepository {
  constructor(private client: RailwayApiClient) {}

  async someAction(param1: string, param2?: number): Promise<ExampleResponse> {
    const query = `
      mutation exampleAction($param1: String!, $param2: Int) {
        exampleAction(input: { param1: $param1, param2: $param2 }) {
          id
          status
          result
        }
      }
    `;
    
    const data = await this.client.request<{ exampleAction: ExampleResponse }>(
      query,
      { param1, param2 }
    );

    return data.exampleAction;
  }
}
```

This architecture provides several benefits:
- Clear separation of concerns
- Type-safe interfaces between layers
- Centralized error handling
- Consistent response formatting
- Reusable business logic
- Isolated GraphQL operations

When adding new functionality:
1. Define the tool interface in a tool file
2. Implement business logic in a service
3. Add GraphQL operations in a repository
4. Update types in `types.ts` as needed
