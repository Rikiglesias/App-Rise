/* eslint-disable max-lines-per-function, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, max-nested-callbacks */
import {
  map,
  mapError,
  chain,
  combine,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  retry,
  logResult,
  success,
  failure,
  safeAsync,
} from '../../../shared/utils/result';

describe('Result Pattern - Advanced Functions', () => {
  describe('Result Combinators', () => {
    describe('map', () => {
      it('should transform success data', () => {
        const result = success(5);
        const mapped = map(result, x => x * 2);

        expect(mapped.success).toBe(true);
        if (mapped.success) {
          expect(mapped.data).toBe(10);
        }
      });

      it('should pass through failure', () => {
        const error = new Error('test error');
        const result = failure(error);
        const mapped = map(result, x => x * 2);

        expect(mapped.success).toBe(false);
        if (!mapped.success) {
          expect(mapped.error).toBe(error);
        }
      });
    });

    describe('mapError', () => {
      it('should pass through success', () => {
        const result = success('test data');
        const mapped = mapError(result, () => new Error('new error'));

        expect(mapped.success).toBe(true);
        if (mapped.success) {
          expect(mapped.data).toBe('test data');
        }
      });

      it('should transform error', () => {
        const originalError = new Error('original');
        const newError = new Error('transformed');
        const result = failure(originalError);
        const mapped = mapError(result, () => newError);

        expect(mapped.success).toBe(false);
        if (!mapped.success) {
          expect(mapped.error).toBe(newError);
        }
      });
    });

    describe('chain', () => {
      it('should chain successful operations', () => {
        const result = success(5);
        const chained = chain(result, x => success(x * 2));

        expect(chained.success).toBe(true);
        if (chained.success) {
          expect(chained.data).toBe(10);
        }
      });

      it('should short-circuit on failure', () => {
        const error = new Error('test error');
        const result = failure(error);
        const chained = chain(result, x => success(x * 2));

        expect(chained.success).toBe(false);
        if (!chained.success) {
          expect(chained.error).toBe(error);
        }
      });

      it('should propagate chained failure', () => {
        const result = success(5);
        const chainError = new Error('chain error');
        const chained = chain(result, () => failure(chainError));

        expect(chained.success).toBe(false);
        if (!chained.success) {
          expect(chained.error).toBe(chainError);
        }
      });
    });

    describe('combine', () => {
      it('should combine successful results', () => {
        const results = [success(1), success(2), success(3)];
        const combined = combine(results);

        expect(combined.success).toBe(true);
        if (combined.success) {
          expect(combined.data).toEqual([1, 2, 3]);
        }
      });

      it('should fail on first error', () => {
        const error = new Error('test error');
        const results = [success(1), failure(error), success(3)];
        const combined = combine(results);

        expect(combined.success).toBe(false);
        if (!combined.success) {
          expect(combined.error).toBe(error);
        }
      });

      it('should handle empty array', () => {
        const combined = combine([]);

        expect(combined.success).toBe(true);
        if (combined.success) {
          expect(combined.data).toEqual([]);
        }
      });
    });
  });

  describe('Utility Functions', () => {
    describe('unwrap', () => {
      it('should return data for success', () => {
        const result = success('test data');
        expect(unwrap(result)).toBe('test data');
      });

      it('should throw error for failure', () => {
        const error = new Error('test error');
        const result = failure(error);
        expect(() => unwrap(result)).toThrow(error);
      });
    });

    describe('unwrapOr', () => {
      it('should return data for success', () => {
        const result = success('test data');
        expect(unwrapOr(result, 'default')).toBe('test data');
      });

      it('should return default for failure', () => {
        const result = failure(new Error('test error'));
        expect(unwrapOr(result, 'default')).toBe('default');
      });
    });

    describe('unwrapOrElse', () => {
      it('should return data for success', () => {
        const result = success('test data');
        expect(unwrapOrElse(result, () => 'fallback')).toBe('test data');
      });

      it('should call fallback for failure', () => {
        const error = new Error('test error');
        const result = failure(error);
        const fallback = jest.fn(() => 'fallback');

        expect(unwrapOrElse(result, fallback)).toBe('fallback');
        expect(fallback).toHaveBeenCalledWith(error);
      });
    });
  });

  describe('Async Patterns', () => {
    describe('retry', () => {
      it('should succeed on first attempt', async () => {
        const operation = jest.fn(() =>
          safeAsync(() => Promise.resolve('success'))
        );
        const result = await retry(operation, 3);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('success');
        }
        expect(operation).toHaveBeenCalledTimes(1);
      });

      it('should retry on failure and succeed', async () => {
        let attempts = 0;
        const operation = jest.fn(() => {
          attempts++;
          if (attempts < 3) {
            return safeAsync(() => Promise.reject(new Error('fail')));
          }
          return safeAsync(() => Promise.resolve('success'));
        });

        const result = await retry(operation, 3, 10); // Fast retry for testing

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('success');
        }
        expect(operation).toHaveBeenCalledTimes(3);
      }, 1000);

      it('should fail after max attempts', async () => {
        const error = new Error('persistent error');
        const operation = jest.fn(() => safeAsync(() => Promise.reject(error)));

        const result = await retry(operation, 2, 10);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toBe(error);
        }
        expect(operation).toHaveBeenCalledTimes(2);
      }, 1000);
    });
  });

  describe('logResult', () => {
    const originalConsole = global.console;

    beforeEach(() => {
      jest.clearAllMocks();
      (global as typeof global & { __DEV__?: boolean }).__DEV__ = true;
    });

    afterAll(() => {
      global.console = originalConsole;
    });

    it('should return the same result', () => {
      const result = success('test data');
      const returned = logResult(result, 'TestContext');

      expect(returned).toBe(result);
    });

    it('should handle error result', () => {
      const error = new Error('test error');
      const result = failure(error);
      const returned = logResult(result, 'TestContext');

      expect(returned).toBe(result);
    });

    it('should use default context', () => {
      const result = success('test');
      const returned = logResult(result);

      expect(returned.success).toBe(true);
    });

    it('should not affect result in production', () => {
      (global as typeof global & { __DEV__?: boolean }).__DEV__ = false;
      const result = success('test');
      const returned = logResult(result);

      expect(returned).toBe(result);
    });
  });
});
