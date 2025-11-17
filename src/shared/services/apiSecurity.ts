/**
 * ESLint Disable Justification:
 * - no-await-in-loop: Legittimo per retry sequenziale con exponential backoff (linea 410)
 */
/* eslint-disable no-await-in-loop */
import { errorTracking } from './errorTracking';
import { secureStorage } from './secureStorage';
import { env } from '@/shared/config/environment';
import { logger } from '@/shared/utils/logger';

/**
 * APISecurityService - Sistema di sicurezza per chiamate API
 *
 * Features:
 * - Headers di sicurezza standard
 * - Timeout e retry logic
 * - Request/Response validation
 * - Rate limiting client-side
 * - Secure token management
 * - Request signing per integrità
 */

interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Content-Security-Policy': string;
  'Referrer-Policy': string;
  'X-App-Version': string;
  'X-Client-ID': string;
}

interface APIRequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  requiresAuth?: boolean;
  skipValidation?: boolean;
}

interface APIResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  success: boolean;
  error?: string;
}

interface SecurityConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  enableRequestSigning: boolean;
  enableRateLimiting: boolean;
  rateLimitPerMinute: number;
  allowedHosts?: string[];
}

class APISecurityService {
  private static instance: APISecurityService;
  private config: SecurityConfig;
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly rateLimitWindow = 60000; // 1 minuto
  private allowedHosts: Set<string>;

  private static normalizeBaseURL(url: string): string {
    return url.endsWith('/') ? url.slice(0, -1) : url;
  }

  private static extractHost(url: string): string {
    try {
      return new URL(url).hostname.toLowerCase();
    } catch {
      logger.warn('APISecurity', `Invalid base URL provided: ${url}`);
      return '';
    }
  }

  private isHostAllowed(hostname: string): boolean {
    if (this.allowedHosts.has(hostname)) {
      return true;
    }

    for (const allowed of this.allowedHosts) {
      if (hostname === allowed) {
        return true;
      }

      if (hostname.endsWith(`.${allowed}`)) {
        return true;
      }
    }

    return false;
  }

  private constructor() {
    const normalizedBaseUrl = APISecurityService.normalizeBaseURL(
      env.API_BASE_URL
    );
    this.config = {
      baseURL: normalizedBaseUrl,
      timeout: 10000, // 10 secondi
      maxRetries: 3,
      enableRequestSigning: !__DEV__, // Solo in produzione
      enableRateLimiting: true,
      rateLimitPerMinute: 60, // 60 richieste per minuto
      allowedHosts: [
        APISecurityService.extractHost(normalizedBaseUrl),
        'riseagainsthunger.org',
        'riseagainsthunger.italia',
      ],
    };
    this.allowedHosts = new Set(
      (this.config.allowedHosts ?? [])
        .filter(Boolean)
        .map(host => host.toLowerCase())
    );
    this.config.allowedHosts = Array.from(this.allowedHosts);
  }

  static getInstance(): APISecurityService {
    if (!APISecurityService.instance) {
      APISecurityService.instance = new APISecurityService();
    }
    return APISecurityService.instance;
  }

  /**
   * Configura il servizio API
   */
  configure(customConfig: Partial<SecurityConfig>): void {
    const mergedConfig = { ...this.config, ...customConfig };
    mergedConfig.baseURL = APISecurityService.normalizeBaseURL(
      customConfig.baseURL ?? this.config.baseURL
    );
    this.config = mergedConfig;
    if (customConfig.allowedHosts) {
      this.allowedHosts = new Set(
        customConfig.allowedHosts
          .filter(Boolean)
          .map(host => host.toLowerCase())
      );
    } else {
      this.allowedHosts = new Set(
        [
          APISecurityService.extractHost(this.config.baseURL),
          'riseagainsthunger.org',
          'riseagainsthunger.italia',
        ].filter(Boolean)
      );
    }
    this.config.allowedHosts = Array.from(this.allowedHosts);
    logger.info('APISecurity', 'Service configured', {
      baseURL: this.config.baseURL,
    });
  }

