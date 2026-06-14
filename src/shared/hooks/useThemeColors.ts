import { getAdaptiveColors, type ThemeColors } from '@/shared/theme/adaptiveColors';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';

/**
 * Hook per i design tokens DARK-AWARE (stessa forma di `Colors`).
 *
 * - in LIGHT === `Colors` (zero regressione)
 * - in DARK: scala `neutral` invertita + `glass` soft; brand (primary/gradients) invariato
 *
 * Migrazione dark mode: sostituire `Colors`/`useTheme().colors` con `useThemeColors()`.
 * Reattivo: si aggiorna automaticamente al cambio tema di sistema (Appearance).
 */
export const useThemeColors = (): ThemeColors => {
  const { isDark } = useUniversalTheme();
  return getAdaptiveColors(isDark);
};
