import { StyleSheet } from 'react-native';

import { SpacingTokens as Spacing } from '../../../shared/constants/responsiveSystem';
import { mainStyles as aboutMainStyles } from '../../about/styles/mainStyles';

/**
 * Stili principali per la sezione Social
 * Estende gli stili di About per consistenza grafica
 */
export const mainStyles = StyleSheet.create({
  // Eredita tutti gli stili da About per consistenza
  ...aboutMainStyles,

  // Stile specifico per la sezione social
  socialSection: {
    marginTop: Spacing[6],
    marginBottom: Spacing[1],
    gap: Spacing[4],
    paddingHorizontal: 0,
  },
});
