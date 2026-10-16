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

    logger.info(message, context);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should call warn with context and message', () => {
    const context = 'TestContext';
    const message = 'Warning message';

    logger.warn(message, context);

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should call error with context and message', () => {
    const context = 'TestContext';
    const message = 'Error message';

    logger.error(message, context);

    expect(mockConsole.error).toHaveBeenCalled();
    expect(logger.getLogs().at(-1)).toMatchObject({ message, context });
  });
});

describe('Logger - Message Formatting', () => {
  it('should handle simple context and message', () => {
    logger.info('Simple message', 'SimpleContext');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle empty context', () => {
    logger.info('Message with empty context', '');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle empty message', () => {
    logger.info('', 'Context');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle long context strings', () => {
    const longContext = 'VeryLongContextName'.repeat(10);
    logger.info('Test message', longContext);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle long messages', () => {
    const longMessage = 'Very long message content. '.repeat(50);
    logger.info(longMessage, 'Context');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Error Object Handling', () => {
  it('should handle error object with info', () => {
    const error = new Error('Test error');
    logger.info('Error occurred', 'ErrorContext', error);

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle error object with warn', () => {
    const error = new Error('Test error');
    logger.warn('Error occurred', 'ErrorContext', error);

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should handle error object with error', () => {
    const error = new Error('Test error');
    logger.error('Error occurred', 'ErrorContext', error);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle null error object', () => {
    logger.error('Message', 'Context', null);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle undefined error object', () => {
    logger.error('Message', 'Context', undefined);

    expect(mockConsole.error).toHaveBeenCalled();
  });
});

describe('Logger - Special Characters and Formats', () => {
  it('should handle unicode characters', () => {
    logger.info('Message with emoji 🚀', '🎯 Context');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle JSON-like strings', () => {
    const jsonMessage = JSON.stringify({ key: 'value', number: 42 });
    logger.info(jsonMessage, 'JSONContext');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle newlines in messages', () => {
    const multiLineMessage = 'Line 1\nLine 2\nLine 3';
    logger.info(multiLineMessage, 'MultiLineContext');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle quotes and special chars', () => {
    const specialMessage =
      'Message with "quotes" and \\backslashes\\ and [brackets]';
    logger.info(specialMessage, 'SpecialContext');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Performance and Edge Cases', () => {
  it('should handle rapid consecutive calls', () => {
    for (let i = 0; i < 10; i++) {
      logger.info(`Message ${i}`, 'RapidContext');
    }

    expect(mockConsole.info).toHaveBeenCalledTimes(10);
  });

  it('should handle mixed log level calls', () => {
    logger.info('Info', 'Mixed');
    logger.warn('Warn', 'Mixed');
    logger.error('Error', 'Mixed');

    expect(mockConsole.info).toHaveBeenCalledTimes(1);
    expect(mockConsole.warn).toHaveBeenCalledTimes(1);
    expect(mockConsole.error).toHaveBeenCalledTimes(1);
  });

  it('should handle numeric context values', () => {
    logger.info('Numeric context', '123');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle boolean conversion in messages', () => {
    logger.info(`Value: ${true}, Other: ${false}`, 'BooleanTest');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Context Variations', () => {
  it('should handle component-style contexts', () => {
    logger.info('Component mounted', 'MyComponent');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle service-style contexts', () => {
    logger.info('User authenticated', 'AuthService');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle hook-style contexts', () => {
    logger.info('Theme changed to dark', 'useTheme');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle store-style contexts', () => {
    logger.info('Loading state updated', 'AppStore');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});

describe('Logger - Real-world Usage Patterns', () => {
  it('should handle API request logging', () => {
    logger.info('GET /users - 200 OK', 'API');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle authentication logging', () => {
    logger.info('User login successful', 'Auth');

    expect(mockConsole.info).toHaveBeenCalled();
  });

  it('should handle warning scenarios', () => {
    logger.warn('Input validation warning', 'ValidationService');

    expect(mockConsole.warn).toHaveBeenCalled();
  });

  it('should handle error scenarios', () => {
    const networkError = new Error('Network timeout');
    logger.error('Request failed', 'NetworkService', networkError);

    expect(mockConsole.error).toHaveBeenCalled();
  });

  it('should handle state notifications', () => {
    logger.info('App state changed from loading to ready', 'State');

    expect(mockConsole.info).toHaveBeenCalled();
  });
});
