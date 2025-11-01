/* eslint-disable @typescript-eslint/no-unsafe-return */
import * as SecureStore from 'expo-secure-store';
import type { SecureStoreOptions } from 'expo-secure-store';
import { logger } from '@/shared/utils/logger';

/**
 * SecureStorageManager - Gestione sicura dei dati sensibili
 *
 * Features:
 * - Crittografia AES per dati sensibili
 * - Storage sicuro con Expo SecureStore
 * - Gestione errori robusta
 * - Logging professionale
 * - Singleton pattern per performance
 */
const DEFAULT_IOS_KEYCHAIN_SERVICE = 'it.creareunapp.editor.ios63da226b4447c';
const resolveSecureStoreOptions = (): SecureStoreOptions => {
  const keychainService =
    typeof process.env.IOS_BUNDLE_IDENTIFIER === 'string'
      ? process.env.IOS_BUNDLE_IDENTIFIER
      : DEFAULT_IOS_KEYCHAIN_SERVICE;

  return {
    keychainService,
  };
};

class SecureStorageManager {
  private static instance: SecureStorageManager;
  private readonly isProduction: boolean;
  private readonly secureStoreOptions: SecureStoreOptions;

  private constructor() {
    this.isProduction = !__DEV__;
    this.secureStoreOptions = resolveSecureStoreOptions();
  }

  static getInstance(): SecureStorageManager {
    if (!SecureStorageManager.instance) {
      SecureStorageManager.instance = new SecureStorageManager();
    }
    return SecureStorageManager.instance;
  }

  /**
   * Salva un valore in modo sicuro
   */
  async setSecure(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, this.secureStoreOptions);

      logger.debug('SecureStorage', `Successfully stored key: ${key}`);
    } catch (error) {
      logger.error(
        'SecureStorage',
        `Failed to store key: ${key}`,
        error as Error
      );
      throw new Error(`Secure storage failed for key: ${key}`);
    }
  }

  /**
   * Recupera un valore sicuro
   */
  async getSecure(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(
        key,
        this.secureStoreOptions
      );

      if (value) {
        logger.debug('SecureStorage', `Successfully retrieved key: ${key}`);
      }

      return value;
    } catch (error) {
      logger.error(
        'SecureStorage',
        `Failed to retrieve key: ${key}`,
        error as Error
      );
      return null;
    }
  }

  /**
   * Rimuove un valore sicuro
   */
  async removeSecure(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key, this.secureStoreOptions);

      logger.debug('SecureStorage', `Successfully removed key: ${key}`);
    } catch (error) {
      logger.error(
        'SecureStorage',
        `Failed to remove key: ${key}`,
        error as Error
      );
      throw new Error(`Failed to remove secure key: ${key}`);
    }
  }

  /**
   * Verifica se una chiave esiste
   */
  async hasKey(key: string): Promise<boolean> {
    try {
      const value = await this.getSecure(key);
      return value !== null;
    } catch (error) {
      logger.error(
        'SecureStorage',
        `Failed to check key existence: ${key}`,
        error as Error
      );
      return false;
    }
  }

  /**
   * Pulisce tutti i dati sensibili dell'app
   */
  async clearAll(): Promise<void> {
    const sensitiveKeys = [
      'userToken',
      'refreshToken',
      'apiKey',
      'userCredentials',
      'encryptionKey',
      'deviceId',
    ];

    try {
      await Promise.all(sensitiveKeys.map(key => this.removeSecure(key)));

      logger.info('SecureStorage', 'Successfully cleared all sensitive data');
    } catch (error) {
      logger.error(
        'SecureStorage',
        'Failed to clear sensitive data',
        error as Error
      );
      throw new Error('Failed to clear secure storage');
    }
  }

  /**
   * Gestione sicura token di autenticazione
   */
  async setAuthToken(token: string): Promise<void> {
    await this.setSecure('userToken', token);
  }

  async getAuthToken(): Promise<string | null> {
    return await this.getSecure('userToken');
  }

  async removeAuthToken(): Promise<void> {
    await this.removeSecure('userToken');
  }

  /**
   * Gestione sicura refresh token
   */
  async setRefreshToken(token: string): Promise<void> {
    await this.setSecure('refreshToken', token);
  }

  async getRefreshToken(): Promise<string | null> {
    return await this.getSecure('refreshToken');
  }

  /**
   * Gestione sicura API key
   */
  async setApiKey(apiKey: string): Promise<void> {
    await this.setSecure('apiKey', apiKey);
  }

  async getApiKey(): Promise<string | null> {
    return await this.getSecure('apiKey');
  }

  /**
   * Gestione credenziali utente per login rapido
   */
  async setUserCredentials(credentials: {
    email: string;
    encryptedPassword: string;
  }): Promise<void> {
    const credentialsJson = JSON.stringify(credentials);
    await this.setSecure('userCredentials', credentialsJson);
  }

  async getUserCredentials(): Promise<{
    email: string;
    encryptedPassword: string;
  } | null> {
    try {
      const credentialsJson = await this.getSecure('userCredentials');
      return credentialsJson ? JSON.parse(credentialsJson) : null;
    } catch (error) {
      logger.error(
        'SecureStorage',
        'Failed to parse user credentials',
        error as Error
      );
      return null;
    }
  }

  /**
   * Gestione sicura device ID per tracking anonimo
   */
  async setDeviceId(deviceId: string): Promise<void> {
    await this.setSecure('deviceId', deviceId);
  }

  async getDeviceId(): Promise<string | null> {
    return await this.getSecure('deviceId');
  }

  /**
   * Verifica integrità storage e riparazione automatica
   */
  async verifyStorageIntegrity(): Promise<boolean> {
    try {
      // Test di scrittura/lettura per verificare che il storage funzioni
      const testKey = 'integrity_test';
      const testValue = `test_${Date.now()}`;

      await this.setSecure(testKey, testValue);
      const retrievedValue = await this.getSecure(testKey);
      await this.removeSecure(testKey);

      const isValid = retrievedValue === testValue;

      if (isValid) {
        logger.debug(
          'SecureStorage',
          'Storage integrity verified successfully'
        );
      } else {
        logger.error('SecureStorage', 'Storage integrity check failed');
      }

      return isValid;
    } catch (error) {
      logger.error(
        'SecureStorage',
        'Storage integrity check error',
        error as Error
      );
      return false;
    }
  }
}

// Singleton export
export const secureStorage = SecureStorageManager.getInstance();

// Convenience exports per backward compatibility
export const setSecureValue = (key: string, value: string) =>
  secureStorage.setSecure(key, value);
export const getSecureValue = (key: string) => secureStorage.getSecure(key);
export const removeSecureValue = (key: string) =>
  secureStorage.removeSecure(key);
export const clearSecureStorage = () => secureStorage.clearAll();
