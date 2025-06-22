/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines-per-function */
import {
  logger,
  logError,
  logWarn,
  logInfo,
  logDebug,
} from '../../../shared/utils/logger';

// Mock console methods before tests
const originalConsole = global.console;
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
};

describe('Professional Logger System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.console = mockConsole as any;
    // Reset DEV environment
    (global as any).__DEV__ = true;
    logger.clearLogs();
  });

  afterAll(() => {
    global.console = originalConsole;
  });

  describe('Logger Class', () => {
    it('should be accessible as singleton', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should log error messages in development', () => {
      logger.error('Test error message', 'TEST_CONTEXT', { testData: 'value' });

      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('ERROR [TEST_CONTEXT] Test error message')
      );
    });

    it('should log warn messages in development', () => {
      logger.warn('Test warning', 'TEST_CONTEXT');

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('WARN [TEST_CONTEXT] Test warning')
      );
    });

    it('should log info messages in development', () => {
      logger.info('Test info message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('INFO  Test info message')
      );
    });

    it('should log debug messages in development', () => {
      logger.debug('Test debug message');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG  Test debug message')
      );
    });

    it('should handle performance logging', () => {
      const startTime = Date.now() - 100;
      logger.performance('test operation', startTime, 'PERF_CONTEXT');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining(
          'DEBUG [PERF_CONTEXT] Performance: test operation took'
        )
      );
    });

    it('should store logs in buffer', () => {
      logger.info('Test log entry');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(1);

      const firstLog = logs[0];
      expect(firstLog).toBeDefined();
      expect(firstLog?.message).toBe('Test log entry');
      expect(firstLog?.level).toBe('info');
    });
  });

  describe('Convenience Functions', () => {
    it('logError should call logger.error', () => {
      const spy = jest.spyOn(logger, 'error');

      logError('Test error message', 'TEST_CONTEXT', { error: 'data' });

      expect(spy).toHaveBeenCalledWith('Test error message', 'TEST_CONTEXT', {
        error: 'data',
      });
    });

    it('logWarn should call logger.warn', () => {
      const spy = jest.spyOn(logger, 'warn');

      logWarn('Test warning message', 'TEST_CONTEXT');

      expect(spy).toHaveBeenCalledWith(
        'Test warning message',
        'TEST_CONTEXT',
        undefined
      );
    });

    it('logInfo should call logger.info', () => {
      const spy = jest.spyOn(logger, 'info');

      logInfo('Test info message');

      expect(spy).toHaveBeenCalledWith(
        'Test info message',
        undefined,
        undefined
      );
    });

    it('logDebug should call logger.debug', () => {
      const spy = jest.spyOn(logger, 'debug');

      logDebug('Test debug message');

      expect(spy).toHaveBeenCalledWith(
        'Test debug message',
        undefined,
        undefined
      );
    });
  });

  describe('Log Management', () => {
    it('should clear logs when requested', () => {
      logger.info('Test message 1');
      logger.info('Test message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });

    it('should export logs as string', () => {
      logger.info('Test message');

      const exportedLogs = logger.exportLogsAsString();
      expect(exportedLogs).toContain('INFO  Test message');
    });
  });
});
