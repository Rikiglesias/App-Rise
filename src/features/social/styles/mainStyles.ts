import { StyleSheet } from 'react-native';

import { mainStyles as aboutMainStyles } from '../../about/styles/mainStyles';
import { PerfectSpacing } from '@/shared/constants';

/**
 * Stili principali per la sezione Social
 * Estende gli stili di About per consistenza grafica
 */
export const mainStyles = StyleSheet.create({
  // Eredita tutti gli stili da About per consistenza
  ...aboutMainStyles,

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
