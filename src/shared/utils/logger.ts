/**
 * Sistema di logging professionale per Rise Against Hunger Italia
 * Sostituisce completamente console.* statements per produzione sicura
 */

import * as Sentry from '@sentry/react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  userId?: string;
  sessionId?: string;
}

class ProfessionalLogger {
  private readonly isProduction: boolean;
  private readonly enabledLevels: Set<LogLevel>;
  private readonly logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 1000;

  constructor() {
    // Safe handling of __DEV__ for Node/Jest/CI where it may be undefined
    this.isProduction = typeof __DEV__ !== 'undefined' ? !__DEV__ : true;

    // Configurazione livelli basata su ambiente
    this.enabledLevels = new Set(
      this.isProduction
        ? ['error', 'fatal']
        : ['debug', 'info', 'warn', 'error', 'fatal']
    );
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: unknown
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      sessionId: this.getSessionId(),
    };

    if (context !== undefined) {
      entry.context = context;
    }

    if (data !== undefined) {
      entry.data = data;
    }

    return entry;
  }

  private getSessionId(): string {
    // Implementazione semplificata per session tracking
    return 'session-' + Date.now().toString(36);
  }

  private formatLogMessage(entry: LogEntry): string {
    const { timestamp, level, message, context, data } = entry;
    const contextStr = context ? `[${context}]` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';

    return `${timestamp} ${level.toUpperCase()} ${contextStr} ${message}${dataStr}`;
  }

  private writeToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);

    // Mantieni buffer size limitato
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private outputLog(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatLogMessage(entry);

    // In sviluppo, usa console per debugging
    if (!this.isProduction) {
      switch (entry.level) {
        case 'debug':
          // eslint-disable-next-line no-console
          console.log(formattedMessage);
          break;
        case 'info':
          // eslint-disable-next-line no-console
          console.info(formattedMessage);
          break;
        case 'warn':
          // eslint-disable-next-line no-console
          console.warn(formattedMessage);
          break;
        case 'error':
        case 'fatal':
          // eslint-disable-next-line no-console
          console.error(formattedMessage);
          break;
      }
    }

    // Salva sempre nel buffer per crash reporting
    this.writeToBuffer(entry);

    // Bridge crash reporting: in produzione error/fatal vanno a Sentry. Il buffer
    // in-memory non è consumato da alcun path di produzione (getLogs/exportLogs sono
    // solo nei test), quindi senza questo bridge ogni logger.error/fatal reale sarebbe
    // perso al kill del processo. No-op se Sentry non è inizializzato (DSN assente).
    if (
      this.isProduction &&
      (entry.level === 'error' || entry.level === 'fatal')
    ) {
      Sentry.captureMessage(entry.message, {
        level: entry.level === 'fatal' ? 'fatal' : 'error',
        extra: {
          context: entry.context,
          data: entry.data,
        },
      });
    }
  }

  // API pubblica del logger
  debug(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry('debug', message, context, data);
    this.outputLog(entry);
  }

  info(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry('info', message, context, data);
    this.outputLog(entry);
  }

  warn(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry('warn', message, context, data);
    this.outputLog(entry);
  }

  error(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry('error', message, context, data);
    this.outputLog(entry);
  }

  fatal(message: string, context?: string, data?: unknown): void {
    const entry = this.createLogEntry('fatal', message, context, data);
    this.outputLog(entry);
  }

  // Metodi di utilità
  performance(operation: string, startTime: number, context?: string): void {
    const duration = Date.now() - startTime;
    this.debug(`Performance: ${operation} took ${duration}ms`, context, {
      duration,
    });
  }

  userAction(action: string, userId?: string, data?: unknown): void {
    const actionData: Record<string, unknown> = { userId };
    if (data && typeof data === 'object' && data !== null) {
      Object.assign(actionData, data);
    } else if (data !== undefined) {
      actionData.data = data;
    }
    this.info(`User Action: ${action}`, 'USER_ACTION', actionData);
  }

  apiCall(
    method: string,
    url: string,
    statusCode: number,
    duration: number
  ): void {
    const level = statusCode >= 400 ? 'error' : 'info';
    this.outputLog(
      this.createLogEntry(
        level,
        `API Call: ${method} ${url} - ${statusCode}`,
        'API',
        { method, url, statusCode, duration }
      )
    );
  }

  // Metodi per debugging e crash reporting
  getLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  getLogsForLevel(level: LogLevel): LogEntry[] {
    return this.logBuffer.filter(entry => entry.level === level);
  }

  clearLogs(): void {
    this.logBuffer.length = 0;
  }

  // Metodo per export logs per crash reporting
  exportLogsAsString(): string {
    return this.logBuffer.map(entry => this.formatLogMessage(entry)).join('\n');
  }
}

