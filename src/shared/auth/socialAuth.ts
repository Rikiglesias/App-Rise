import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Wrapper nativi per il login social. Ritornano l'id-token da passare a
 * `supabase.auth.signInWithIdToken({ provider, token })`.
 * Nota: i provider NON forniscono telefono/città/provincia/data nascita →
 * dopo il primo accesso social serve lo step "Completa profilo".
 */

/** Configura Google sign-in con il web client ID (da chiamare al boot). */
export const configureGoogle = (webClientId: string): void => {
  GoogleSignin.configure({ webClientId });
};

/** Apple Sign In nativo → identity token (null se annullato/non disponibile). */
export const getAppleIdToken = async (): Promise<string | null> => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });
  return credential.identityToken ?? null;
};

/** Google Sign In nativo → id-token (null se annullato). v13+: { type, data }. */
export const getGoogleIdToken = async (): Promise<string | null> => {
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  return result.type === 'success' ? result.data.idToken ?? null : null;
};

/**
 * Fresh Apple sign-in al momento della cancellazione account → authorizationCode.
 * Serve alla Edge Function `delete-account` per revocare i token Apple
 * (signInWithIdToken non espone il refresh-token Apple). Null se annullato.
 */
export const getAppleAuthCodeForDeletion = async (): Promise<string | null> => {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [],
  });
  return credential.authorizationCode ?? null;
};
