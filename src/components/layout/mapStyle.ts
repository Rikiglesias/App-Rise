/**
 * Style URL MapTiler per la mappa "Dove operiamo" (MapLibre).
 *
 * - Light/dark coerenti col tema app (style `dataviz` neutro: esalta i marker brand).
 * - Key via `EXPO_PUBLIC_MAPTILER_KEY` (client-side, inlined da Expo a build-time;
 *   limitarla per origin nella dashboard MapTiler — non è un segreto server).
 * - Senza key → fallback allo style demo MapLibre (no key) così la mappa renderizza
 *   comunque in dev/preview invece di restare vuota (graceful degradation).
 */
const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY ?? '';

// Style data-viz: neutro/pulito, marker rossi brand in risalto su scala mondiale.
const MAPTILER_STYLE_LIGHT = 'dataviz';
const MAPTILER_STYLE_DARK = 'dataviz-dark';

// Fallback senza key: style demo MapLibre (vector, no key, sempre disponibile).
const MAPLIBRE_DEMO_STYLE = 'https://demotiles.maplibre.org/style.json';

/**
 * Ritorna lo style URL della mappa per il tema corrente.
 * @param isDark true → style dark, false → style light.
 */
export const getMapStyleURL = (isDark: boolean): string => {
  if (!MAPTILER_KEY) {
    return MAPLIBRE_DEMO_STYLE;
  }
  const mapId = isDark ? MAPTILER_STYLE_DARK : MAPTILER_STYLE_LIGHT;
  return `https://api.maptiler.com/maps/${mapId}/style.json?key=${MAPTILER_KEY}`;
};

/** True se la key MapTiler è configurata (mappa brand attiva, non fallback demo). */
export const hasMapTilerKey = (): boolean => MAPTILER_KEY.length > 0;
