/**
 * Sistema di logging professionale per Rise Against Hunger Italia
 * Sostituisce completamente console.* statements per produzione sicura
 */

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
    this.isProduction = !__DEV__;

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

// Istanza singleton del logger
export const logger = new ProfessionalLogger();

// Export del tipo per TypeScript
export type { LogLevel, LogEntry };

// Metodi di convenienza per backward compatibility
export const logDebug = (message: string, context?: string, data?: unknown) =>
  logger.debug(message, context, data);

export const logInfo = (message: string, context?: string, data?: unknown) =>
  logger.info(message, context, data);

export const logWarn = (message: string, context?: string, data?: unknown) =>
  logger.warn(message, context, data);

export const logError = (message: string, context?: string, data?: unknown) =>
  logger.error(message, context, data);

export const logFatal = (message: string, context?: string, data?: unknown) =>
  logger.fatal(message, context, data);

// Helper per performance logging
export const logPerformance = (
  operation: string,
  startTime: number,
  context?: string
) => logger.performance(operation, startTime, context);

// Helper per user actions
export const logUserAction = (
  action: string,
  userId?: string,
  data?: unknown
) => logger.userAction(action, userId, data);

// Helper per API calls
export const logApiCall = (
  method: string,
  url: string,
  statusCode: number,
  duration: number
) => logger.apiCall(method, url, statusCode, duration);
