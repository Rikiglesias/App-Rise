import { NativeModules, PixelRatio } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { logger } from '../utils/logger';

let cachedDisplayZoomFactor = 1.0;
let initialized = false;

/**
 * Ritorna il fattore di Display Zoom calcolato (default 1.0 se sconosciuto).
 * 1.0 = base dispositivo (Norm), >1.0 = zoom attivo.
 */
export const getDisplayZoomFactor = (): number => cachedDisplayZoomFactor;

/**
 * Inizializza telemetria Display Zoom (JS-only, nessuna modifica funzionale).
 * Prova a leggere da modulo nativo se presente, altrimenti fallback 1.0.
 */
export const initDisplayZoom = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  try {
    const pixelRatio = PixelRatio.get();
    const fontScale = PixelRatio.getFontScale();

    // Tentativo modulo nativo opzionale (non ancora implementato):
    type DisplayZoomModule =
      | {
          getDisplayZoomFactor?: () => Promise<number>;
          getFactor?: () => Promise<number>;
        }
      | undefined;
    const NativeDisplayZoom = (
      NativeModules as unknown as { DisplayZoom?: DisplayZoomModule }
    ).DisplayZoom;

    if (NativeDisplayZoom) {
      const getFactorFn: (() => Promise<number>) | undefined =
        typeof NativeDisplayZoom.getDisplayZoomFactor === 'function'
          ? NativeDisplayZoom.getDisplayZoomFactor.bind(NativeDisplayZoom)
          : typeof NativeDisplayZoom.getFactor === 'function'
            ? NativeDisplayZoom.getFactor.bind(NativeDisplayZoom)
            : undefined;

      if (getFactorFn) {
        const factor: unknown = await getFactorFn();

        const asNumber =
          typeof factor === 'number' && isFinite(factor) ? factor : 1.0;
        cachedDisplayZoomFactor = asNumber > 0 ? asNumber : 1.0;
      } else {
        // No native getter available
        cachedDisplayZoomFactor = 1.0;
      }
    } else {
      // Fallback: se non c'è modulo nativo, usa 1.0
      // In production, Updates.manifest potrebbe non esistere - skip test factor
      cachedDisplayZoomFactor = 1.0;
      
      // Solo in development: prova eventuale fattore di test da extra
      try {
        const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : false;
        if (isDev) {
          const extra =
            (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
            (
              Updates as unknown as {
                manifest?: { extra?: Record<string, unknown> };
              }
            ).manifest?.extra;
          const testFactor = extra?.displayZoomTestFactor as number | undefined;
          if (
            typeof testFactor === 'number' &&
            isFinite(testFactor) &&
            testFactor > 0
          ) {
            cachedDisplayZoomFactor = testFactor;
          }
        }
      } catch {
        // Fail silently - mantieni 1.0
      }
    }

    logger.info('DisplayZoom initialized', 'DisplayZoom', {
      pixelRatio,
      fontScale,
      displayZoomFactor: cachedDisplayZoomFactor,
      nativeAvailable: !!NativeDisplayZoom,
    });
  } catch (err) {
    cachedDisplayZoomFactor = 1.0;
    logger.warn('DisplayZoom init failed, using 1.0', 'DisplayZoom', {
      error: String(err),
    });
  }
};

/**
 * Reinizializza su richiesta (es. ritorno in foreground se in futuro necessario).
 */
export const refreshDisplayZoom = async (): Promise<void> => {
  initialized = false;
  await initDisplayZoom();
};
