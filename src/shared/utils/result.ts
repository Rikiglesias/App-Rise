/* eslint-disable require-await */
/* eslint-disable no-await-in-loop */
import { useCallback, useState } from 'react';
import { logDebug, logError } from './logger';

/**
 * RESULT PATTERN - Type-Safe Async Operations
 *
 * Sistema di gestione errori robusto e type-safe per operazioni asincrone.
 * Elimina floating promises e garantisce gestione completa degli errori.
 */

// ===================================================================
// CORE RESULT TYPES
// ===================================================================

/**
 * Result type per operazioni che possono fallire
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; error: E; data?: never };

/**
 * Async Result per operazioni asincrone
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

// ===================================================================
// RESULT CONSTRUCTORS
// ===================================================================

/**
 * Crea un Result di successo
 */
export const success = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

/**
 * Crea un Result di errore
 */
export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// ===================================================================
// ASYNC UTILITIES
// ===================================================================

/**
 * Wrapper sicuro per operazioni asincrone
 * Converte Promise<T> in AsyncResult<T>
 */
export const safeAsync = async <T>(
  operation: () => Promise<T>
): AsyncResult<T> => {
  try {
    const data = await operation();
    return success(data);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return failure(err);
  }
};

/**
 * Wrapper sicuro per operazioni sincrone che possono fallire
 */
export const safe = <T>(operation: () => T): Result<T> => {
  try {
    const data = operation();
    return success(data);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return failure(err);
  }
};

/**
 * Timeout wrapper per operazioni asincrone
 */
export const withTimeout = async <T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): AsyncResult<T> => {
  return safeAsync(
    () =>
      new Promise<T>((resolve, reject) => {
        let isResolved = false;
        let timer: NodeJS.Timeout | null = null;

        timer = setTimeout(() => {
          if (!isResolved && timer) {
            isResolved = true;
            timer = null;
            reject(new Error(timeoutMessage));
          }
        }, timeoutMs);

        // Esegui l'operazione e pulisci sempre il timer
        operation()
          .then(value => {
            if (!isResolved) {
              isResolved = true;
              if (timer) {
                clearTimeout(timer);
                timer = null;
              }
              resolve(value);
            }
          })
          .catch(err => {
            if (!isResolved) {
              isResolved = true;
              if (timer) {
                clearTimeout(timer);
                timer = null;
              }
              reject(err);
            }
          });
      })
  );
};

// ===================================================================
// RESULT COMBINATORS
// ===================================================================

/**
 * Map function per trasformare il dato di successo
 */
export const map = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (result.success) {
    return success(fn(result.data));
  }
  return result;
};

/**
 * MapError function per trasformare l'errore
 */
export const mapError = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  if (!result.success) {
    return failure(fn(result.error));
  }
  return result;
};

/**
 * Chain operation (flatMap)
 */
export const chain = <T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  if (result.success) {
    return fn(result.data);
  }
  return result;
};

/**
 * Combina multiple results in un array
 */
export const combine = <T, E>(results: Result<T, E>[]): Result<T[], E> => {
  const data: T[] = [];

  for (const result of results) {
    if (!result.success) {
      return result;
    }
    data.push(result.data);
  }

  return success(data);
};

// ===================================================================
// UTILITY FUNCTIONS
// ===================================================================

/**
 * Unwrap result o throw se errore
 */
export const unwrap = <T, E>(result: Result<T, E>): T => {
  if (result.success) {
    return result.data;
  }
  throw result.error;
};

/**
 * Unwrap con valore di default
 */
export const unwrapOr = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return result.success ? result.data : defaultValue;
};

/**
 * Unwrap con funzione di fallback
 */
export const unwrapOrElse = <T, E>(
  result: Result<T, E>,
  fallback: (error: E) => T
): T => {
  return result.success ? result.data : fallback(result.error);
};

/**
 * Type guard per verificare successo
 */
export const isSuccess = <T, E>(
  result: Result<T, E>
): result is { success: true; data: T } => {
  return result.success;
};

/**
 * Type guard per verificare errore
 */
export const isFailure = <T, E>(
  result: Result<T, E>
): result is { success: false; error: E } => {
  return !result.success;
};

// ===================================================================
// REACT INTEGRATION
// ===================================================================

/**
 * Hook per gestire stato di Result
 */
export interface UseResultState<T, E = Error> {
  result: Result<T, E> | null;
  isLoading: boolean;
  execute: () => Promise<Result<T, E>>;
  reset: () => void;
}

export const createUseResult = <T, E = Error>(
  operation: () => AsyncResult<T, E>
) => {
  return (): UseResultState<T, E> => {
    const [result, setResult] = useState<Result<T, E> | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(async () => {
      setIsLoading(true);
      const newResult = await operation();
      setResult(newResult);
      setIsLoading(false);
      return newResult;
    }, []);

    const reset = useCallback(() => {
      setResult(null);
      setIsLoading(false);
    }, []);

    return { result, isLoading, execute, reset };
  };
};

// ===================================================================
// LOGGING AND DEBUGGING
// ===================================================================

/**
 * Log result per debugging
 */
export const logResult = <T, E>(
  result: Result<T, E>,
  context?: string
): Result<T, E> => {
  if (__DEV__) {
    const prefix = context ? `[${context}]` : '[Result]';

    if (result.success) {
      logDebug('ResultPattern', `${prefix} Success`, result.data);
    } else {
      logError(
        'ResultPattern',
        `${prefix} Error`,
        result.error instanceof Error
          ? result.error
          : new Error(String(result.error))
      );
    }
  }

  return result;
};

// ===================================================================
// ASYNC PATTERNS
// ===================================================================

/**
 * Retry pattern per operazioni che possono fallire
 */
export const retry = async <T>(
  operation: () => AsyncResult<T>,
  maxAttempts: number,
  delayMs = 1000
): AsyncResult<T> => {
  let lastError: Error = new Error('No attempts made');

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await operation();

    if (result.success) {
      return result;
    }

    lastError = result.error;

    // Non fare delay sull'ultimo tentativo
    if (attempt < maxAttempts) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return failure(lastError);
};

/**
 * Debounce per operazioni asincrone
 */
export const debounceAsync = <T>(
  operation: () => AsyncResult<T>,
  delayMs: number
): (() => AsyncResult<T>) => {
  let timeoutId: NodeJS.Timeout | null = null;
  let resolveLatest: ((result: Result<T>) => void) | null = null;

  return () => {
    return new Promise<Result<T>>(resolve => {
      // Cancella timeout precedente
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // Risolvi la promise precedente con un errore di cancellazione
      if (resolveLatest) {
        resolveLatest(failure(new Error('Debounced operation cancelled')));
      }

      resolveLatest = resolve;

      timeoutId = setTimeout(async () => {
        const result = await operation();
        resolve(result);
        resolveLatest = null;
      }, delayMs);
    });
  };
};
