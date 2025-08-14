import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { PerfectText } from '../../../components/ui';
// rimosso: responsiveSystem/scaleDimensionLinear non necessari senza containerWidth
import { Spacing, Typography } from '../../../shared/constants/designTokens';
import {
  HEADER_TITLE_SIZE,
  HEADER_SUBTITLE_SIZE,
} from '../../shared/headerSizes';
import responsiveSystem, {
  scaleDimensionLinear,
} from '../../../shared/constants/responsiveSystem';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import {
  HEADER_VERTICAL_PADDING_FACTOR,
  HEADER_FIXED_HEIGHT_FACTOR,
  HEADER_TITLE_INTERLINE_FACTOR,
} from '../../shared/headerLayout';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

/**
 * Header della schermata Impact con titolo animato e gradient background
 */
const TITLE_SIZE = HEADER_TITLE_SIZE; // iPhone 15 base, scala millimetrica automatica
const SUBTITLE_SIZE = HEADER_SUBTITLE_SIZE; // iPhone 15 base, scala millimetrica automatica
const REF_WIDTH = responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393;
const HEADER_INNER_HEIGHT = scaleDimensionLinear(
  REF_WIDTH * HEADER_FIXED_HEIGHT_FACTOR
);
const HEADER_VERTICAL_PADDING = scaleDimensionLinear(
  REF_WIDTH * HEADER_VERTICAL_PADDING_FACTOR
);
const HEADER_TITLE_INTERLINE = scaleDimensionLinear(
  REF_WIDTH * HEADER_TITLE_INTERLINE_FACTOR
);

export const ImpactHeader: React.FC<Props> = ({ animations }) => {
  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']}
        style={styles.backgroundPattern}
      />

      <View style={styles.mainHeaderContainer}>
        <View style={styles.titleContainer}>
          <PerfectText
            size={TITLE_SIZE}
            lines={1}
            immunity={true}
            style={styles.titleText}
          >
            Il Nostro
          </PerfectText>
          <PerfectText
            size={TITLE_SIZE}
            lines={1}
            immunity={true}
            style={styles.titleAccent}
          >
            Impatto
          </PerfectText>
        </View>
        <PerfectText
          size={SUBTITLE_SIZE}
          maxSize={28}
          lines={1}
          immunity={true}
          style={styles.mainSubtitle}
        >
          Risultati concreti nella lotta contro la fame mondiale
        </PerfectText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  // Header - IDENTICO PAGINA AZIONI
  headerContainer: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[8], // ANDROID: spazio superiore ulteriormente aumentato
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6], // AUMENTATO: più spazio sotto il titolo principale
    alignItems: 'center',
    position: 'relative',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.02, // RIDOTTO per sottilità
  },
  // CONTAINER ELEGANTE COLORATO COME PAGINA AZIONI
  mainHeaderContainer: {
    alignSelf: 'stretch', // Forza larghezza 100% come pagina Azioni
    width: '100%',
    alignItems: 'center',
    height: HEADER_INNER_HEIGHT,
    backgroundColor:
      Platform.OS === 'android'
        ? '#F5F6F6' // ANDROID: Grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.03)', // iOS: Mantiene rgba originale
    paddingHorizontal: Spacing[4],
    paddingTop: HEADER_VERTICAL_PADDING, // AUMENTATO: allunga verticalmente senza allargare
    paddingBottom: HEADER_VERTICAL_PADDING, // AUMENTATO: allunga verticalmente senza allargare
    borderRadius: 16, // MODERNO COME PAGINA AZIONI
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? '#E8EAEB' // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(31, 41, 55, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: '#1F2937', // OMBRA GRIGIA COORDINATA
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // UNIFORMATO con ContributeHeader
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 1 : 3, // UNIFORMATO con ContributeHeader
  },
  // CONTAINER TITOLO - IMPAGINAZIONE ELEGANTE
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1], // UNIFORMATO a ContributeHeader
  },
  // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
  titleText: {
    fontWeight: Typography.weights.black, // RIPRISTINATO: black (900) per massimo grassetto come richiesto
    color: '#1F2937', // NERO per contrasto come richiesto
    textAlign: 'center',
    letterSpacing: -1.2, // UNIFORMATO con ContributeHeader
    lineHeight: 42, // UNIFORMATO con ContributeHeader
    marginBottom: HEADER_TITLE_INTERLINE,
    textShadowColor: 'rgba(31, 41, 55, 0.15)', // OMBRA SOTTILE
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  // ACCENTO ROSSO STRATEGICO - IDENTICO A titleText tranne colore
  titleAccent: {
    fontWeight: Typography.weights.black, // IDENTICO: black (900) per consistenza
    color: '#DC2626', // ROSSO BRAND per accento
    textAlign: 'center', // IDENTICO: per allineamento
    letterSpacing: -1.2, // UNIFORMATO: spaziatura caratteri
    lineHeight: 42, // UNIFORMATO con ContributeHeader
    textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false, // IDENTICO: per padding font
  },
  // SUBTITLE INLINE INGRANDITO E ELEGANTE
  mainSubtitle: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.medium, // MEDIUM COME PAGINA AZIONI
    color: '#374151', // GRIGIO COORDINATO COME PAGINA AZIONI
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 0, // UNIFORMATO con ContributeHeader
    opacity: 0.8, // TRASPARENZA ELEGANTE
    includeFontPadding: false,
  },
});
