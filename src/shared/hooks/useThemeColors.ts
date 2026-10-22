import { useMemo } from 'react';
import { useWindowDimensions, type ScaledSize } from 'react-native';

import {
  getAdaptiveColors,
  type ThemeColors,
} from '@/shared/theme/adaptiveColors';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';

// Una copia per finestra: i valori restano quelli del tema, l'identità segue la finestra.
const perFinestra = (
  colors: ThemeColors,
  _finestra: ScaledSize
): ThemeColors => ({
  ...colors,
});

/**
 * I colori di `isDark` con un'identità nuova a ogni cambio di finestra (C54 del contratto android-play).
 *
 * Gli stili memorizzati sui colori (`useMemo(() => createStyles(colors), [colors])`, una quarantina di
 * posti) contengono misure di `scale()`, che legge la finestra di adesso: aprendo un pieghevole o
 * ridimensionando la finestra restavano alla misura del primo disegno. Iscrive anche il componente alla
 * finestra, così si aggiornano le misure calcolate durante il disegno.
 */
export const useAdaptiveColors = (isDark: boolean): ThemeColors => {
  const finestra = useWindowDimensions();
  return useMemo(
    () => perFinestra(getAdaptiveColors(isDark), finestra),
    [isDark, finestra]
  );
};

/**
 * Hook per i design tokens DARK-AWARE (stessa forma di `Colors`).
 *
 * - in LIGHT ha i valori di `Colors` (zero regressione)
 * - in DARK: scala `neutral` invertita + `glass` soft; brand (primary/gradients) invariato
 *
 * Migrazione dark mode: sostituire `Colors`/`useTheme().colors` con `useThemeColors()`.
 * Reattivo: si aggiorna al cambio tema di sistema (Appearance) e al cambio di finestra (sopra).
 */
export const useThemeColors = (): ThemeColors => {
  const { isDark } = useUniversalTheme();
  return useAdaptiveColors(isDark);
};
