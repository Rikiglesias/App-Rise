import { useCallback, useEffect, useRef, useState } from 'react';

import {
  isSuccess,
  retry,
  safeAsync,
  withTimeout,
  type AsyncResult,
} from '@/shared/utils/result';
import { logDebug, logError } from '@/shared/utils/logger';

// ===================================================================
// ASYNC OPERATION HOOK
// ===================================================================

interface UseAsyncOperationOptions {
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  enableDebugLogging?: boolean;
}

interface AsyncOperationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  lastExecutedAt: Date | null;
}

interface UseAsyncOperationReturn<T> {
  state: AsyncOperationState<T>;
  execute: (...args: unknown[]) => AsyncResult<T>;
  reset: () => void;
  isExecuting: boolean;
}

/**
 * Hook per gestione robusta di operazioni asincrone
 * Integra Result Pattern con retry, timeout e stato React
 */
export const useAsyncOperation = <T, TArgs extends unknown[] = []>(
  operation: (...args: TArgs) => Promise<T>,
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> => {
  const {
    timeout = 10000,
    retryAttempts = 1,
    retryDelay = 1000,
    enableDebugLogging = __DEV__,
  } = options;

  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastExecutedAt: null,
  });

  const operationRef = useRef(operation);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Update operation ref when it changes
  operationRef.current = operation;

  const execute = useCallback(
    async (...args: unknown[]): AsyncResult<T> => {
      // Cancel previous operation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();
      const currentAbortController = abortControllerRef.current;

      setState(prevState => ({
        ...prevState,
        isLoading: true,
        error: null,
      }));

      const startTime = Date.now();

      try {
        // Create operation with abort signal
        const createOperation = () => {
          if (currentAbortController.signal.aborted) {
            throw new Error('Operation was cancelled');
          }
          return operationRef.current(...(args as TArgs));
        };

        // Execute with timeout and retry
        const result = await retry(
          async () =>
            await withTimeout(
              () => createOperation(),
              timeout,
              'Operation timed out'
            ),
          retryAttempts,
          retryDelay
        );

        // Check if operation was cancelled
        if (currentAbortController.signal.aborted) {
          return {
            success: false,
            error: new Error('Operation was cancelled'),
          };
        }

        if (isSuccess(result)) {
          setState({
            data: result.data,
            isLoading: false,
            error: null,
            lastExecutedAt: new Date(),
          });

          if (enableDebugLogging) {
            logDebug(
              'AsyncOperation',
              `Success in ${Date.now() - startTime}ms`,
              {
                data: result.data,
                args,
                retryAttempts,
              }
            );
          }

          return result;
        } else {
          setState(prevState => ({
            ...prevState,
            isLoading: false,
            error: result.error,
            lastExecutedAt: new Date(),
          }));

          if (enableDebugLogging) {
            logError(
              'AsyncOperation',
              `Failed in ${Date.now() - startTime}ms`,
              result.error
            );
          }

          return result;
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        setState(prevState => ({
          ...prevState,
          isLoading: false,
          error: err,
          lastExecutedAt: new Date(),
        }));

        if (enableDebugLogging) {
          logError(
            'AsyncOperation',
            `Exception in ${Date.now() - startTime}ms`,
            err
          );
        }

        return { success: false, error: err };
      } finally {
        // Clear abort controller if it's the current one
        if (abortControllerRef.current === currentAbortController) {
          abortControllerRef.current = null;
        }
      }
    },
    [timeout, retryAttempts, retryDelay, enableDebugLogging]
  );

  const reset = useCallback(() => {
    // Cancel any running operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setState({
      data: null,
      isLoading: false,
      error: null,
      lastExecutedAt: null,
    });
  }, []);

  const isExecuting = state.isLoading;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  return {
    state,
    execute,
    reset,
    isExecuting,
  };
};

// ===================================================================
// SPECIALIZED HOOKS
// ===================================================================

/**
 * Hook per operazioni di navigazione con gestione errori
 */
export const useNavigationOperation = (
  options: UseAsyncOperationOptions = {}
) => {
  return useAsyncOperation(
    (navigationFn: () => void) => {
      // Wrap navigation in Promise.resolve (non-async since no await needed)
      navigationFn();
      return Promise.resolve(true);
    },
    {
      timeout: 2000,
      retryAttempts: 1,
      ...options,
    }
  );
};

/**
 * Hook per operazioni API con cache
 */
export const useApiOperation = <T>(
  apiCall: () => Promise<T>,
  options: UseAsyncOperationOptions & {
    cacheKey?: string;
    cacheDuration?: number;
  } = {}
) => {
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(
    new Map()
  );

  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    ...asyncOptions
  } = options;

  const wrappedOperation = useCallback(() => {
    return new Promise<T>(async (resolve, reject) => {
      try {
        // Check cache if key provided
        if (cacheKey) {
          const cached = cacheRef.current.get(cacheKey);
          if (cached && Date.now() - cached.timestamp < cacheDuration) {
            resolve(cached.data);
            return;
          }
        }

        const result = await apiCall();

        // Cache result if key provided
        if (cacheKey) {
          cacheRef.current.set(cacheKey, {
            data: result,
            timestamp: Date.now(),
          });
        }

        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  }, [apiCall, cacheKey, cacheDuration]);

  return useAsyncOperation(wrappedOperation, asyncOptions);
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Combina multiple async operations
 */
export const combineAsyncOperations = <
  T extends readonly unknown[],
>(operations: { [K in keyof T]: () => AsyncResult<T[K]> }): AsyncResult<T> => {
  return safeAsync(async () => {
    const results = await Promise.all(operations.map(op => op()));

    // Check if any operation failed
    for (const result of results) {
      if (!isSuccess(result)) {
        throw result.error;
      }
    }

    // Extract data from all successful results
    return results.map(result =>
      isSuccess(result) ? result.data : null
    ) as unknown as T;
  });
};

/**
 * Executa operazioni in sequenza
 */
export const sequentialAsyncOperations = async <T>(
  operations: (() => AsyncResult<T>)[]
): AsyncResult<T[]> => {
  const results: T[] = [];

  for (const operation of operations) {
    // eslint-disable-next-line no-await-in-loop
    const result = await operation();

    if (!isSuccess(result)) {
      return result;
    }

    results.push(result.data);
  }

  return { success: true, data: results };
};