/**
 * Singleton instance of the Professional Logger.
 * Provides structured logging with different levels, context,
 * and automatic buffering for production environments.
 */
export const logger = new ProfessionalLogger();

// Export del tipo per TypeScript
export type { LogLevel, LogEntry };

/**
 * Logs a debug message with optional context and data.
 * Debug messages are only shown in development environments.
 *
 * @param message - The debug message to log
 * @param context - Optional context identifier (component, function, etc.)
 * @param data - Optional additional data to include
 *
 * @example
 * ```typescript
 * logDebug('User data loaded', 'UserProfile', { userId: '123', loadTime: 250 });
 * ```
 */
export const logDebug = (message: string, context?: string, data?: unknown) =>
  logger.debug(message, context, data);

/**
 * Logs an informational message with optional context and data.
 *
 * @param message - The info message to log
 * @param context - Optional context identifier
 * @param data - Optional additional data to include
 *
 * @example
 * ```typescript
 * logInfo('Navigation completed', 'AppNavigator', { screen: 'Profile' });
 * ```
 */
export const logInfo = (message: string, context?: string, data?: unknown) =>
  logger.info(message, context, data);

/**
 * Logs a warning message with optional context and data.
 *
 * @param message - The warning message to log
 * @param context - Optional context identifier
 * @param data - Optional additional data to include
 *
 * @example
 * ```typescript
 * logWarn('API response slow', 'ApiService', { duration: 5000, endpoint: '/users' });
 * ```
 */
export const logWarn = (message: string, context?: string, data?: unknown) =>
  logger.warn(message, context, data);

/**
 * Logs an error message with optional context and data.
 *
 * @param message - The error message to log
 * @param context - Optional context identifier
 * @param data - Optional additional data to include
 *
 * @example
 * ```typescript
 * logError('Failed to save user data', 'UserService', { userId: '123', error: errorObj });
 * ```
 */
export const logError = (message: string, context?: string, data?: unknown) =>
  logger.error(message, context, data);

/**
 * Logs a fatal error message with optional context and data.
 * Fatal errors indicate critical system failures.
 *
 * @param message - The fatal error message to log
 * @param context - Optional context identifier
 * @param data - Optional additional data to include
 *
 * @example
 * ```typescript
 * logFatal('Database connection lost', 'DatabaseService', { connectionId: 'db-001' });
 * ```
 */
export const logFatal = (message: string, context?: string, data?: unknown) =>
  logger.fatal(message, context, data);

/**
 * Logs performance metrics for operations.
 *
 * @param operation - Name of the operation being measured
 * @param startTime - Start time in milliseconds (from Date.now() or performance.now())
 * @param context - Optional context identifier
 *
 * @example
 * ```typescript
 * const startTime = Date.now();
 * await performOperation();
 * logPerformance('dataProcessing', startTime, 'DataProcessor');
 * ```
 */
export const logPerformance = (
  operation: string,
  startTime: number,
  context?: string
) => logger.performance(operation, startTime, context);

/**
 * Logs user actions for analytics and debugging.
 *
 * @param action - Description of the user action
 * @param userId - Optional user identifier
 * @param data - Optional additional data about the action
 *
 * @example
 * ```typescript
 * logUserAction('button_click', 'user123', { buttonId: 'donate', amount: 50 });
 * ```
 */
export const logUserAction = (
  action: string,
  userId?: string,
  data?: unknown
) => logger.userAction(action, userId, data);

/**
 * Logs API call information including performance metrics.
 *
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - API endpoint URL
 * @param statusCode - HTTP response status code
 * @param duration - Request duration in milliseconds
 *
 * @example
 * ```typescript
 * logApiCall('POST', '/api/users', 201, 450);
 * ```
 */
export const logApiCall = (
  method: string,
  url: string,
  statusCode: number,
  duration: number
) => logger.apiCall(method, url, statusCode, duration);
