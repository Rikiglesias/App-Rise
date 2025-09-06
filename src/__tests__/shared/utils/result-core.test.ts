/* eslint-disable max-lines-per-function, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any, require-await */
import {
  Result,
  success,
  failure,
  safeAsync,
  safe,
  withTimeout,
  isSuccess,
  isFailure,
  unwrap,
  unwrapOr,
  unwrapOrElse,
  map,
  mapError,
  chain,
  combine,
  logResult,
} from '../../../shared/utils/result';

describe('Result Pattern - Core Functions', () => {
  describe('Result Constructors', () => {
    it('should create success result', () => {
      const result = success('test data');

      expect(result.success).toBe(true);
      expect(result.data).toBe('test data');
      expect(result.error).toBeUndefined();
    });

    it('should create failure result', () => {
      const error = new Error('test error');
      const result = failure(error);

      expect(result.success).toBe(false);
      expect(result.error).toBe(error);
      expect(result.data).toBeUndefined();
    });

    it('should create success result with null value', () => {
      const result = success(null);

      expect(isSuccess(result)).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should create success result with object value', () => {
      const data = { id: 1, name: 'test' };
      const result = success(data);

      expect(isSuccess(result)).toBe(true);
      expect(result.data).toEqual(data);
    });

    it('should create failure result with string message', () => {
      const result = failure('error message');

      expect(isSuccess(result)).toBe(false);
      expect(isFailure(result)).toBe(true);
      expect(result.error).toBe('error message');
    });
  });

  describe('safeAsync', () => {
    it('should handle successful async operation', async () => {
      const operation = () => Promise.resolve('success data');
      const result = await safeAsync(operation);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success data');
      }
    });

    it('should handle failed async operation', async () => {
      const error = new Error('async error');
      const operation = () => Promise.reject(error);
      const result = await safeAsync(operation);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('should handle non-Error rejections', async () => {
      const operation = () => Promise.reject('string error');
      const result = await safeAsync(operation);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('string error');
      }
    });
  });

  describe('safe', () => {
    it('should handle successful sync operation', () => {
      const operation = () => 'sync success';
      const result = safe(operation);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('sync success');
      }
    });

    it('should handle failed sync operation', () => {
      const error = new Error('sync error');
      const operation = () => {
        throw error;
      };
      const result = safe(operation);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });

    it('should handle non-Error throws', () => {
      const operation = () => {
        throw 'string error';
      };
      const result = safe(operation);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe('string error');
      }
    });

    it('should handle JSON parsing safely', () => {
      const validJson = safe(() => JSON.parse('{"valid": "json"}'));
      expect(isSuccess(validJson)).toBe(true);
      expect(validJson.data).toEqual({ valid: 'json' });

      const invalidJson = safe(() => JSON.parse('invalid json'));
      expect(isFailure(invalidJson)).toBe(true);
      expect(invalidJson.error).toBeInstanceOf(Error);
    });
  });

  describe('withTimeout', () => {
    it('should complete before timeout', async () => {
      const operation = () => Promise.resolve('quick result');
      const result = await withTimeout(operation, 1000);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('quick result');
      }
    });

    it('should timeout slow operations', async () => {
      const operation = () =>
        new Promise(resolve => setTimeout(() => resolve('slow'), 100));
      const result = await withTimeout(operation, 50, 'Custom timeout message');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toBe('Custom timeout message');
      }
    }, 200);

    it('should use default timeout message', async () => {
      const operation = () =>
        new Promise(resolve => setTimeout(() => resolve('slow'), 100));
      const result = await withTimeout(operation, 50);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Operation timed out');
      }
    }, 200);
  });

  describe('Type Guards', () => {
    it('isSuccess should identify success results', () => {
      expect(isSuccess(success('data'))).toBe(true);
      expect(isSuccess(failure(new Error()))).toBe(false);
    });

    it('isFailure should identify failure results', () => {
      expect(isFailure(failure(new Error()))).toBe(true);
      expect(isFailure(success('data'))).toBe(false);
    });
  });

  describe('Utility functions', () => {
    describe('unwrap()', () => {
      it('should return value for success result', () => {
        const result = success('test');

        expect(unwrap(result)).toBe('test');
      });

      it('should throw error for failure result', () => {
        const result = failure('error');

        expect(() => unwrap(result)).toThrow('error');
      });
    });

    describe('unwrapOr()', () => {
      it('should return value for success result', () => {
        const result = success('success');

        expect(unwrapOr(result, 'default')).toBe('success');
      });

      it('should return default for failure result', () => {
        const result = failure('error');

        expect(unwrapOr(result, 'default')).toBe('default');
      });
    });

    describe('unwrapOrElse()', () => {
      it('should return value for success result', () => {
        const result = success('success');

        expect(unwrapOrElse(result, () => 'fallback')).toBe('success');
      });

      it('should call fallback for failure result', () => {
        const result = failure('error');
        const fallback = jest.fn(() => 'fallback');

        expect(unwrapOrElse(result, fallback)).toBe('fallback');
        expect(fallback).toHaveBeenCalledWith('error');
      });
    });
  });

  describe('Combinators', () => {
    describe('map()', () => {
      it('should transform success result value', () => {
        const result = success(5);
        const mapped = map(result, (x: number) => x * 2);

        expect(isSuccess(mapped)).toBe(true);
        expect(mapped.data).toBe(10);
      });

      it('should preserve failure result', () => {
        const result = failure('error');
        const mapped = map(result, (x: number) => x * 2);

        expect(isFailure(mapped)).toBe(true);
        expect(mapped.error).toBe('error');
      });
    });

    describe('mapError()', () => {
      it('should preserve success result', () => {
        const result = success('success');
        const mapped = mapError(result, (e: string) => `Error: ${e}`);

        expect(isSuccess(mapped)).toBe(true);
        expect(mapped.data).toBe('success');
      });

      it('should transform failure result', () => {
        const result = failure('original');
        const mapped = mapError(result, (e: string) => `Error: ${e}`);

        expect(isFailure(mapped)).toBe(true);
        expect(mapped.error).toBe('Error: original');
      });
    });

    describe('chain()', () => {
      it('should chain successful operations', () => {
        const result = success(5);
        const chained = chain(result, (x: number) => success(x * 2));

        expect(isSuccess(chained)).toBe(true);
        expect(chained.data).toBe(10);
      });

      it('should stop chaining on failure', () => {
        const result = failure('error');
        const chained = chain(result, (x: number) => success(x * 2));

        expect(isFailure(chained)).toBe(true);
        expect(chained.error).toBe('error');
      });

      it('should propagate chained failure', () => {
        const result = success(-5);
        const chained = chain(result, (x: number) =>
          x > 0 ? success(x * 2) : failure('negative number')
        );

        expect(isFailure(chained)).toBe(true);
        expect(chained.error).toBe('negative number');
      });
    });

    describe('combine()', () => {
      it('should combine successful results', () => {
        const results = [success(1), success(2), success(3)];
        const combined = combine(results);

        expect(isSuccess(combined)).toBe(true);
        expect(combined.data).toEqual([1, 2, 3]);
      });

      it('should fail if any result fails', () => {
        const results = [success(1), failure('error'), success(3)];
        const combined = combine(results);

        expect(isFailure(combined)).toBe(true);
        expect(combined.error).toBe('error');
      });

      it('should handle empty array', () => {
        const results: Result<number, string>[] = [];
        const combined = combine(results);

        expect(isSuccess(combined)).toBe(true);
        expect(combined.data).toEqual([]);
      });
    });
  });

  describe('Type safety', () => {
    it('should maintain type safety for different value types', () => {
      interface User {
        id: number;
        name: string;
      }

      const userResult: Result<User, string> = success({ id: 1, name: 'John' });

      expect(isSuccess(userResult)).toBe(true);
      if (isSuccess(userResult)) {
        const user = userResult.data;
        expect(user.id).toBe(1);
        expect(user.name).toBe('John');
      }
    });

    it('should handle async operations correctly', async () => {
      const asyncSuccess = (): Promise<Result<string, Error>> => {
        return Promise.resolve(success('async success'));
      };

      const asyncFailure = (): Promise<Result<string, Error>> => {
        return Promise.resolve(failure(new Error('async error')));
      };

      const successResult = await asyncSuccess();
      expect(isSuccess(successResult)).toBe(true);
      expect(successResult.data).toBe('async success');

      const errorResult = await asyncFailure();
      expect(isFailure(errorResult)).toBe(true);
      if (isFailure(errorResult)) {
        expect(errorResult.error.message).toBe('async error');
      }
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle API response parsing', () => {
      const parseApiResponse = (response: unknown): Result<User, string> => {
        if (!response || typeof response !== 'object')
          return failure('Empty response');
        const obj = response as Record<string, unknown>;
        if (!obj.id || typeof obj.id !== 'number')
          return failure('Missing user ID');
        if (!obj.name || typeof obj.name !== 'string')
          return failure('Missing user name');

        return success({ id: obj.id, name: obj.name });
      };

      interface User {
        id: number;
        name: string;
      }

      // Success case
      const validResponse = { id: 1, name: 'John' };
      const successResult = parseApiResponse(validResponse);
      expect(isSuccess(successResult)).toBe(true);
      expect(successResult.data).toEqual({ id: 1, name: 'John' });

      // Error cases
      const emptyResult = parseApiResponse(null);
      expect(isFailure(emptyResult)).toBe(true);
      expect(emptyResult.error).toBe('Empty response');

      const missingIdResult = parseApiResponse({ name: 'John' });
      expect(isFailure(missingIdResult)).toBe(true);
      expect(missingIdResult.error).toBe('Missing user ID');
    });

    it('should handle validation chains', () => {
      const validateEmail = (email: string): Result<string, string> => {
        if (!email) return failure('Email is required');
        if (!email.includes('@')) return failure('Invalid email format');
        return success(email);
      };

      const validateAge = (age: number): Result<number, string> => {
        if (age < 0) return failure('Age cannot be negative');
        if (age > 120) return failure('Age is too high');
        return success(age);
      };

      // Valid case
      const validEmail = validateEmail('test@example.com');
      const validAge = validateAge(25);

      expect(isSuccess(validEmail)).toBe(true);
      expect(isSuccess(validAge)).toBe(true);

      // Invalid cases
      const invalidEmail = validateEmail('invalid-email');
      const invalidAge = validateAge(-5);

      expect(isFailure(invalidEmail)).toBe(true);
      expect(invalidEmail.error).toBe('Invalid email format');
      expect(isFailure(invalidAge)).toBe(true);
      expect(invalidAge.error).toBe('Age cannot be negative');
    });

    it('should handle complex chaining scenarios', () => {
      const parseAndValidate = (input: string): Result<number, string> => {
        const safeParseResult = mapError(
          safe(() => parseInt(input, 10)),
          (error: Error) => error.message
        );

        return chain(safeParseResult, (num: number) => {
          if (isNaN(num)) return failure('Not a number');
          if (num < 0) return failure('Number must be positive');
          if (num > 100) return failure('Number too large');
          return success(num);
        });
      };

      // Valid case
      const validResult = parseAndValidate('42');
      expect(isSuccess(validResult)).toBe(true);
      expect(validResult.data).toBe(42);

      // Invalid cases
      const nanResult = parseAndValidate('not-a-number');
      expect(isFailure(nanResult)).toBe(true);

      const negativeResult = parseAndValidate('-5');
      expect(isFailure(negativeResult)).toBe(true);
      expect(negativeResult.error).toBe('Number must be positive');
    });
  });

  describe('Logging and debugging', () => {
    it('should log results correctly', () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const successResult = success('test data');
      const loggedSuccess = logResult(successResult, 'TestContext');

      expect(loggedSuccess).toBe(successResult);

      const failureResult = failure('test error');
      const loggedFailure = logResult(failureResult, 'TestContext');

      expect(loggedFailure).toBe(failureResult);

      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  });
});
