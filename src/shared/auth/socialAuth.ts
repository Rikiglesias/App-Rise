import * as AppleAuthentication from 'expo-apple-authentication';

import { logWarn } from '../utils/logger';
// NB: @react-native-google-signin/google-signin è importato in modo LAZY (dynamic
// import dentro le funzioni Google) — NON staticamente qui. Il suo modulo nativo
// RNGoogleSignin non esiste in Expo Go: un import statico chiamerebbe
// TurboModuleRegistry.getEnforcing al bundle-eval → red-screen al boot. Caricandolo
// lazy l'app avvia su Expo Go e il path Google resta inerte finché non lo si invoca
// su un dev/preview build nativo.

/**
 * Wrapper nativi per il login social. Ritornano l'id-token da passare a
 * `supabase.auth.signInWithIdToken({ provider, token })`.
 * Nota: i provider NON forniscono telefono/città/provincia/data nascita →
 * dopo il primo accesso social serve lo step "Completa profilo".
 */

type GoogleSigninModule =
  typeof import('@react-native-google-signin/google-signin').GoogleSignin;

/**
 * Carica `GoogleSignin` SOLO se il modulo nativo è presente nel binario, altrimenti
 * `undefined`. Nei build senza il config plugin google-signin (env senza
 * `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`) o su Expo Go il modulo nativo manca e il
 * `require` lancia `TurboModuleRegistry.getEnforcing` → qui viene assorbito così
 * l'app NON crasha al boot e il login Google resta semplicemente inerte.
 */
const loadGoogleSignin = (): GoogleSigninModule | undefined => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
    const mod = require('@react-native-google-signin/google-signin');
    const { GoogleSignin } = mod;
    return GoogleSignin;
  } catch {
    return undefined;
  }
};

/** Configura Google sign-in con il web client ID (da chiamare al boot). */
export const configureGoogle = (webClientId: string): void => {
  const GoogleSignin = loadGoogleSignin();
  if (!GoogleSignin) {
    logWarn(
      'Modulo google-signin nativo assente: login Google disattivato',
      'socialAuth'
    );
    return;
  }
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
  const GoogleSignin = loadGoogleSignin();
  if (!GoogleSignin) {
    logWarn('Login Google non disponibile su questo build', 'socialAuth');
    return null;
  }
  await GoogleSignin.hasPlayServices();
  const result = await GoogleSignin.signIn();
  return result.type === 'success' ? (result.data.idToken ?? null) : null;
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
