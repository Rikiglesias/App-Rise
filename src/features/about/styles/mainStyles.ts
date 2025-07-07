import { Platform, StyleSheet } from 'react-native';

import { SpacingTokens as Spacing } from '../../../shared/constants/responsiveSystem';
import { BorderRadius, Colors } from '../../../shared/constants';

/**
 * Stili principali per la sezione About
 * Layout base, containers e separatori comuni
 */
export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
  },

  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 40 : 60, // ANDROID: 40 come regolato / iOS: 60 più in basso
    left: Spacing[4],
    padding: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.neutral[0],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },

  contentContainer: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[0],
    paddingTop: Platform.OS === 'android' ? Spacing[20] : Spacing[12], // ANDROID: Spacing[20] / iOS: Spacing[12] più in alto
    paddingBottom: Platform.OS === 'android' ? Spacing[24] : Spacing[12], // ANDROID: Spacing[24] per evitare sovrapposizione bottom navigation / iOS: Spacing[12] normale
  },

  // SEPARATORE TRA SEZIONI - IDENTICO PAGINA AZIONI
  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4], // IDENTICO PAGINA AZIONI: spazio equilibrato per separazione
    alignItems: 'center',
  },

  // LINEA SEPARATRICE - IDENTICA PAGINA AZIONI
  sectionDivider: {
    height: 2, // IDENTICO PAGINA AZIONI: altezza bilanciata
    backgroundColor: Colors.neutral[300], // IDENTICO PAGINA AZIONI: più soft per eleganza
    width: '60%', // IDENTICO PAGINA AZIONI: bilanciato per proporzioni migliori
    borderRadius: 1, // IDENTICO PAGINA AZIONI
    opacity: 0.8, // IDENTICO PAGINA AZIONI: sottile trasparenza per delicatezza
    // OMBRA ELEGANTE IDENTICA PAGINA AZIONI
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
});