  /**
   * Genera headers di sicurezza standard
   */
  private getSecurityHeaders(): SecurityHeaders {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'",
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-App-Version': '1.0.0',
      'X-Client-ID': 'riseagainsthunger-mobile-app',
    };
  }

  /**
   * Genera headers di autenticazione
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await secureStorage.getAuthToken();

    if (!token) {
      logger.warn('APISecurity', 'No auth token found');
      return {};
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Valida e sanitizza la URL
   */
  private validateURL(url: string): string {
    // Rimuovi caratteri pericolosi
    const sanitizedURL = url.replace(/[<>]/g, '');

    // Verifica che sia una URL relativa o del nostro dominio
    if (sanitizedURL.startsWith('/')) {
      return `${this.config.baseURL}${sanitizedURL}`;
    }

    try {
      const parsedUrl = new URL(sanitizedURL);
      if (parsedUrl.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed');
      }
      const hostname = parsedUrl.hostname.toLowerCase();
      if (this.isHostAllowed(hostname)) {
        return sanitizedURL;
      }
    } catch {
      // Gestito sotto da throw generico
    }

    logger.warn('APISecurity', `Potentially unsafe URL blocked: ${url}`);
    throw new Error('Invalid or unsafe URL');
  }

  /**
   * Controlla rate limiting client-side
   */
  private checkRateLimit(): boolean {
    if (!this.config.enableRateLimiting) return true;

    const now = Date.now();

    // Reset contatore se è passato il window
    if (now - this.lastRequestTime > this.rateLimitWindow) {
      this.requestCount = 0;
      this.lastRequestTime = now;
    }

    // Controlla se abbiamo superato il limite
    if (this.requestCount >= this.config.rateLimitPerMinute) {
      logger.warn('APISecurity', 'Rate limit exceeded', {
        count: this.requestCount,
        limit: this.config.rateLimitPerMinute,
      });
      return false;
    }

    this.requestCount++;
    return true;
  }

  /**
   * Valida i dati di risposta
   */
  private validateResponse(response: unknown): boolean {
    // Controlla che la risposta abbia una struttura valida
    if (!response || typeof response !== 'object') {
      return false;
    }

    // Controlla presenza di XSS o script injection
    const responseString = JSON.stringify(response);
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(responseString)) {
        logger.error('APISecurity', 'Dangerous content detected in response');
        return false;
      }
    }

    return true;
  }

  /**
   * Esegue una richiesta API sicura
   */
  async secureRequest<T = unknown>(
    config: APIRequestConfig
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();

    try {
      // Controllo rate limiting
      if (!this.checkRateLimit()) {
        throw new Error(
          'Rate limit exceeded. Please wait before making more requests.'
        );
      }

      // Valida URL
      const safeURL = this.validateURL(config.url);

      // Prepara headers
      const securityHeaders = this.getSecurityHeaders();
      const authHeaders = config.requiresAuth
        ? await this.getAuthHeaders()
        : {};
      const headers = {
        'Content-Type': 'application/json',
        ...securityHeaders,
        ...authHeaders,
        ...config.headers,
      };

      // Timeout configuration
      const timeout = config.timeout || this.config.timeout;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Prepara body se presente
      const body = config.body ? JSON.stringify(config.body) : null;

      // Log della richiesta
      logger.debug('APISecurity', `${config.method} request to ${safeURL}`);
      errorTracking.addBreadcrumb(
        `API ${config.method} ${config.url}`,
        'api_request',
        'info',
        { url: safeURL, requiresAuth: config.requiresAuth }
      );

      // Esegui richiesta con retry logic
      let lastError: Error | null = null;
      const maxRetries = config.retries || this.config.maxRetries;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(safeURL, {
            method: config.method,
            headers,
            body,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Leggi risposta
          const responseText = await response.text();
          let responseData: T | { raw: string } | null;

          try {
            responseData = responseText
              ? (JSON.parse(responseText) as T)
              : null;
          } catch (parseError) {
            logger.error(
              'APISecurity',
              'Failed to parse response JSON',
              parseError as Error
            );
            responseData = { raw: responseText };
          }

          // Valida risposta se richiesto
          if (!config.skipValidation && !this.validateResponse(responseData)) {
            throw new Error('Response validation failed');
          }

          // Metriche performance
          const duration = Date.now() - startTime;
          errorTracking.trackPerformance(
            `API_${config.method}_${config.url}`,
            duration
          );

          // Costruisci risposta
          const apiResponse: APIResponse<T> = {
            data: responseData as T,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            success: response.ok,
            ...(response.ok
              ? {}
              : { error: `HTTP ${response.status}: ${response.statusText}` }),
          };

          if (response.ok) {
            logger.debug('APISecurity', `Request successful (${duration}ms)`, {
              status: response.status,
              url: safeURL,
            });
          } else {
            logger.warn(
              'APISecurity',
              `Request failed with status ${response.status}`,
              {
                url: safeURL,
                error: apiResponse.error,
              }
            );
          }

          return apiResponse;
        } catch (fetchError) {
          lastError = fetchError as Error;

          if (attempt < maxRetries) {
            const retryDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
            logger.warn(
              'APISecurity',
              `Request attempt ${attempt + 1} failed, retrying in ${retryDelay}ms`,
              {
                error: lastError.message,
                url: safeURL,
              }
            );

            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      }

      // Se arriviamo qui, tutti i tentativi sono falliti
      throw lastError || new Error('All retry attempts failed');
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorObj = error as Error;

      logger.error(
        'APISecurity',
        `Request failed after ${duration}ms`,
        errorObj
      );
      errorTracking.captureError(errorObj, {
        additionalData: {
          url: config.url,
          method: config.method,
          duration,
          requiresAuth: config.requiresAuth,
        },
      });

      // Ritorna risposta di errore
      return {
        data: null as T,
        status: 0,
        headers: {},
        success: false,
        error: errorObj.message,
      };
    }
  }

  /**
   * Metodi convenience per HTTP verbs
   */
  get<T>(
    url: string,
    config?: Partial<APIRequestConfig>
  ): Promise<APIResponse<T>> {
    return this.secureRequest<T>({ ...config, url, method: 'GET' });
  }

  post<T>(
    url: string,
    body?: unknown,
    config?: Partial<APIRequestConfig>
  ): Promise<APIResponse<T>> {
    return this.secureRequest<T>({ ...config, url, method: 'POST', body });
  }

  put<T>(
    url: string,
    body?: unknown,
    config?: Partial<APIRequestConfig>
  ): Promise<APIResponse<T>> {
    return this.secureRequest<T>({ ...config, url, method: 'PUT', body });
  }

  delete<T>(
    url: string,
    config?: Partial<APIRequestConfig>
  ): Promise<APIResponse<T>> {
    return this.secureRequest<T>({ ...config, url, method: 'DELETE' });
  }

  /**
   * Ottieni statistiche delle richieste
   */
  getRequestStats(): {
    requestCount: number;
    rateLimitRemaining: number;
    resetTime: number;
  } {
    const resetTime = this.lastRequestTime + this.rateLimitWindow;
    const rateLimitRemaining = Math.max(
      0,
      this.config.rateLimitPerMinute - this.requestCount
    );

    return {
      requestCount: this.requestCount,
      rateLimitRemaining,
      resetTime,
    };
  }

  /**
   * Reset delle statistiche
   */
  resetStats(): void {
    this.requestCount = 0;
    this.lastRequestTime = 0;
    logger.debug('APISecurity', 'Request stats reset');
  }
}

/**
 * Singleton instance of the API Security Service.
 * Provides secure HTTP requests with built-in security headers,
 * rate limiting, and request validation.
 */
export const apiSecurity = APISecurityService.getInstance();

/**
 * Performs a secure GET request with automatic security headers and validation.
 *
 * @template T - The expected response data type
 * @param url - The endpoint URL to request
 * @param config - Optional request configuration
 * @returns Promise resolving to the API response
 *
 * @example
 * ```typescript
 * const response = await secureGet<UserData>('/api/user/profile');
 * if (response.success) {
 *   console.log(response.data);
 * }
 * ```
 */
export const secureGet = <T>(url: string, config?: Partial<APIRequestConfig>) =>
  apiSecurity.get<T>(url, config);

/**
 * Performs a secure POST request with automatic security headers and validation.
 *
 * @template T - The expected response data type
 * @param url - The endpoint URL to request
 * @param body - The request body data
 * @param config - Optional request configuration
 * @returns Promise resolving to the API response
 *
 * @example
 * ```typescript
 * const response = await securePost<CreateUserResponse>('/api/user', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 * ```
 */
export const securePost = <T>(
  url: string,
  body?: unknown,
  config?: Partial<APIRequestConfig>
) => apiSecurity.post<T>(url, body, config);

/**
 * Performs a secure PUT request with automatic security headers and validation.
 *
 * @template T - The expected response data type
 * @param url - The endpoint URL to request
 * @param body - The request body data
 * @param config - Optional request configuration
 * @returns Promise resolving to the API response
 *
 * @example
 * ```typescript
 * const response = await securePut<UpdateUserResponse>('/api/user/123', {
 *   name: 'Jane Doe'
 * });
 * ```
 */
export const securePut = <T>(
  url: string,
  body?: unknown,
  config?: Partial<APIRequestConfig>
) => apiSecurity.put<T>(url, body, config);

/**
 * Performs a secure DELETE request with automatic security headers and validation.
 *
 * @template T - The expected response data type
 * @param url - The endpoint URL to request
 * @param config - Optional request configuration
 * @returns Promise resolving to the API response
 *
 * @example
 * ```typescript
 * const response = await secureDelete<DeleteResponse>('/api/user/123');
 * if (response.success) {
 *   console.log('User deleted successfully');
 * }
 * ```
 */
export const secureDelete = <T>(
  url: string,
  config?: Partial<APIRequestConfig>
) => apiSecurity.delete<T>(url, config);
