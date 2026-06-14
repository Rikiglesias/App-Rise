/**
 * ADAPTIVE COLORS — design tokens dark-aware
 *
 * Fornisce i `Colors` (designTokens) in forma DARK-AWARE senza cambiarne la forma:
 * - in LIGHT ritorna ESATTAMENTE `Colors` (stessa reference) → zero regressione visiva.
 * - in DARK inverte la scala `neutral` per luminosità (sfondi chiari→scuri, testi
 *   scuri→chiari) e ammorbidisce il `glass`; il BRAND (primary/gradients/semantic)
 *   resta invariato (il rosso Rise è leggibile anche su superfici scure).
 *
 * I valori dark della scala neutral sono allineati a UNIVERSAL_COLORS.dark
 * (primary #0C0C0E, card #2C2C2E, text #F5F5F5) per coerenza con PerfectContainer.
 *
 * Uso: sostituire `Colors`/`useTheme().colors` con `useThemeColors()` nei componenti.
 */
import { Colors } from '@/shared/constants/designTokens';

export type ThemeColors = typeof Colors;

// Scala neutral per DARK MODE: speculare alla scala light di designTokens.
// Stesse chiavi → la migrazione è meccanica (cambia solo la sorgente, non gli indici).
const DARK_NEUTRAL: typeof Colors.neutral = {
  0: '#0C0C0E', // light #FFFFFF — sfondo primario
  50: '#161618', // light #FAFAFA
  100: '#1F1F22', // light #F5F5F5 — superfici secondarie
  200: '#2C2C2E', // light #E5E5E5 — card / bordi chiari
  300: '#3A3A3D', // light #D4D4D4
  400: '#52525B', // light #A3A3A3
  500: '#737373', // light #737373 — mid, invariato
  600: '#A1A1AA', // light #525252 — testo secondario
  700: '#D4D4D4', // light #404040 — testo
  800: '#E5E5E5', // light #262626
  900: '#F5F5F5', // light #171717 — testo primario
  950: '#FAFAFA', // light #0A0A0A
};

// Glass overlay: su superfici scure servono velature più morbide.
const DARK_GLASS: typeof Colors.glass = {
  light: 'rgba(255, 255, 255, 0.06)',
  medium: 'rgba(255, 255, 255, 0.12)',
  dark: 'rgba(0, 0, 0, 0.4)',
  red: 'rgba(220, 38, 38, 0.18)',
};

/**
 * Ritorna i design tokens adattati al tema.
 * @param isDark true → palette dark (neutral invertiti + glass soft); false → `Colors` esatti.
 */
export const getAdaptiveColors = (isDark: boolean): ThemeColors =>
  isDark ? { ...Colors, neutral: DARK_NEUTRAL, glass: DARK_GLASS } : Colors;
