/* eslint-disable max-lines-per-function */
import {
  logger,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
  logPerformance,
  logUserAction,
  logApiCall,
} from '../../../shared/utils/logger';

describe('ProfessionalLogger (extended)', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const infoSpy = jest.spyOn(console, 'info').mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('writes logs for all levels in development and buffers them', () => {
    logDebug('debug-msg', 'Ctx');
    logInfo('info-msg', 'Ctx');
    logWarn('warn-msg', 'Ctx');
    logError('error-msg', 'Ctx');
    logFatal('fatal-msg', 'Ctx');
    logPerformance('op', Date.now(), 'Ctx');
    logUserAction('click', 'u1', { id: 1 });
    logApiCall('GET', '/api', 200, 12);

    expect(logSpy).toHaveBeenCalled();
    expect(infoSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalled();

    const buffer = logger.exportLogsAsString();
    expect(buffer).toContain('DEBUG');
    expect(buffer).toContain('INFO');
    expect(buffer).toContain('WARN');
    expect(buffer).toContain('ERROR');
    expect(buffer).toContain('FATAL');
    expect(buffer).toContain('API');
  });

  it('in production: info is skipped, error/fatal buffered and bridged to Sentry', () => {
    jest.isolateModules(() => {
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;
      // Re-import module under production mode
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('../../../shared/utils/logger');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Sentry = require('@sentry/react-native');
      const prodLogInfo = mod.logInfo as (msg: string, ctx?: string) => void;
      const prodLogError = mod.logError as (msg: string, ctx?: string) => void;
      const prodLogFatal = mod.logFatal as (msg: string, ctx?: string) => void;
      const prodLogger = mod.logger as typeof logger;

      const infoSpyLocal = jest
        .spyOn(console, 'info')
        .mockImplementation(() => {});
      const errorSpyLocal = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Info should be ignored entirely — non loggata né inoltrata a Sentry (anti-flood)
      prodLogInfo('hello', 'Prod');
      expect(infoSpyLocal).not.toHaveBeenCalled();
      expect(prodLogger.exportLogsAsString()).toBe('');
      expect(Sentry.captureMessage).not.toHaveBeenCalled();

      // Error should be buffered (not printed) AND bridged to Sentry with level error
      prodLogError('oops', 'Prod');
      expect(errorSpyLocal).not.toHaveBeenCalled();
      expect(prodLogger.exportLogsAsString()).toContain('ERROR');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('oops', {
        level: 'error',
        extra: { context: 'Prod', data: undefined },
      });

      // Fatal is bridged with level fatal
      prodLogFatal('dead', 'Prod');
      expect(Sentry.captureMessage).toHaveBeenCalledWith('dead', {
        level: 'fatal',
        extra: { context: 'Prod', data: undefined },
      });

      (global as any).__DEV__ = originalDev;
    });
  });
});
