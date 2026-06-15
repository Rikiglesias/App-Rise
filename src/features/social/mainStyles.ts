import { StyleSheet } from 'react-native';

import { createMainStyles as createAboutMainStyles } from '../about/styles/mainStyles';
import { PerfectSpacing } from '@/shared/constants';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Stili principali per la sezione Social
 * Estende gli stili di About per consistenza grafica
 */
export const createMainStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // Eredita tutti gli stili da About per consistenza
    ...createAboutMainStyles(colors),

    // Override contentContainer per più spazio (4 bottoni social + header)
    contentContainer: {
      paddingHorizontal: PerfectSpacing.base,
      gap: PerfectSpacing.none,
      paddingTop: PerfectSpacing['4xl'],
      paddingBottom: PerfectSpacing['5xl'], // 80px - garantisce visibilità completa LinkedIn
    },

    // Stile specifico per la sezione social
    socialSection: {
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing['2xl'], // 32px - più respiro sotto ultima card
      gap: PerfectSpacing.base,
      paddingHorizontal: 0,
    },
  });
