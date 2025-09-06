/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import { logger } from '../utils/logger';

/**
 * ErrorTrackingService - Sistema di monitoraggio errori e crash
 *
 * Features:
 * - Tracking errori in tempo reale
 * - Crash reporting dettagliato
 * - Context e breadcrumbs per debugging
 * - Filtraggio intelligente errori
 * - Metriche di stabilità app
 */

interface ErrorContext {
  userId?: string;
  screen?: string;
  action?: string;
  additionalData?: Record<string, unknown>;
}

interface CrashReport {
  error: Error;
  context?: ErrorContext;
  timestamp: number;
  deviceInfo?: Record<string, unknown>;
  appVersion?: string;
}

interface ErrorTrackingConfig {
  enableInDevelopment: boolean;
  maxErrorsPerSession: number;
  enableAutomaticCrashReporting: boolean;
  enablePerformanceMonitoring: boolean;
}

class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private isInitialized = false;
  private config: ErrorTrackingConfig;
  private errorCount = 0;
  private sessionId: string;
  private crashReports: CrashReport[] = [];
  private readonly maxCrashReports = 10;

  private constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.config = {
      enableInDevelopment: true,
      maxErrorsPerSession: 50,
      enableAutomaticCrashReporting: true,
      enablePerformanceMonitoring: true,
    };
  }

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Inizializza il servizio di error tracking
   */
  initialize(customConfig?: Partial<ErrorTrackingConfig>): void {
    if (this.isInitialized) {
      logger.warn('ErrorTracking', 'Service already initialized');
      return;
    }

    this.config = { ...this.config, ...customConfig };
    this.isInitialized = true;

    // Setup global error handlers
    this.setupGlobalErrorHandlers();

    logger.info(
      'ErrorTracking',
      `Service initialized with session: ${this.sessionId}`
    );
  }

  /**
   * Configura handler globali per errori non gestiti
   */
  private setupGlobalErrorHandlers(): void {
    // Global error handler per errori JavaScript non gestiti
    const originalErrorHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      this.captureError(error, {
        additionalData: {
          isFatal: isFatal || false,
          source: 'GlobalErrorHandler',
        },
      });

      // Chiama l'handler originale per comportamento normale
      if (originalErrorHandler) {
        originalErrorHandler(error, isFatal);
      }
    });

    // Promise rejection handler
    const handleUnhandledPromiseRejection = (event: PromiseRejectionEvent) => {
      this.captureError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          additionalData: {
            source: 'UnhandledPromiseRejection',
            reason: event.reason,
          },
        }
      );
    };

    // Nota: In React Native, non esiste window.addEventListener
    // Questo handler funziona solo in ambiente web/testing
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener(
        'unhandledrejection',
        handleUnhandledPromiseRejection
      );
    }

    logger.debug('ErrorTracking', 'Global error handlers configured');
  }

  /**
   * Cattura e traccia un errore
   */
  captureError(error: Error, context?: ErrorContext): void {
    if (!this.isInitialized) {
      logger.warn(
        'ErrorTracking',
        'Service not initialized, cannot capture error'
      );
      return;
    }

    // Filtra errori di sviluppo se in produzione
    if (!__DEV__ && !this.config.enableInDevelopment) {
      return;
    }

    // Limite errori per sessione per evitare spam
    if (this.errorCount >= this.config.maxErrorsPerSession) {
      logger.warn('ErrorTracking', 'Max errors per session reached, skipping');
      return;
    }

    this.errorCount++;

    // Crea crash report
    const crashReport: CrashReport = {
      error,
      ...(context && { context }),
      timestamp: Date.now(),
      deviceInfo: this.getDeviceInfo(),
      appVersion: this.getAppVersion(),
    };

    // Salva crash report
    this.addCrashReport(crashReport);

    // Log l'errore
    logger.error('ErrorTracking', `Error captured: ${error.message}`, error);

    // Log context se presente
    if (context) {
      logger.debug('ErrorTracking', 'Error context', context);
    }
  }

  /**
   * Cattura un messaggio di errore custom
   */
  captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: ErrorContext
  ): void {
    if (!this.isInitialized) return;

    const syntheticError = new Error(message);
    syntheticError.name = 'CapturedMessage';

    this.captureError(syntheticError, {
      ...context,
      additionalData: {
        ...context?.additionalData,
        level,
        synthetic: true,
      },
    });
  }

  /**
   * Imposta informazioni utente per il tracking
   */
  setUser(user: { id: string; email?: string; name?: string }): void {
    if (!this.isInitialized) return;

    logger.debug('ErrorTracking', `User context set: ${user.id}`);
    // In una implementazione reale con Sentry/Crashlytics, imposteremmo qui l'utente
  }

  /**
   * Aggiunge un breadcrumb per il debugging
   */
  addBreadcrumb(
    message: string,
    category: string,
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, unknown>
  ): void {
    if (!this.isInitialized) return;

    const breadcrumb = {
      message,
      category,
      level,
      timestamp: Date.now(),
      data,
    };

    logger.debug(
      'ErrorTracking',
      `Breadcrumb: [${category}] ${message}`,
      breadcrumb
    );
  }

  /**
   * Traccia performance di operazioni critiche
   */
  trackPerformance(
    operationName: string,
    duration: number,
    additionalData?: Record<string, unknown>
  ): void {
    if (!this.isInitialized || !this.config.enablePerformanceMonitoring) return;

    const performanceData = {
      operation: operationName,
      duration,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...additionalData,
    };

    // Performance warning per operazioni lente
    if (duration > 1000) {
      // > 1 secondo
      logger.warn(
        'ErrorTracking',
        `Slow operation detected: ${operationName} (${duration}ms)`,
        performanceData
      );
    } else {
      logger.debug(
        'ErrorTracking',
        `Performance: ${operationName} (${duration}ms)`,
        performanceData
      );
    }
  }

  /**
   * Aggiunge un crash report alla lista
   */
  private addCrashReport(report: CrashReport): void {
    this.crashReports.push(report);

    // Mantieni solo gli ultimi N crash reports
    if (this.crashReports.length > this.maxCrashReports) {
      this.crashReports.shift();
    }
  }

  /**
   * Ottieni informazioni del device
   */
  private getDeviceInfo(): Record<string, unknown> {
    // In una implementazione reale, useremmo react-native-device-info
    return {
      platform: __DEV__ ? 'development' : 'production',
      // deviceId, osVersion, appVersion, etc.
    };
  }

  /**
   * Ottieni versione app
   */
  private getAppVersion(): string {
    // In una implementazione reale, otterremmo da app.json o Constants
    return '1.0.0';
  }

  /**
   * Ottieni statistiche degli errori per la sessione corrente
   */
  getErrorStats(): {
    sessionId: string;
    errorCount: number;
    crashReports: number;
    isHealthy: boolean;
  } {
    const isHealthy = this.errorCount < 5 && this.crashReports.length < 3;

    return {
      sessionId: this.sessionId,
      errorCount: this.errorCount,
      crashReports: this.crashReports.length,
      isHealthy,
    };
  }

  /**
   * Genera report dettagliato per debugging
   */
  generateDebugReport(): string {
    const stats = this.getErrorStats();
    const recentCrashes = this.crashReports.slice(-3);

    const report = [
      `=== ERROR TRACKING DEBUG REPORT ===`,
      `Session ID: ${stats.sessionId}`,
      `Error Count: ${stats.errorCount}`,
      `Crash Reports: ${stats.crashReports}`,
      `Health Status: ${stats.isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`,
      ``,
      `Recent Crashes:`,
      ...recentCrashes.map(
        (crash, index) =>
          `${index + 1}. ${crash.error.name}: ${crash.error.message} (${new Date(crash.timestamp).toISOString()})`
      ),
      ``,
      `Configuration:`,
      `- Development Mode: ${__DEV__}`,
      `- Auto Crash Reporting: ${this.config.enableAutomaticCrashReporting}`,
      `- Performance Monitoring: ${this.config.enablePerformanceMonitoring}`,
      `======================================`,
    ].join('\n');

    return report;
  }

  /**
   * Reset dello stato per nuova sessione
   */
  resetSession(): void {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.errorCount = 0;
    this.crashReports = [];

    logger.info('ErrorTracking', `Session reset: ${this.sessionId}`);
  }
}

