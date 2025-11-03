import { Colors } from '@/shared/constants/designTokens';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';

/**
 * Bridge hook per unificare accesso ai colori
 *
 * - universal: palette dinamica (light/dark) per superfici/testo
 * - brand: design tokens brand (rosso/neutri/gradients) stabili
 */
export const usePerfectTheme = () => {
  const { isDark, colors } = useUniversalTheme();
  return {
    isDark,
    universal: colors,
    brand: Colors,
  } as const;
};

export type PerfectTheme = ReturnType<typeof usePerfectTheme>;

