import * as AppleAuthentication from 'expo-apple-authentication';
import { TurboModuleRegistry } from 'react-native';

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
 * `EXPO_PUBLIC_GOOGLE_IOS_URL_SCHEME`) o su Expo Go il modulo nativo manca.
 *
 * Sonda con `TurboModuleRegistry.get` (NON-enforcing: ritorna null invece di
 * lanciare): se il nativo manca evitiamo del tutto il `require`, che altrimenti
 * farebbe stampare un Invariant Violation rumoroso (`getEnforcing`) nei log anche
 * se poi assorbito. Il try/catch resta come rete di sicurezza.
 */
const loadGoogleSignin = (): GoogleSigninModule | undefined => {
  // Su web (react-native-web) `TurboModuleRegistry` non è esportato → è `undefined`:
  // l'optional chaining evita il crash "Cannot read properties of undefined (reading
  // 'get')". Il modulo nativo RNGoogleSignin non esiste su web, quindi il login Google
  // resta inerte (come su Expo Go) senza buttare giù l'app.
  if (!TurboModuleRegistry?.get?.('RNGoogleSignin')) {
    return undefined;
  }
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

// Apple rigetta con `ERR_REQUEST_CANCELED` quando l'utente chiude lo sheet: è un
// "null" legittimo (nessun login), NON un errore da propagare. Ogni altro codice
// (rete, config, non disponibile) va RILANCIATO, così il chiamante mostra un
// feedback invece di trattare il fallimento come annullamento silenzioso — o, peggio,
// di lasciare una Promise rigettata non gestita che blocca lo spinner all'infinito.
const isAppleCancel = (e: unknown): boolean =>
  (e as { code?: string } | null)?.code === 'ERR_REQUEST_CANCELED';

/** Apple Sign In nativo → identity token (null se annullato; throw su errore reale). */
export const getAppleIdToken = async (): Promise<string | null> => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    return credential.identityToken ?? null;
  } catch (e) {
    if (isAppleCancel(e)) return null;
    throw e;
  }
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
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [],
    });
    return credential.authorizationCode ?? null;
  } catch (e) {
    if (isAppleCancel(e)) return null;
    throw e;
  }
};