/**
 * Singleton instance of the Error Tracking Service.
 * Provides comprehensive error tracking, crash reporting,
 * and performance monitoring capabilities.
 */
export const errorTracking = ErrorTrackingService.getInstance();

/**
 * Captures and reports an error with optional context information.
 *
 * @param error - The Error object to capture
 * @param context - Optional context information (user, screen, action, etc.)
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureError(error, {
 *     userId: 'user123',
 *     screen: 'ProfileScreen',
 *     action: 'updateProfile'
 *   });
 * }
 * ```
 */
export const captureError = (error: Error, context?: ErrorContext) =>
  errorTracking.captureError(error, context);

/**
 * Captures a custom message with specified severity level.
 *
 * @param message - The message to capture
 * @param level - Severity level: 'info', 'warning', or 'error'
 * @param context - Optional context information
 *
 * @example
 * ```typescript
 * captureMessage('User performed unusual action', 'warning', {
 *   userId: 'user123',
 *   action: 'bulkDelete'
 * });
 * ```
 */
export const captureMessage = (
  message: string,
  level?: 'info' | 'warning' | 'error',
  context?: ErrorContext
) => errorTracking.captureMessage(message, level, context);

/**
 * Adds a breadcrumb to track user actions leading up to errors.
 *
 * @param message - Description of the action
 * @param category - Category of the action (navigation, user, api, etc.)
 * @param level - Severity level of the breadcrumb
 * @param data - Additional data associated with the action
 *
 * @example
 * ```typescript
 * addBreadcrumb('User clicked donate button', 'user', 'info', {
 *   amount: 50,
 *   currency: 'EUR'
 * });
 * ```
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  level?: 'info' | 'warning' | 'error',
  data?: Record<string, unknown>
) => errorTracking.addBreadcrumb(message, category, level, data);

/**
 * Tracks performance metrics for operations and user interactions.
 *
 * @param operationName - Name of the operation being tracked
 * @param duration - Duration of the operation in milliseconds
 * @param additionalData - Additional performance-related data
 *
 * @example
 * ```typescript
 * const startTime = Date.now();
 * await loadUserData();
 * const duration = Date.now() - startTime;
 *
 * trackPerformance('loadUserData', duration, {
 *   cacheHit: false,
 *   dataSize: 1024
 * });
 * ```
 */
export const trackPerformance = (
  operationName: string,
  duration: number,
  additionalData?: Record<string, unknown>
) => errorTracking.trackPerformance(operationName, duration, additionalData);
