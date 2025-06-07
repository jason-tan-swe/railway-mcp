# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies
npm install

# Build the project (TypeScript to JavaScript)
npm run build

# Run development server with MCP Inspector
npm run dev

# Start the built server
npm start

# Manual testing with piped JSON
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"project-list","arguments":{}},"id":1}' | node build/index.js

# Enable debug logging
DEBUG=railway:* npm start
```

## Architecture Overview

This is a Model Context Protocol (MCP) server for Railway infrastructure management, built with a three-layer architecture:

1. **Tools Layer** (`src/tools/`) - MCP tool definitions with Zod schemas for parameter validation
2. **Services Layer** (`src/services/`) - Business logic and response formatting
3. **Repository Layer** (`src/api/repository/`) - GraphQL API interactions with Railway

### Key Patterns

- **Singleton API Client**: `ApiClient` in `src/api/api-client.ts` manages authentication and GraphQL requests
- **Consistent Error Handling**: Use `formatError()` from `src/utils/responses.ts` for all error responses
- **Type Safety**: All tool parameters validated with Zod schemas, GraphQL responses typed in `src/types.ts`

### Adding New Tools

1. Create tool definition in `src/tools/[domain].tool.ts` with Zod schema
2. Implement service logic in `src/services/[domain].service.ts`
3. Add repository methods in `src/api/repository/[domain].repo.ts` if needed
4. Export from respective index files

## Railway API Integration

- Uses Railway's GraphQL API (endpoint: `https://backboard.railway.com/graphql/v2`)
- Authentication via Bearer token (environment variable or runtime configuration)
- All GraphQL queries/mutations stored in repository files
- Response types defined in `src/types.ts`

## Testing MCP Tools

When developing or testing MCP tools:

1. Build first: `npm run build`
2. Test with piped JSON:
   ```bash
   echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"tool-name","arguments":{"param":"value"}},"id":1}' | node build/index.js
   ```
3. Use MCP Inspector for interactive testing: `npm run dev`

## Important Notes

- Node.js 18+ required (uses native fetch API)
- Railway API token must be configured via `RAILWAY_API_TOKEN` env var or `configure` tool
- All async operations should use try-catch with formatted error responses
- Follow existing patterns for consistency when adding new features
- **Security Note**: API tokens are logged to console.error for local debugging. This is acceptable for a locally-run MCP server but be careful not to share logs publicly