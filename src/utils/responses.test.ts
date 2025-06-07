import { formatError } from './responses.js';

describe('formatError', () => {
  describe('Error sanitization', () => {
    it('should redact file paths', () => {
      const error = new Error('Failed to read /home/user/secrets.txt');
      const result = formatError(error);
      expect(result).toBe('Failed to read [PATH]');
    });

    it('should redact potential API tokens/keys', () => {
      const error = new Error('Invalid token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
      const result = formatError(error);
      expect(result).toBe('Invalid token: [REDACTED]');
    });

    it('should redact Bearer tokens', () => {
      const error = new Error('Authentication failed with Bearer sk-1234567890abcdef');
      const result = formatError(error);
      expect(result).toBe('Authentication failed with Bearer [REDACTED]');
    });

    it('should redact token values', () => {
      const error = new Error('API token: railway_token_12345');
      const result = formatError(error);
      expect(result).toBe('API token: [REDACTED]');
    });

    it('should redact key values', () => {
      const error = new Error('API key: sk-1234567890');
      const result = formatError(error);
      expect(result).toBe('API key: [REDACTED]');
    });

    it('should redact password values', () => {
      const error = new Error('Database password: super_secret_pass');
      const result = formatError(error);
      expect(result).toBe('Database password: [REDACTED]');
    });

    it('should handle multiple sensitive patterns in one message', () => {
      const error = new Error('Failed at /home/user/app with token: abc123def456 and key: secret789');
      const result = formatError(error);
      expect(result).toBe('Failed at [PATH] with token: [REDACTED] and key: [REDACTED]');
    });

    it('should handle case-insensitive token patterns', () => {
      const error = new Error('TOKEN: abc123 and Key: def456');
      const result = formatError(error);
      expect(result).toBe('TOKEN: [REDACTED] and Key: [REDACTED]');
    });

    it('should preserve safe error messages', () => {
      const error = new Error('Project not found');
      const result = formatError(error);
      expect(result).toBe('Project not found');
    });

    it('should handle complex file paths', () => {
      const error = new Error('Cannot access /var/log/railway/secrets/config.json');
      const result = formatError(error);
      expect(result).toBe('Cannot access [PATH]');
    });
  });

  describe('Non-Error inputs', () => {
    it('should handle string inputs safely', () => {
      const result = formatError('Simple error message');
      expect(result).toBe('An unknown error occurred');
    });

    it('should handle null/undefined inputs', () => {
      expect(formatError(null)).toBe('An unknown error occurred');
      expect(formatError(undefined)).toBe('An unknown error occurred');
    });

    it('should handle object inputs', () => {
      const result = formatError({ message: 'Custom error' });
      expect(result).toBe('An unknown error occurred');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty error messages', () => {
      const error = new Error('');
      const result = formatError(error);
      expect(result).toBe('');
    });

    it('should handle very long tokens', () => {
      const longToken = 'a'.repeat(100);
      const error = new Error(`Token: ${longToken}`);
      const result = formatError(error);
      expect(result).toBe('Token: [REDACTED]');
    });

    it('should not over-redact normal words', () => {
      const error = new Error('The pathway to success requires dedication');
      const result = formatError(error);
      expect(result).toBe('The pathway to success requires dedication');
    });
  });
});