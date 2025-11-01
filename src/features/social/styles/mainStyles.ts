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

  // Stile specifico per la sezione social
  socialSection: {
    marginTop: PerfectSpacing.lg,
    marginBottom: PerfectSpacing.xs,
    gap: PerfectSpacing.base,
    paddingHorizontal: 0,
  },
});
