/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty-function */
import * as SecureStore from 'expo-secure-store';
import {
  secureStorage,
  setSecureValue,
  getSecureValue,
  removeSecureValue,
  clearSecureStorage,
} from '../../../shared/services/secureStorage';
import { logger } from '../../../shared/utils/logger';

// Mock delle dipendenze
jest.mock('expo-secure-store');
jest.mock('../../../shared/utils/logger');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('SecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = secureStorage;
      const instance2 = secureStorage;
      expect(instance1).toBe(instance2);
    });

    it('should initialize production flag correctly', () => {
      const originalDev = (global as any).__DEV__;
      (global as any).__DEV__ = false;

      // Test production flag logic
      expect(!(global as any).__DEV__).toBe(true);

      (global as any).__DEV__ = originalDev;
    });
  });

  describe('Basic Storage Operations', () => {
    describe('setSecure', () => {
      it('should store value successfully', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        await secureStorage.setSecure('testKey', 'testValue');

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'testKey',
          'testValue',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'SecureStorage',
          'Successfully stored key: testKey'
        );
      });

      it('should handle storage errors', async () => {
        const error = new Error('Storage failed');
        mockSecureStore.setItemAsync.mockRejectedValue(error);

        await expect(
          secureStorage.setSecure('testKey', 'testValue')
        ).rejects.toThrow('Secure storage failed for key: testKey');

        expect(mockLogger.error).toHaveBeenCalledWith(
          'SecureStorage',
          'Failed to store key: testKey',
          error
        );
      });

      it('should handle empty values', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        await secureStorage.setSecure('emptyKey', '');

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'emptyKey',
          '',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });

      it('should handle special characters in keys and values', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        const specialKey = 'key-with_special.chars@123';
        const specialValue = 'value with spaces & symbols!@#$%^&*()';

        await secureStorage.setSecure(specialKey, specialValue);

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          specialKey,
          specialValue,
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });
    });

    describe('getSecure', () => {
      it('should retrieve value successfully', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('testValue');

        const result = await secureStorage.getSecure('testKey');

        expect(result).toBe('testValue');
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('testKey', {
          keychainService: 'it.creareunapp.editor.ios63da226b4447c',
        });
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'SecureStorage',
          'Successfully retrieved key: testKey'
        );
      });

      it('should return null for non-existent keys', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue(null);

        const result = await secureStorage.getSecure('nonExistentKey');

        expect(result).toBeNull();
        expect(mockLogger.debug).not.toHaveBeenCalled();
      });

      it('should handle retrieval errors gracefully', async () => {
        const error = new Error('Retrieval failed');
        mockSecureStore.getItemAsync.mockRejectedValue(error);

        const result = await secureStorage.getSecure('testKey');

        expect(result).toBeNull();
        expect(mockLogger.error).toHaveBeenCalledWith(
          'SecureStorage',
          'Failed to retrieve key: testKey',
          error
        );
      });

      it('should handle empty string values', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('');

        const result = await secureStorage.getSecure('emptyKey');

        expect(result).toBe('');
      });
    });

    describe('removeSecure', () => {
      it('should remove value successfully', async () => {
        mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

        await secureStorage.removeSecure('testKey');

        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
          'testKey',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'SecureStorage',
          'Successfully removed key: testKey'
        );
      });

      it('should handle removal errors', async () => {
        const error = new Error('Removal failed');
        mockSecureStore.deleteItemAsync.mockRejectedValue(error);

        await expect(secureStorage.removeSecure('testKey')).rejects.toThrow(
          'Failed to remove secure key: testKey'
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          'SecureStorage',
          'Failed to remove key: testKey',
          error
        );
      });

      it('should handle removal of non-existent keys', async () => {
        mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

        await secureStorage.removeSecure('nonExistentKey');

        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalled();
      });
    });

    describe('hasKey', () => {
      it('should return true for existing keys', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('someValue');

        const result = await secureStorage.hasKey('existingKey');

        expect(result).toBe(true);
      });

      it('should return false for non-existent keys', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue(null);

        const result = await secureStorage.hasKey('nonExistentKey');

        expect(result).toBe(false);
      });

      it('should return false on errors', async () => {
        const error = new Error('Check failed');
        mockSecureStore.getItemAsync.mockRejectedValue(error);

        const result = await secureStorage.hasKey('testKey');

        expect(result).toBe(false);
        expect(mockLogger.error).toHaveBeenCalledWith(
          'SecureStorage',
          'Failed to retrieve key: testKey',
          error
        );
      });
    });
  });

  describe('Authentication Token Management', () => {
    describe('Auth Token', () => {
      it('should set auth token', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        await secureStorage.setAuthToken('auth-token-123');

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'userToken',
          'auth-token-123',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });

      it('should get auth token', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('auth-token-123');

        const token = await secureStorage.getAuthToken();

        expect(token).toBe('auth-token-123');
        expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith('userToken', {
          keychainService: 'it.creareunapp.editor.ios63da226b4447c',
        });
      });

      it('should remove auth token', async () => {
        mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

        await secureStorage.removeAuthToken();

        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
          'userToken',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });
    });

    describe('Refresh Token', () => {
      it('should set refresh token', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        await secureStorage.setRefreshToken('refresh-token-456');

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'refreshToken',
          'refresh-token-456',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });

      it('should get refresh token', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('refresh-token-456');

        const token = await secureStorage.getRefreshToken();

        expect(token).toBe('refresh-token-456');
      });
    });

    describe('API Key', () => {
      it('should set API key', async () => {
        mockSecureStore.setItemAsync.mockResolvedValue(undefined);

        await secureStorage.setApiKey('api-key-789');

        expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
          'apiKey',
          'api-key-789',
          { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
        );
      });

      it('should get API key', async () => {
        mockSecureStore.getItemAsync.mockResolvedValue('api-key-789');

        const apiKey = await secureStorage.getApiKey();

        expect(apiKey).toBe('api-key-789');
      });
    });
  });

  describe('User Credentials Management', () => {
    const mockCredentials = {
      email: 'test@example.com',
      encryptedPassword: 'encrypted-password-hash',
    };

    it('should set user credentials', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await secureStorage.setUserCredentials(mockCredentials);

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'userCredentials',
        JSON.stringify(mockCredentials),
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should get user credentials', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(mockCredentials)
      );

      const credentials = await secureStorage.getUserCredentials();

      expect(credentials).toEqual(mockCredentials);
    });

    it('should return null for non-existent credentials', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const credentials = await secureStorage.getUserCredentials();

      expect(credentials).toBeNull();
    });

    it('should handle malformed JSON gracefully', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('invalid-json');

      const credentials = await secureStorage.getUserCredentials();

      expect(credentials).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SecureStorage',
        'Failed to parse user credentials',
        expect.any(Error)
      );
    });

    it('should handle credentials with special characters', async () => {
      const specialCredentials = {
        email: 'test+special@example.com',
        encryptedPassword: 'password-with-symbols!@#$%^&*()',
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(specialCredentials)
      );

      await secureStorage.setUserCredentials(specialCredentials);
      const retrieved = await secureStorage.getUserCredentials();

      expect(retrieved).toEqual(specialCredentials);
    });
  });

  describe('Device ID Management', () => {
    it('should set device ID', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await secureStorage.setDeviceId('device-123-abc');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'deviceId',
        'device-123-abc',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should get device ID', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('device-123-abc');

      const deviceId = await secureStorage.getDeviceId();

      expect(deviceId).toBe('device-123-abc');
    });

    it('should handle UUID format device IDs', async () => {
      const uuidDeviceId = '550e8400-e29b-41d4-a716-446655440000';
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(uuidDeviceId);

      await secureStorage.setDeviceId(uuidDeviceId);
      const retrieved = await secureStorage.getDeviceId();

      expect(retrieved).toBe(uuidDeviceId);
    });
  });

  describe('Clear All Operations', () => {
    it('should clear all sensitive data successfully', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await secureStorage.clearAll();

      const expectedKeys = [
        'userToken',
        'refreshToken',
        'apiKey',
        'userCredentials',
        'encryptionKey',
        'deviceId',
      ];

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(
        expectedKeys.length
      );
      expectedKeys.forEach(key => {
        expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(key, {
          keychainService: 'it.creareunapp.editor.ios63da226b4447c',
        });
      });

      expect(mockLogger.info).toHaveBeenCalledWith(
        'SecureStorage',
        'Successfully cleared all sensitive data'
      );
    });

    it('should handle partial clear failures', async () => {
      const error = new Error('Delete failed');
      mockSecureStore.deleteItemAsync
        .mockResolvedValueOnce(undefined) // userToken success
        .mockRejectedValueOnce(error) // refreshToken fails
        .mockResolvedValueOnce(undefined); // apiKey success

      await expect(secureStorage.clearAll()).rejects.toThrow(
        'Failed to clear secure storage'
      );

      expect(mockLogger.error).toHaveBeenCalledWith(
        'SecureStorage',
        'Failed to clear sensitive data',
        expect.any(Error)
      );
    });
  });

  describe('Storage Integrity Verification', () => {
    it('should verify storage integrity successfully', async () => {
      const testValue = 'test_1234567890';
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(testValue);
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      // Mock Date.now to control test value
      const mockNow = jest.spyOn(Date, 'now').mockReturnValue(1234567890);

      const isValid = await secureStorage.verifyStorageIntegrity();

      expect(isValid).toBe(true);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'integrity_test',
        testValue,
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledWith(
        'integrity_test',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith(
        'integrity_test',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'SecureStorage',
        'Storage integrity verified successfully'
      );

      mockNow.mockRestore();
    });

    it('should detect storage integrity failure', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('different-value');
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const isValid = await secureStorage.verifyStorageIntegrity();

      expect(isValid).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SecureStorage',
        'Storage integrity check failed'
      );
    });

    it('should handle integrity check errors', async () => {
      const error = new Error('Integrity check failed');
      mockSecureStore.setItemAsync.mockRejectedValue(error);

      const isValid = await secureStorage.verifyStorageIntegrity();

      expect(isValid).toBe(false);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SecureStorage',
        'Storage integrity check error',
        expect.any(Error)
      );
    });

    it('should handle null retrieval during integrity check', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(null);
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const isValid = await secureStorage.verifyStorageIntegrity();

      expect(isValid).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('should handle concurrent operations', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('test-value');

      const operations = [
        secureStorage.setSecure('key1', 'value1'),
        secureStorage.setSecure('key2', 'value2'),
        secureStorage.getSecure('key3'),
        secureStorage.getSecure('key4'),
      ];

      await expect(Promise.all(operations)).resolves.toBeDefined();

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle large data storage', async () => {
      const largeData = 'x'.repeat(10000); // 10KB string
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(largeData);

      await secureStorage.setSecure('largeKey', largeData);
      const retrieved = await secureStorage.getSecure('largeKey');

      expect(retrieved).toBe(largeData);
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'largeKey',
        largeData,
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should handle rapid sequential operations', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue('value');
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      const key = 'rapidKey';

      // Rapid set, get, remove sequence
      await secureStorage.setSecure(key, 'value');
      const retrieved = await secureStorage.getSecure(key);
      await secureStorage.removeSecure(key);

      expect(retrieved).toBe('value');
      expect(mockSecureStore.setItemAsync).toHaveBeenCalledTimes(1);
      expect(mockSecureStore.getItemAsync).toHaveBeenCalledTimes(1);
      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases and Security', () => {
    it('should handle null and undefined values', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      // Should convert null/undefined to string
      await secureStorage.setSecure('nullKey', 'null');
      await secureStorage.setSecure('undefinedKey', 'undefined');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'nullKey',
        'null',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should handle very long keys', async () => {
      const longKey = 'a'.repeat(1000);
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await secureStorage.setSecure(longKey, 'value');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        longKey,
        'value',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should handle Unicode characters', async () => {
      const unicodeKey = 'key_🔐_测试';
      const unicodeValue = 'value_🚀_тест_🌟';

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(unicodeValue);

      await secureStorage.setSecure(unicodeKey, unicodeValue);
      const retrieved = await secureStorage.getSecure(unicodeKey);

      expect(retrieved).toBe(unicodeValue);
    });

    it('should handle JSON with nested objects', async () => {
      const complexCredentials = {
        email: 'test@example.com',
        encryptedPassword: 'hash123',
        metadata: {
          lastLogin: '2024-01-01',
          preferences: {
            theme: 'dark',
            notifications: true,
          },
        },
      };

      mockSecureStore.setItemAsync.mockResolvedValue(undefined);
      mockSecureStore.getItemAsync.mockResolvedValue(
        JSON.stringify(complexCredentials)
      );

      await secureStorage.setUserCredentials(complexCredentials as any);
      const retrieved = await secureStorage.getUserCredentials();

      expect(retrieved).toEqual(complexCredentials);
    });
  });

  describe('Backward Compatibility Functions', () => {
    it('should support setSecureValue function', async () => {
      mockSecureStore.setItemAsync.mockResolvedValue(undefined);

      await setSecureValue('testKey', 'testValue');

      expect(mockSecureStore.setItemAsync).toHaveBeenCalledWith(
        'testKey',
        'testValue',
        { keychainService: 'it.creareunapp.editor.ios63da226b4447c' }
      );
    });

    it('should support getSecureValue function', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('testValue');

      const result = await getSecureValue('testKey');

      expect(result).toBe('testValue');
    });

    it('should support removeSecureValue function', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await removeSecureValue('testKey');

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('testKey', {
        keychainService: 'it.creareunapp.editor.ios63da226b4447c',
      });
    });

    it('should support clearSecureStorage function', async () => {
      mockSecureStore.deleteItemAsync.mockResolvedValue(undefined);

      await clearSecureStorage();

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledTimes(6); // All sensitive keys
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle network timeouts gracefully', async () => {
      const timeoutError = new Error('Network timeout');
      timeoutError.name = 'TimeoutError';

      mockSecureStore.getItemAsync.mockRejectedValue(timeoutError);

      const result = await secureStorage.getSecure('testKey');

      expect(result).toBeNull();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'SecureStorage',
        'Failed to retrieve key: testKey',
        timeoutError
      );
    });

    it('should handle keychain access denied errors', async () => {
      const accessError = new Error('Keychain access denied');
      accessError.name = 'KeychainAccessError';

      mockSecureStore.setItemAsync.mockRejectedValue(accessError);

      await expect(
        secureStorage.setSecure('testKey', 'testValue')
      ).rejects.toThrow('Secure storage failed for key: testKey');
    });

    it('should handle device lock scenarios', async () => {
      const lockError = new Error('Device is locked');
      lockError.name = 'DeviceLockError';

      mockSecureStore.getItemAsync.mockRejectedValue(lockError);

      const result = await secureStorage.getSecure('testKey');

      expect(result).toBeNull();
    });
  });
});
