import { GraphQLResponse } from '@/types.js';

export class BaseApiClient {
  protected readonly apiUrl = 'https://backboard.railway.app/graphql/v2';
  protected readonly wsUrl = 'wss://backboard.railway.app/graphql/v2';
  protected token: string | null = null;

  protected constructor() {
    console.error('BaseApiClient initialized');
  }

  getToken(): string | null {
    return this.token;
  }

  async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    if (!this.token) {
      console.error('No token available for request. Environment token exists:', !!process.env.RAILWAY_API_TOKEN);
      throw new Error('API token not set. Please either:\n1. Add RAILWAY_API_TOKEN to your environment variables, or\n2. Use the configure tool to set the token manually.');
    }

    const debug = process.env.DEBUG;
    const isDebug = debug === 'railway:*' || debug?.includes('railway:api');

    if (isDebug) {
      console.error('GraphQL Request initiated');
    }

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json() as GraphQLResponse<T>;

    if (isDebug) {
      console.error('GraphQL Response received');
    }

    if (result.errors && result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }

    return result.data as T;
  }
} 