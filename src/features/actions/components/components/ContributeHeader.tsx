/* eslint-disable react-native/no-unused-styles */
// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { PerfectText } from '../../../../components/ui';
import {
  HEADER_TITLE_SIZE,
  HEADER_SUBTITLE_SIZE,
} from '../../../shared/headerSizes';
import responsiveSystem, {
  scaleDimensionLinear,
} from '../../../../shared/constants/responsiveSystem';
// rimosso: responsiveSystem/scaleDimensionLinear non necessari senza containerWidth

import { LinearGradient } from 'expo-linear-gradient';

import { Spacing, Typography } from '../../../../shared/constants';
import {
  HEADER_VERTICAL_PADDING_FACTOR,
  HEADER_FIXED_HEIGHT_FACTOR,
  HEADER_TITLE_INTERLINE_FACTOR,
} from '../../../shared/headerLayout';

import type { useNewActionsAnimations } from './ContributeAnimations';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

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

const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        // HEADER CON SPAZIO AUMENTATO SU ANDROID
        headerContainer: {
          alignSelf: 'stretch',
          width: '100%',
          paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[8], // ANDROID: più spazio sopra
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[6], // UNIFORMATO: stesso paddingBottom di "Il Nostro Impatto"
          alignItems: 'center',
          position: 'relative',
        },

        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: Platform.OS === 'android' ? 0.01 : 0.02, // ANDROID: opacity ancora più bassa per evitare conflitti
        },

        // CONTAINER ELEGANTE COLORATO - UNIFORMATO CON PAGINA IMPATTO
        mainHeaderContainer: {
          alignSelf: 'stretch', // Forza larghezza 100% come pagina Impatto
          width: '100%',
          alignItems: 'center',
          height: HEADER_INNER_HEIGHT,
          backgroundColor:
            Platform.OS === 'android'
              ? '#F5F6F6' // ANDROID: Stesso grigio di "Il Nostro Impatto"
              : 'rgba(31, 41, 55, 0.03)', // iOS: Stesso rgba di "Il Nostro Impatto"
          paddingHorizontal: Spacing[4],
          paddingTop: HEADER_VERTICAL_PADDING,
          paddingBottom: HEADER_VERTICAL_PADDING,
          borderRadius: 16,
          borderWidth: 1, // UNIFORMATO: stesso spessore di "Il Nostro Impatto"
          borderColor:
            Platform.OS === 'android'
              ? '#E8EAEB' // ANDROID: Stesso bordo di "Il Nostro Impatto"
              : 'rgba(31, 41, 55, 0.08)', // iOS: Stesso rgba di "Il Nostro Impatto"
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // Solo ombra diversa per stabilità
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 1 : 3, // Solo elevation diversa per stabilità
        },

        // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
        titleText: {
          // fontSize rimosso - ora gestito da Text
          fontWeight: Typography.weights.black, // MASSIMO peso per autorità - IDENTICO A IMPATTO
          color: '#1F2937',
          textAlign: 'center',
          letterSpacing: -1.2, // IDENTICO A IMPATTO per coerenza
          lineHeight: 42, // AUMENTATO: da 30 a 42 per respirare meglio
          marginBottom: HEADER_TITLE_INTERLINE,
          textShadowColor: 'rgba(31, 41, 55, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          includeFontPadding: false,
        },

        // ACCENTO ROSSO STRATEGICO
        titleAccent: {
          color: '#DC2626', // ROSSO BRAND per accento
          textShadowColor: 'rgba(220, 38, 38, 0.15)', // OMBRA COORDINATA
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        },

        // SUBTITLE INLINE INGRANDITO E ELEGANTE
        mainSubtitle: {
          fontWeight: Typography.weights.medium, // MEDIUM COME PAGINA AZIONI
          color: '#374151', // GRIGIO COORDINATO COME PAGINA AZIONI
          textAlign: 'center',
          letterSpacing: 0,
          marginTop: 0, // ZERO: attaccato al titolo
          opacity: 0.8, // TRASPARENZA ELEGANTE
          includeFontPadding: false,
        },
      }),
    []
  );

  // CONTENUTO TITOLO
  const titleContent = (
    <>
      <PerfectText
        size={TITLE_SIZE}
        lines={1}
        immunity={true}
        style={styles.titleText}
      >
        Fai la
      </PerfectText>
      <PerfectText
        size={TITLE_SIZE}
        lines={1}
        immunity={true}
        style={[styles.titleText, styles.titleAccent]}
      >
        Differenza
      </PerfectText>
      <PerfectText
        size={SUBTITLE_SIZE}
        maxSize={28}
        lines={1}
        immunity={true}
        style={styles.mainSubtitle}
      >
        Ogni azione conta nella lotta contro la fame
      </PerfectText>
    </>
  );

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
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']} // NEUTRO per non disturbare
        style={styles.backgroundPattern}
      />

      {/* HEADER INTEGRATO PRINCIPALE - UNIFORMATO CON PAGINA IMPATTO */}
      <View style={styles.mainHeaderContainer}>{titleContent}</View>
    </Animated.View>
  );
};

export default NewActionsHeader;
