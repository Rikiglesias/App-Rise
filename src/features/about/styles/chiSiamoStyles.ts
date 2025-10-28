import { StyleSheet } from 'react-native';

import {
  SpacingTokens as Spacing,
  TypographyTokens,
} from '../../../shared/constants/responsiveSystem';
import { Colors, Typography } from '../../../shared/constants';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';

/**
 * Stili per la sezione Chi Siamo
 * Design coordinato con la pagina azioni per consistenza
 */
export const chiSiamoSectionStyles = StyleSheet.create({
  categoryContainer: {
    marginBottom: Spacing[2], // SPACING COMPATTO ma armonioso
  },

  // HEADER CON SPACING OTTIMIZZATO
  headerContainer: {
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[2], // RIDOTTO: spazio compatto dopo la descrizione
    alignItems: 'center',
    position: 'relative',
  },

  // CONTAINER PRINCIPALE ELEGANTE COME PAGINA AZIONI
  titleHeaderContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.03)',
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.12)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
  },

  // CONTAINER TITOLO E ICONA - SPACING OTTIMIZZATO
  titleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
    marginBottom: Spacing[4], // AUMENTATO: spazio armonioso prima della descrizione
  },

  // AREA CLICCABILE PER IL TITOLO - NUOVA
  titleTouchableArea: {
    // Nessun background o bordi - solo area cliccabile
    paddingHorizontal: Spacing[2], // Piccolo padding per area touch più ampia
    paddingVertical: Spacing[1],
  },

  titleContainer: {
    position: 'relative',
    alignItems: 'center',
  },

  // TITOLO PRINCIPALE - DIMENSIONI BILANCIATE
  categoryTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: -1.0, // BILANCIATO per leggibilità
    includeFontPadding: false,
    // TEXT SHADOW ELEGANTE
    textShadowColor: 'rgba(0, 0, 0, 0.10)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },

  // ACCENTO ROSSO POTENZIATO
  titleAccent: {
    color: '#DC2626',
    // TEXT SHADOW ROSSO coordinato
    textShadowColor: 'rgba(220, 38, 38, 0.25)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },

  // CONTAINER PER SUBTITLE CON ICONA INFO
  subtitleWithInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  // CONTAINER CLICCABILE ELEGANTE COME PAGINA AZIONI
  titleClickableContainer: {
    alignItems: 'center',
    flex: 1,
  },

  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitleInline: {
    // fontSize gestito da PerfectText
    fontWeight: Typography.weights.medium,
    color: '#B91C1C', // ROSSO PIÙ SCURO COORDINATO
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: Spacing[1],
    opacity: 0.8,
  },

  // SUBTITLE - SPACING E STILE OTTIMIZZATI (LEGACY)
  mainSubtitle: {
    // fontSize gestito da PerfectText
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: 0.3,
    fontStyle: 'italic',
    lineHeight: 24, // AUMENTATO per migliore leggibilità
    // SUBTLE TEXT SHADOW
    textShadowColor: 'rgba(0, 0, 0, 0.06)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ICONA INFO PER SUBTITLE
  infoIconSubtitle: {
    marginLeft: Spacing[2],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.8)',
  },

  // ICONA INFO - ULTERIORMENTE ALZATA E SPOSTATA A SINISTRA
  infoIconImproved: {
    position: 'absolute',
    right: Spacing[1], // ULTERIORMENTE A SINISTRA: da Spacing[2] a Spacing[1]
    top: Spacing[1], // ULTERIORMENTE ALZATA: da Spacing[2] a Spacing[1]
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    ...PlatformShadows.primary, // CONVERTITO: ombra primaria ottimizzata per entrambe le piattaforme
    // BORDO PULITO
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },

  categorySubtitle: {
    fontSize: TypographyTokens.styles.body.medium,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight:
      Typography.lineHeights.relaxed * TypographyTokens.styles.body.medium,
    marginBottom: Spacing[3],
    paddingHorizontal: Spacing[4],
    fontStyle: 'normal',
    color: '#DC2626',
    backgroundColor: 'rgba(220, 38, 38, 0.04)',
    paddingVertical: Spacing[3],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.15)',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
});
