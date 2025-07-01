/* eslint-disable max-lines-per-function, require-await, @typescript-eslint/no-unused-vars */
import { renderHook, act } from '@testing-library/react-native';
import {
  useAsyncOperation,
  useNavigationOperation,
  useApiOperation,
} from '../../../shared/hooks/useAsyncOperation';

// Mock per il logger
jest.mock('../../../shared/utils/logger', () => ({
  logDebug: jest.fn(),
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

describe('useAsyncOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should initialize with correct default state', () => {
      const mockOperation = jest.fn().mockResolvedValue('test result');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      expect(result.current.state.data).toBe(null);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.lastExecutedAt).toBe(null);
      expect(result.current.isExecuting).toBe(false);
    });

    it('should provide execute and reset functions', () => {
      const mockOperation = jest.fn().mockResolvedValue('test result');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      expect(typeof result.current.execute).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });

    it('should accept custom options', () => {
      const mockOperation = jest.fn().mockResolvedValue('data');
      const options = {
        timeout: 5000,
        retryAttempts: 3,
        retryDelay: 2000,
        enableDebugLogging: false,
      };

      const { result } = renderHook(() =>
        useAsyncOperation(mockOperation, options)
      );

      expect(result.current.state.data).toBe(null);
      expect(result.current.state.isLoading).toBe(false);
    });
  });

  describe('Successful operations', () => {
    it('should handle successful operation execution', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success data');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      await act(async () => {
        const operationResult = await result.current.execute();
        expect(operationResult.success).toBe(true);
      });

      expect(result.current.state.data).toBe('success data');
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.lastExecutedAt).toBeInstanceOf(Date);
      expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it('should handle loading state correctly', async () => {
      let _resolvePromise: (value: string) => void;
      const mockOperation = jest.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            _resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      // Start operation
      act(() => {
        result.current.execute();
      });

      // Should be loading
      expect(result.current.state.isLoading).toBe(true);
      expect(result.current.isExecuting).toBe(true);

      // Resolve operation
      await act(async () => {
        _resolvePromise('resolved data');
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.data).toBe('resolved data');
    });

    it('should pass arguments to operation', async () => {
      const mockOperation = jest.fn().mockResolvedValue('result');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      await act(async () => {
        await result.current.execute('arg1', 'arg2', 123);
      });

      expect(mockOperation).toHaveBeenCalledWith('arg1', 'arg2', 123);
    });

    it('should handle operations with complex data types', async () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const userData: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const mockOperation = jest.fn().mockResolvedValue(userData);
      const { result } = renderHook(() =>
        useAsyncOperation<User>(mockOperation)
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.data).toEqual(userData);
      expect(result.current.state.error).toBe(null);
    });
  });

  describe('Error handling', () => {
    it('should handle operation failures', async () => {
      const error = new Error('Operation failed');
      const mockOperation = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      await act(async () => {
        const operationResult = await result.current.execute();
        expect(operationResult.success).toBe(false);
      });

      expect(result.current.state.data).toBe(null);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(error);
      expect(result.current.state.lastExecutedAt).toBeInstanceOf(Date);
    });

    it('should handle non-Error rejections', async () => {
      const mockOperation = jest.fn().mockRejectedValue('string error');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error).toBeInstanceOf(Error);
      expect(result.current.state.error?.message).toBe('string error');
    });

    it('should handle synchronous errors in operation', async () => {
      const mockOperation = jest.fn().mockImplementation(() => {
        throw new Error('Synchronous error');
      });

      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error?.message).toBe('Synchronous error');
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should clear error state on successful retry', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce('success');

      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      // First call fails
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error?.message).toBe('First error');

      // Second call succeeds
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error).toBe(null);
      expect(result.current.state.data).toBe('success');
    });
  });

  describe('Reset functionality', () => {
    it('should reset state to initial values', async () => {
      const mockOperation = jest.fn().mockResolvedValue('test data');
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      // Execute operation
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.data).toBe('test data');

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.state.data).toBe(null);
      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.lastExecutedAt).toBe(null);
    });

    it('should reset error state', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('test error'));
      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      // Execute failing operation
      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error).toBeTruthy();

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.state.error).toBe(null);
    });

    it('should cancel running operation on reset', async () => {
      let _resolvePromise: (value: string) => void;
      const mockOperation = jest.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            _resolvePromise = resolve;
          })
      );

      const { result } = renderHook(() => useAsyncOperation(mockOperation));

      // Start operation
      act(() => {
        result.current.execute();
      });

      expect(result.current.state.isLoading).toBe(true);

      // Reset before completion
      act(() => {
        result.current.reset();
      });

      expect(result.current.state.isLoading).toBe(false);
      expect(result.current.state.data).toBe(null);
    });
  });

  describe('Retry functionality', () => {
    it('should retry failed operations', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First attempt'))
        .mockRejectedValueOnce(new Error('Second attempt'))
        .mockResolvedValueOnce('Success on third attempt');

      const { result } = renderHook(() =>
        useAsyncOperation(mockOperation, {
          retryAttempts: 3,
          retryDelay: 100,
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(mockOperation).toHaveBeenCalledTimes(3);
      expect(result.current.state.data).toBe('Success on third attempt');
    });

    it('should fail after max retry attempts', async () => {
      const mockOperation = jest
        .fn()
        .mockRejectedValue(new Error('Persistent error'));

      const { result } = renderHook(() =>
        useAsyncOperation(mockOperation, {
          retryAttempts: 2,
          retryDelay: 100,
        })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(mockOperation).toHaveBeenCalledTimes(2); // 1 initial + 1 retry (actual behavior)
      expect(result.current.state.error?.message).toBe('Persistent error');
    });
  });

  describe('Timeout functionality', () => {
    it('should handle timeout configuration', () => {
      const mockOperation = jest.fn().mockResolvedValue('data');

      const { result } = renderHook(() =>
        useAsyncOperation(mockOperation, { timeout: 1000 })
      );

      // Should initialize without errors
      expect(result.current.state.data).toBe(null);
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should handle fast operations correctly', async () => {
      const mockOperation = jest.fn().mockResolvedValue('fast result');

      const { result } = renderHook(() =>
        useAsyncOperation(mockOperation, { timeout: 1000 })
      );

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.data).toBe('fast result');
      expect(result.current.state.error).toBe(null);
    });
  });

  describe('Concurrent operations', () => {
    it('should cancel previous operation when new one starts', async () => {
      let resolveFirst: ((value: string) => void) | undefined;
      let resolveSecond: ((value: string) => void) | undefined;

      const mockOperation = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              resolveFirst = resolve;
            })
        )
        .mockImplementationOnce(
          () =>
            new Promise(resolve => {
              resolveSecond = resolve;
            })
        );

      const { result } = renderHook(() =>
        useAsyncOperation<string>(mockOperation)
      );

      // Start first operation
      act(() => {
        result.current.execute();
      });

      expect(result.current.state.isLoading).toBe(true);

      // Start second operation before first completes
      act(() => {
        result.current.execute();
      });

      // Complete second operation
      await act(async () => {
        if (resolveSecond) resolveSecond('second');
      });

      // Complete first operation (should be ignored)
      await act(async () => {
        if (resolveFirst) resolveFirst('first');
      });

      // Second operation should win
      expect(result.current.state.data).toBe('second');
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle API calls', async () => {
      const mockApiCall = jest.fn().mockResolvedValue({
        users: [{ id: 1, name: 'John' }],
        total: 1,
      });

      const { result } = renderHook(() => useAsyncOperation(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.data).toEqual({
        users: [{ id: 1, name: 'John' }],
        total: 1,
      });
      expect(result.current.state.error).toBe(null);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network request failed');
      const mockApiCall = jest.fn().mockRejectedValue(networkError);

      const { result } = renderHook(() => useAsyncOperation(mockApiCall));

      await act(async () => {
        await result.current.execute();
      });

      expect(result.current.state.error).toBe(networkError);
      expect(result.current.state.data).toBe(null);
    });
  });
});

