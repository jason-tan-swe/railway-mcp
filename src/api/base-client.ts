import { GraphQLResponse } from '@/types.js';

export class BaseApiClient {
  protected readonly apiUrl = 'https://backboard.railway.com/graphql/v2';
  protected readonly wsUrl = 'wss://backboard.railway.com/graphql/v2';
  protected token: string | null = null;

  protected constructor() {
    console.error('BaseApiClient initialized');
  }

  getToken(): string | null {
    return this.token;
  }

  protected async request<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    if (!this.token) {
      console.error('No token available for request. Environment token:', process.env.RAILWAY_API_TOKEN);
      throw new Error('API token not set. Please either:\n1. Add RAILWAY_API_TOKEN to your environment variables, or\n2. Use the configure tool to set the token manually.');
    }

    console.error('Query:', query);
    if (variables) {
      console.error('Variables:', JSON.stringify(variables, null, 2));
    }

    try {
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

      if (!response.ok) {
        const text = await response.text();
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Response text:', text);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as GraphQLResponse<T>;
      console.error('GraphQL Response:', JSON.stringify(result, null, 2));

      if (result.errors && result.errors.length > 0) {
        console.error('GraphQL Errors:', JSON.stringify(result.errors, null, 2));
        throw new Error(result.errors[0].message);
      }

      if (!result.data) {
        throw new Error('No data returned from API');
      }

      return result.data as T;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }
} 