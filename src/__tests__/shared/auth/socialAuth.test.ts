import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { TurboModuleRegistry } from 'react-native';

import {
  configureGoogle,
  getAppleIdToken,
  getGoogleIdToken,
  getAppleAuthCodeForDeletion,
} from '@/shared/auth/socialAuth';

// I moduli nativi social sono mockati globalmente in jest.setup.js
// (signInAsync -> identityToken, GoogleSignin.signIn -> success,
// TurboModuleRegistry.get('RNGoogleSignin') -> {} così la sonda di
// loadGoogleSignin passa). Qui controlliamo gli override per-scenario.
const signInAsyncMock = AppleAuthentication.signInAsync as jest.Mock;
const googleConfigureMock = GoogleSignin.configure as jest.Mock;
const googleSignInMock = GoogleSignin.signIn as jest.Mock;

describe('socialAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('configureGoogle', () => {
    it('modulo nativo presente: chiama GoogleSignin.configure con il webClientId', () => {
      configureGoogle('web-client-id-123');
      expect(googleConfigureMock).toHaveBeenCalledWith({
        webClientId: 'web-client-id-123',
      });
    });

    it('modulo nativo assente: non chiama configure (login Google disattivato)', () => {
      jest.spyOn(TurboModuleRegistry, 'get').mockReturnValueOnce(null);
      configureGoogle('web-client-id-123');
      expect(googleConfigureMock).not.toHaveBeenCalled();
    });
  });

  describe('getAppleIdToken', () => {
    it('ritorna l’identity token Apple', async () => {
      const token = await getAppleIdToken();
      expect(token).toBe('apple-token-mock');
      expect(signInAsyncMock).toHaveBeenCalledTimes(1);
    });

    it('successo SENZA identity token (misconfig): rilancia, non lo tratta come annullamento', async () => {
      signInAsyncMock.mockResolvedValueOnce({ identityToken: null });
      await expect(getAppleIdToken()).rejects.toThrow(
        'apple_no_identity_token'
      );
    });

    it('annullamento utente (ERR_REQUEST_CANCELED): ritorna null, non rilancia', async () => {
      signInAsyncMock.mockRejectedValueOnce({ code: 'ERR_REQUEST_CANCELED' });
      await expect(getAppleIdToken()).resolves.toBeNull();
    });

    it('errore reale (non annullamento): rilancia per farlo emergere', async () => {
      signInAsyncMock.mockRejectedValueOnce(new Error('apple network fail'));
      await expect(getAppleIdToken()).rejects.toThrow('apple network fail');
    });
  });

  describe('getGoogleIdToken', () => {
    it('successo: ritorna l’id-token Google', async () => {
      const token = await getGoogleIdToken();
      expect(token).toBe('google-token-mock');
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
    });

    it('annullato (type !== success): ritorna null', async () => {
      googleSignInMock.mockResolvedValueOnce({ type: 'cancelled' });
      const token = await getGoogleIdToken();
      expect(token).toBeNull();
    });

    it('successo SENZA id-token (misconfig): rilancia, non lo tratta come annullamento', async () => {
      googleSignInMock.mockResolvedValueOnce({
        type: 'success',
        data: { idToken: null },
      });
      await expect(getGoogleIdToken()).rejects.toThrow('google_no_id_token');
    });

    it('modulo nativo assente: ritorna null senza chiamare signIn', async () => {
      jest.spyOn(TurboModuleRegistry, 'get').mockReturnValueOnce(null);
      const token = await getGoogleIdToken();
      expect(token).toBeNull();
      expect(googleSignInMock).not.toHaveBeenCalled();
    });
  });

  describe('getAppleAuthCodeForDeletion', () => {
    it('ritorna l’authorizationCode per la cancellazione account', async () => {
      signInAsyncMock.mockResolvedValueOnce({
        authorizationCode: 'apple-auth-code-mock',
      });
      const code = await getAppleAuthCodeForDeletion();
      expect(code).toBe('apple-auth-code-mock');
      expect(signInAsyncMock).toHaveBeenCalledWith({ requestedScopes: [] });
    });

    it('ritorna null se l’authorizationCode manca', async () => {
      signInAsyncMock.mockResolvedValueOnce({ authorizationCode: null });
      const code = await getAppleAuthCodeForDeletion();
      expect(code).toBeNull();
    });

    it('annullamento utente durante la cancellazione: ritorna null (→ abort senza eliminare)', async () => {
      signInAsyncMock.mockRejectedValueOnce({ code: 'ERR_REQUEST_CANCELED' });
      await expect(getAppleAuthCodeForDeletion()).resolves.toBeNull();
    });
  });
});
