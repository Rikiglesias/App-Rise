/**
 * SSOT per l'accesso all'oggetto `extra` della config Expo.
 *
 * In dev e nelle build classiche la config vive in `Constants.expoConfig.extra`.
 * A runtime con EAS Update l'`extra` aggiornato arriva dal manifest OTA
 * (`Updates.manifest.extra`), che `expoConfig` può non riflettere: per questo
 * la lettura unifica i due percorsi (prima `expoConfig`, poi il manifest OTA).
 *
 * Questo modulo centralizza un pattern che era duplicato verbatim in 7 punti
 * (SystemImmunity, perfectScale, BottomTabNavigator, ActionCTAButtons).
 */

import Constants from 'expo-constants';
import * as Updates from 'expo-updates';

/** Oggetto `extra` di app.config: campi liberi + sezione `features` opzionale. */
export type ExpoExtra = Record<string, unknown> & {
  features?: Record<string, unknown>;
};

/**
 * Legge l'oggetto `extra` dalla config Expo, con fallback al manifest OTA.
 * @returns l'oggetto `extra` o `undefined` se non disponibile.
 */
export const getExpoExtra = (): ExpoExtra | undefined =>
  (Constants.expoConfig?.extra as ExpoExtra | undefined) ??
  (Updates as unknown as { manifest?: { extra?: ExpoExtra } }).manifest?.extra;

/**
 * Soglia di font scale oltre la quale lo scaling di sistema viene sbloccato.
 * Letta da `extra.fontScaleUnlockThreshold` (numero finito > 0), default `1.3`.
 * Usata dal layout della tab bar e dei CTA per adattarsi a font ingranditi.
 */
export const getFontScaleUnlockThreshold = (): number => {
  const value = getExpoExtra()?.['fontScaleUnlockThreshold'];
  return typeof value === 'number' && isFinite(value) && value > 0
    ? value
    : 1.3;
};