describe('useNavigationOperation', () => {
  it('should handle navigation operations', async () => {
    const mockNavigate = jest.fn();
    const { result } = renderHook(() => useNavigationOperation());

    await act(async () => {
      await result.current.execute(mockNavigate);
    });

    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(result.current.state.data).toBe(true);
  });

  it('should use navigation-specific timeout', () => {
    const { result } = renderHook(() =>
      useNavigationOperation({ timeout: 5000 })
    );

    // Should initialize without errors
    expect(result.current.state.data).toBe(null);
    expect(result.current.state.isLoading).toBe(false);
  });
});

describe('useApiOperation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle API operations with caching', async () => {
    const mockApiCall = jest.fn().mockResolvedValue('api data');
    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        cacheKey: 'test-key',
        cacheDuration: 5000,
      })
    );

    // First call
    await act(async () => {
      await result.current.execute();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.state.data).toBe('api data');

    // Second call should use cache
    await act(async () => {
      await result.current.execute();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1); // Still only called once
    expect(result.current.state.data).toBe('api data');
  });

  it('should handle cache configuration correctly', async () => {
    const mockApiCall = jest.fn().mockResolvedValue('api data');

    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        cacheKey: 'test-key',
        cacheDuration: 5000, // Long cache for testing
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.state.data).toBe('api data');
    expect(result.current.state.error).toBe(null);
  });

  it('should handle operations without cache key', async () => {
    const mockApiCall = jest.fn().mockResolvedValue('uncached data');

    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        // No cacheKey provided
        cacheDuration: 5000,
      })
    );

    // First call
    await act(async () => {
      await result.current.execute();
    });
    expect(mockApiCall).toHaveBeenCalledTimes(1);

    // Second call should not use cache without cacheKey
    await act(async () => {
      await result.current.execute();
    });
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it('should handle API errors correctly', async () => {
    const apiError = new Error('API request failed');
    const mockApiCall = jest.fn().mockRejectedValue(apiError);

    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        cacheKey: 'error-test',
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.state.error).toBe(apiError);
    expect(result.current.state.data).toBe(null);
  });

  it('should handle timeout scenarios correctly', async () => {
    const mockApiCall = jest.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => resolve('delayed response'), 200);
        })
    );

    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        timeout: 100, // Short timeout to test timeout handling
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    // Should handle timeout gracefully
    expect(result.current.state.error?.message).toContain('timed out');
  }, 5000);

  it('should handle debug logging scenarios', async () => {
    const mockApiCall = jest.fn().mockResolvedValue('logged data');

    const { result } = renderHook(() =>
      useApiOperation(mockApiCall, {
        enableDebugLogging: true,
      })
    );

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.state.data).toBe('logged data');
    expect(result.current.state.error).toBe(null);
  });
});
