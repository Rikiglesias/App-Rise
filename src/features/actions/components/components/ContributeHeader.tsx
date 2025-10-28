// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';
import { PerfectText } from '../../../../components/ui';
import {
  HEADER_TITLE_SIZE,
  CONTRIBUTE_SUBTITLE_SIZE,
} from '../../../shared/headerSizes';
import responsiveSystem, {
  scaleDimensionLinear,
  TypographyTokens,
} from '../../../../shared/constants/responsiveSystem';

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
const SUBTITLE_SIZE = CONTRIBUTE_SUBTITLE_SIZE; // iPhone 15 base, scala millimetrica automatica
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
        // HEADER CON SPAZIO AUMENTATO MOLTO SU ANDROID E iOS
        headerContainer: {
          alignSelf: 'stretch',
          width: '100%',
          paddingTop: Spacing[20] + 12,
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[6],
          alignItems: 'center',
          position: 'relative',
        },

        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.02,
        },

        // CONTAINER ELEGANTE COLORATO - UNIFORMATO CON PAGINA IMPATTO
        mainHeaderContainer: {
          alignSelf: 'stretch',
          width: '100%',
          alignItems: 'center',
          height: HEADER_INNER_HEIGHT,
          backgroundColor: 'rgba(31, 41, 55, 0.03)',
          paddingHorizontal: Spacing[4],
          paddingTop: HEADER_VERTICAL_PADDING,
          paddingBottom: HEADER_VERTICAL_PADDING,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(31, 41, 55, 0.08)',
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
          elevation: 3,
        },

        // TIPOGRAFIA POTENTE E MODERNA - BILANCIATA
        titleText: {
          fontWeight: Typography.weights.black,
          color: '#1F2937',
          textAlign: 'center',
          letterSpacing: TypographyTokens.letterSpacing.tight,
          lineHeight: TypographyTokens.lineHeights.baseline(HEADER_TITLE_SIZE),
          marginBottom: HEADER_TITLE_INTERLINE,
          textShadowColor: 'rgba(31, 41, 55, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
          includeFontPadding: false,
        },

        // ACCENTO ROSSO STRATEGICO
        titleAccent: {
          color: '#DC2626',
          textShadowColor: 'rgba(220, 38, 38, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        },

        // SUBTITLE INLINE INGRANDITO E ELEGANTE
        mainSubtitle: {
          fontWeight: Typography.weights.medium,
          color: '#374151',
          textAlign: 'center',
          letterSpacing: TypographyTokens.letterSpacing.normal,
          lineHeight: TypographyTokens.lineHeights.baseline(
            CONTRIBUTE_SUBTITLE_SIZE
          ),
          marginTop: Spacing[3],
          opacity: 0.8,
          includeFontPadding: false,
        },
      }),
    []
  );

  const titleContent = (
    <>
      <PerfectText
        size={TITLE_SIZE}
        lines={1}
        immunity={true}
        fontWeight="600"
        style={styles.titleText}
      >
        Fai la
      </PerfectText>
      <PerfectText
        size={TITLE_SIZE}
        lines={1}
        immunity={true}
        fontWeight="600"
        style={[styles.titleText, styles.titleAccent]}
      >
        Differenza
      </PerfectText>
      <PerfectText
        size={SUBTITLE_SIZE}
        lines={2}
        immunity={true}
        fontWeight="500"
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
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']}
        style={styles.backgroundPattern}
      />

      <View style={styles.mainHeaderContainer}>{titleContent}</View>
    </Animated.View>
  );
};

export default NewActionsHeader;
