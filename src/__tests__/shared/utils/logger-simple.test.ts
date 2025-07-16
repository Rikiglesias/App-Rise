import { logger } from '../../../shared/utils/logger';

// Mock console methods to avoid noise in tests
const mockConsole = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  warn: jest.spyOn(console, 'warn').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
  info: jest.spyOn(console, 'info').mockImplementation(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore console methods
  Object.values(mockConsole).forEach(spy => spy.mockRestore());
});

describe('Logger - Log Level Methods', () => {
  it('should call info with context and message', () => {
    const context = 'TestContext';
    const message = 'Info message';

    logger.info(context, message);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should call warn with context and message', () => {
    const context = 'TestContext';
    const message = 'Warning message';

    logger.warn(context, message);

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should call error with context and message', () => {
    const context = 'TestContext';
    const message = 'Error message';

    logger.error(context, message);

    expect(mockConsole.error).toHaveBeenCalled();
  });
});

describe('Logger - Message Formatting', () => {
  it('should handle simple context and message', () => {
    logger.info('SimpleContext', 'Simple message');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle empty context', () => {
    logger.info('', 'Message with empty context');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle empty message', () => {
    logger.info('Context', '');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle long context strings', () => {
    const longContext = 'VeryLongContextName'.repeat(10);
    logger.info(longContext, 'Test message');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle long messages', () => {
    const longMessage = 'Very long message content. '.repeat(50);
    logger.info('Context', longMessage);

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Error Object Handling', () => {
  it('should handle error object with info', () => {
    const error = new Error('Test error');
    logger.info('ErrorContext', 'Error occurred', error);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle error object with warn', () => {
    const error = new Error('Test error');
    logger.warn('ErrorContext', 'Error occurred', error);

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should handle error object with error', () => {
    const error = new Error('Test error');
    logger.error('ErrorContext', 'Error occurred', error);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle null error object', () => {
    logger.error('Context', 'Message', null);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle undefined error object', () => {
    logger.error('Context', 'Message', undefined);

    expect(mockConsole.error).toHaveBeenCalled();
  });
});

describe('Logger - Special Characters and Formats', () => {
  it('should handle unicode characters', () => {
    logger.info('🎯 Context', 'Message with emoji 🚀');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle JSON-like strings', () => {
    const jsonMessage = JSON.stringify({ key: 'value', number: 42 });
    logger.info('JSONContext', jsonMessage);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle newlines in messages', () => {
    const multiLineMessage = 'Line 1\nLine 2\nLine 3';
    logger.info('MultiLineContext', multiLineMessage);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle quotes and special chars', () => {
    const specialMessage =
      'Message with "quotes" and \\backslashes\\ and [brackets]';
    logger.info('SpecialContext', specialMessage);

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Performance and Edge Cases', () => {
  it('should handle rapid consecutive calls', () => {
    for (let i = 0; i < 10; i++) {
      logger.info('RapidContext', `Message ${i}`);
    }

    expect(mockConsole.info).toHaveBeenCalledTimes(10);
  });

  it('should handle mixed log level calls', () => {
    logger.info('Mixed', 'Info');
    logger.warn('Mixed', 'Warn');
    logger.error('Mixed', 'Error');

    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
  });

  it('should handle numeric context values', () => {
    logger.info('123', 'Numeric context');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle boolean conversion in messages', () => {
    logger.info('BooleanTest', `Value: ${true}, Other: ${false}`);

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Context Variations', () => {
  it('should handle component-style contexts', () => {
    logger.info('MyComponent', 'Component mounted');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle service-style contexts', () => {
    logger.info('AuthService', 'User authenticated');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle hook-style contexts', () => {
    logger.info('useTheme', 'Theme changed to dark');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle store-style contexts', () => {
    logger.info('AppStore', 'Loading state updated');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Real-world Usage Patterns', () => {
  it('should handle API request logging', () => {
    logger.info('API', 'GET /users - 200 OK');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle authentication logging', () => {
    logger.info('Auth', 'User login successful');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle warning scenarios', () => {
    logger.warn('ValidationService', 'Input validation warning');

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should handle error scenarios', () => {
    const networkError = new Error('Network timeout');
    logger.error('NetworkService', 'Request failed', networkError);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle state notifications', () => {
    logger.info('State', 'App state changed from loading to ready');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});
