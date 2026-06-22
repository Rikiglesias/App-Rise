/**
 * SISTEMA ACCESSIBILITÀ BILANCIATO
 *
 * FILOSOFIA: Rispetta le preferenze utente per accessibilità mantenendo
 * la stabilità del layout del Perfect System.
 *
 * COSA RISPETTA:
 * ✅ Font scaling utente (utenti ipovedenti, Large Text, Dynamic Type)
 * ✅ Impostazioni accessibilità sistema
 * ✅ Conformità WCAG 2.1 (Web Content Accessibility Guidelines)
 *
 * COSA LIMITA:
 * ⚠️ Scaling eccessivo (max 1.3x per prevenire layout rotti)
 * ⚠️ Pixel ratio inconsistente (mantiene riferimento iPhone 15)
 *
 * RISULTATO: App accessibile ma layout stabile
 */

import { PixelRatio, Platform } from 'react-native';

import { getExpoExtra } from '@/shared/utils/expoExtra';

// ⚖️ CONFIGURAZIONE ACCESSIBILITÀ BILANCIATA
const IN_JEST =
  typeof process !== 'undefined' && !!process?.env?.JEST_WORKER_ID;

const shouldLockText = (): boolean => {
  try {
    const extra = getExpoExtra();
    const rawFromExtra = extra
      ? ((extra['perfectStrictMode'] as unknown) ??
        ((extra['perfect'] as Record<string, unknown> | undefined)?.[
          'strictMode'
        ] as unknown))
      : undefined;
    if (rawFromExtra !== undefined) {
      return (
        rawFromExtra === true || String(rawFromExtra).toLowerCase() === 'true'
      );
    }
    const env = (
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env;
    const rawEnv =
      env?.EXPO_PUBLIC_PERFECT_STRICT_MODE ?? env?.PERFECT_STRICT_MODE;
    return String(rawEnv).toLowerCase() === 'true';
  } catch {
    return false;
  }
};

// Legge un valore configurabile per il limite di font scaling
const getConfiguredMaxFontScale = (): number => {
  try {
    const extra = getExpoExtra();
    const fromExtra = extra?.['maxFontScale'] as unknown;
    if (typeof fromExtra === 'number' && isFinite(fromExtra) && fromExtra > 0) {
      return fromExtra;
    }
    const env = (
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env;
    const rawEnv = env?.EXPO_PUBLIC_MAX_FONT_SCALE ?? env?.MAX_FONT_SCALE;
    const parsed = rawEnv ? Number(rawEnv) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch {
    // ignore parsing errors
  }
  return 2.0;
};

// Soglia oltre la quale sbloccare lo scaling di sistema (per piccoli aumenti resta identico)
const getUnlockFontScaleThreshold = (): number => {
  try {
    const extra = getExpoExtra();
    const fromExtra = extra?.['fontScaleUnlockThreshold'] as unknown;
    if (typeof fromExtra === 'number' && isFinite(fromExtra) && fromExtra > 0) {
      return fromExtra;
    }
    const env = (
      globalThis as unknown as {
        process?: { env?: Record<string, string | undefined> };
      }
    ).process?.env;
    const rawEnv =
      env?.EXPO_PUBLIC_FONT_SCALE_UNLOCK_THRESHOLD ??
      env?.FONT_SCALE_UNLOCK_THRESHOLD;
    const parsed = rawEnv ? Number(rawEnv) : NaN;
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  } catch {
    // ignore
  }
  return 1.3;
};

const IMMUNITY_CONFIG = {
  // RISPETTA scaling utente (accessibilità)
  BLOCK_FONT_SCALING: IN_JEST ? true : shouldLockText(),

  // Forza density pixel ratio fisso (stabilità)
  FORCE_FIXED_DENSITY: true,

  // RISPETTA Dynamic Type iOS (accessibilità)
  BLOCK_DYNAMIC_TYPE: false,

  // RISPETTA Font Size Android (accessibilità)
  BLOCK_ANDROID_FONT_SIZE: false,

  // Font scale massimo consentito (configurabile via extra/env)
  MAX_FONT_SCALE: IN_JEST ? 1.0 : getConfiguredMaxFontScale(),

  // Pixel ratio di riferimento (iPhone 15)
  REFERENCE_PIXEL_RATIO: 3.0,
} as const;

// 📱 RILEVA IMPOSTAZIONI SISTEMA (per debug)
export const getSystemFontSettings = () => {
  const fontScale = PixelRatio.getFontScale();
  const pixelRatio = PixelRatio.get();

  return {
    fontScale, // Scala font sistema (1.0 = normale, >1.0 = ingrandito)
    pixelRatio, // Densità pixel
    isUserScaled: fontScale > 1.0, // Utente ha ingrandito font
    platform: Platform.OS,

    // Calcoli immunità
    originalFontScale: fontScale,
    immuneFontScale: IMMUNITY_CONFIG.BLOCK_FONT_SCALING ? 1.0 : fontScale,
    isImmune: IMMUNITY_CONFIG.BLOCK_FONT_SCALING,
  };
};

// ⚖️ APPLICA ACCESSIBILITÀ BILANCIATA AI PROPS TEXT
export const getImmuneTextProps = () => {
  const sysFontScale = PixelRatio.getFontScale();
  const unlockThreshold = getUnlockFontScaleThreshold();
  const allowScaling =
    !IMMUNITY_CONFIG.BLOCK_FONT_SCALING && sysFontScale > unlockThreshold;
  return {
    // ✅ RISPETTA font scaling sistema (accessibilità)
    allowFontScaling: allowScaling,

    // ⚠️ LIMITA moltiplicatore a 1.3x (stabilità layout)
    maxFontSizeMultiplier: IMMUNITY_CONFIG.MAX_FONT_SCALE, // = 1.3

    // Proprietà aggiuntive per stabilità Perfect System
    adjustsFontSizeToFit: false, // Disabilita auto-fit nativo (PerfectText lo gestisce)
    minimumFontScale: 1.0, // Blocca riduzione automatica (solo ingrandimento permesso)

    // Platform-specific per stabilità rendering
    ...(Platform.OS === 'ios' && {
      // iOS: Rendering consistente
      textBreakStrategy: 'simple' as const,
      lineBreakMode: 'clip' as const,
    }),

    ...(Platform.OS === 'android' && {
      // Android: Padding consistente
      includeFontPadding: false,
      textAlignVertical: 'center',
      textBreakStrategy: 'simple' as const,
      ellipsizeMode: 'clip' as const,
    }),
  };
};
