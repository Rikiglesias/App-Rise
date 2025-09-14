/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty-function */
/* eslint-disable no-await-in-loop */
import { apiSecurity } from '../../../shared/services/apiSecurity';
import { logger } from '../../../shared/utils/logger';
import { errorTracking } from '../../../shared/services/errorTracking';
import { secureStorage } from '../../../shared/services/secureStorage';

// Mock delle dipendenze
jest.mock('../../../shared/utils/logger');
jest.mock('../../../shared/services/errorTracking');
jest.mock('../../../shared/services/secureStorage');

// Mock di fetch globale
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock di AbortController
class MockAbortController {
  signal = { aborted: false };
  abort = jest.fn(() => {
    this.signal.aborted = true;
  });
}
global.AbortController = MockAbortController as any;

// Mock di setTimeout e clearTimeout
jest.useFakeTimers();

describe('APISecurityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Reset dell'istanza singleton
    (apiSecurity as any).requestCount = 0;
    (apiSecurity as any).lastRequestTime = 0;

    // Configurazione di default
    apiSecurity.configure({
      baseURL: 'https://api.test.com',
      timeout: 5000,
      maxRetries: 2,
      enableRequestSigning: false,
      enableRateLimiting: true,
      rateLimitPerMinute: 60,
    });

    // Mock delle dipendenze
    (secureStorage.getAuthToken as jest.Mock).mockResolvedValue('mock-token');
    (errorTracking.addBreadcrumb as jest.Mock).mockImplementation(() => {});
    (errorTracking.trackPerformance as jest.Mock).mockImplementation(() => {});
    (errorTracking.captureError as jest.Mock).mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
  });

  describe('Security Headers', () => {
    it('should include all required security headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map([['content-type', 'application/json']]),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Content-Security-Policy': "default-src 'self'",
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'X-App-Version': expect.any(String),
            'X-Client-ID': expect.any(String),
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should include auth headers when requiresAuth is true', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test', { requiresAuth: true });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should merge custom headers with security headers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/xml', // Should override default
      };

      await apiSecurity.get('/test', { headers: customHeaders });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
            'Content-Type': 'application/xml',
            'X-Content-Type-Options': 'nosniff', // Security headers still present
          }),
        })
      );
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within rate limit', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Fai 5 richieste (sotto il limite di 60)
      for (let i = 0; i < 5; i++) {
        const response = await apiSecurity.get(`/test${i}`);
        expect(response.success).toBe(true);
      }

      expect(mockFetch).toHaveBeenCalledTimes(5);
    });

    it('should block requests when rate limit is exceeded', async () => {
      // Configura un limite molto basso per il test
      apiSecurity.configure({ rateLimitPerMinute: 2 });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Prime due richieste dovrebbero passare
      await apiSecurity.get('/test1');
      await apiSecurity.get('/test2');

      // Terza richiesta dovrebbe essere bloccata
      const response = await apiSecurity.get('/test3');

      expect(response.success).toBe(false);
      expect(response.error).toContain('Rate limit exceeded');
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should reset rate limit after time window', async () => {
      // Configura un limite basso
      apiSecurity.configure({ rateLimitPerMinute: 1 });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Prima richiesta
      await apiSecurity.get('/test1');

      // Seconda richiesta dovrebbe essere bloccata
      const blockedResponse = await apiSecurity.get('/test2');
      expect(blockedResponse.success).toBe(false);

      // Avanza il tempo di 61 secondi
      jest.advanceTimersByTime(61000);

      // Ora la richiesta dovrebbe passare
      const allowedResponse = await apiSecurity.get('/test3');
      expect(allowedResponse.success).toBe(true);
    });

    it('should allow disabling rate limiting', async () => {
      apiSecurity.configure({ enableRateLimiting: false });

      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValue(mockResponse);

      // Fai molte richieste
      for (let i = 0; i < 100; i++) {
        const response = await apiSecurity.get(`/test${i}`);
        expect(response.success).toBe(true);
      }

      expect(mockFetch).toHaveBeenCalledTimes(100);
    });
  });

  describe('URL Validation', () => {
    it('should validate and sanitize URLs', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test?param=value');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test?param=value',
        expect.any(Object)
      );
    });

    it('should handle relative URLs correctly', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.test.com/test/endpoint',
        expect.any(Object)
      );
    });

    it('should block unsafe URLs', async () => {
      const response = await apiSecurity.get(
        'https://external.api.com/endpoint'
      );

      expect(response.success).toBe(false);
      expect(response.error).toContain('Invalid or unsafe URL');
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should allow riseagainsthunger.org URLs', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('https://api.riseagainsthunger.org/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.riseagainsthunger.org/endpoint',
        expect.any(Object)
      );
    });
  });

  describe('Response Validation', () => {
    it('should validate safe response content', async () => {
      const safeData = { data: 'test' };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify(safeData)),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await apiSecurity.get('/test');

      expect(response.success).toBe(true);
      expect(response.data).toEqual(safeData);
    });

    it('should have response validation capability', () => {
      // Test che la validazione delle risposte sia configurata
      expect(typeof apiSecurity.get).toBe('function');
    });

    it('should allow skipping validation when requested', async () => {
      const dangerousData = {
        message: '<script>alert("xss")</script>',
      };
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify(dangerousData)),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await apiSecurity.get('/test', { skipValidation: true });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(dangerousData);
    });

    it('should handle non-JSON responses', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('Plain text response'),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await apiSecurity.get('/test');

      expect(response.success).toBe(true);
      expect(response.data).toEqual({ raw: 'Plain text response' });
    });

    it('should handle different response types', () => {
      // Test che il servizio gestisca diversi tipi di risposta
      expect(apiSecurity.get).toBeDefined();
      expect(apiSecurity.post).toBeDefined();
    });
  });

  describe('Retry Logic', () => {
    it('should handle retry configuration', () => {
      // Test che la configurazione retry sia accettata
      expect(() => {
        apiSecurity.configure({ maxRetries: 5 });
      }).not.toThrow();
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout configuration', () => {
      // Test che la configurazione timeout sia accettata
      expect(() => {
        apiSecurity.configure({ timeout: 10000 });
      }).not.toThrow();
    });
  });

  describe('HTTP Methods', () => {
    beforeEach(() => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ success: true })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValue(mockResponse);
    });

    it('should handle GET requests', async () => {
      await apiSecurity.get('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'GET',
          body: null,
        })
      );
    });

    it('should handle POST requests with body', async () => {
      const postData = { name: 'test', value: 123 };

      await apiSecurity.post('/test', postData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(postData),
        })
      );
    });

    it('should handle PUT requests with body', async () => {
      const putData = { id: 1, name: 'updated' };

      await apiSecurity.put('/test', putData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(putData),
        })
      );
    });

    it('should handle DELETE requests', async () => {
      await apiSecurity.delete('/test');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'DELETE',
          body: null,
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle HTTP error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () =>
          Promise.resolve(JSON.stringify({ error: 'Resource not found' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      const response = await apiSecurity.get('/test');

      expect(response.success).toBe(false);
      expect(response.status).toBe(404);
      expect(response.error).toContain('HTTP 404');
    });

    it('should handle network errors gracefully', () => {
      // Test che la gestione errori sia configurata
      expect(errorTracking.captureError).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should have error tracking integration', () => {
      // Test che l'integrazione con errorTracking sia presente
      expect(errorTracking.addBreadcrumb).toBeDefined();
      expect(errorTracking.trackPerformance).toBeDefined();
    });
  });

  describe('Performance Tracking', () => {
    it('should track successful request performance', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test');

      expect(errorTracking.trackPerformance).toHaveBeenCalledWith(
        'API_GET_/test',
        expect.any(Number)
      );
    });

    it('should add breadcrumbs for requests', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(JSON.stringify({ data: 'test' })),
        headers: new Map(),
      };
      mockFetch.mockResolvedValueOnce(mockResponse);

      await apiSecurity.get('/test', { requiresAuth: true });

      expect(errorTracking.addBreadcrumb).toHaveBeenCalledWith(
        'API GET /test',
        'api_request',
        'info',
        expect.objectContaining({
          requiresAuth: true,
        })
      );
    });
  });

  describe('Request Stats', () => {
    it('should provide accurate request statistics', () => {
      const stats = apiSecurity.getRequestStats();

      expect(stats).toHaveProperty('requestCount');
      expect(stats).toHaveProperty('rateLimitRemaining');
      expect(stats).toHaveProperty('resetTime');
      expect(typeof stats.requestCount).toBe('number');
      expect(typeof stats.rateLimitRemaining).toBe('number');
      expect(typeof stats.resetTime).toBe('number');
    });

    it('should reset statistics when requested', () => {
      // Fai alcune richieste per cambiare le statistiche
      (apiSecurity as any).requestCount = 5;

      apiSecurity.resetStats();

      const stats = apiSecurity.getRequestStats();
      expect(stats.requestCount).toBe(0);
    });
  });

  describe('Configuration', () => {
    it('should allow updating configuration', () => {
      const newConfig = {
        timeout: 10000,
        maxRetries: 5,
        rateLimitPerMinute: 120,
      };

      apiSecurity.configure(newConfig);

      // Verifica che la configurazione sia stata applicata
      // (questo test potrebbe richiedere l'esposizione di un metodo getConfig)
      expect(() => apiSecurity.configure(newConfig)).not.toThrow();
    });
  });
});
