import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '../../../components/ui';
// Ratio inline per evitare dipendenze condivise
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import responsiveSystem from '../../../shared/constants/responsiveSystem';
import {
  HEADER_TITLE_SIZE,
  IMPACT_SUBTITLE_SIZE,
} from '../../shared/headerSizes';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import {
  HEADER_VERTICAL_PADDING_FACTOR,
  HEADER_FIXED_HEIGHT_FACTOR,
  HEADER_TITLE_INTERLINE_FACTOR,
} from '../../shared/headerLayout';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

const TITLE_SIZE = HEADER_TITLE_SIZE;
const SUBTITLE_SIZE = IMPACT_SUBTITLE_SIZE;
const REF_WIDTH = responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393;
const HEADER_INNER_HEIGHT =
  /* scaleDimensionLinear(
  REF_WIDTH * HEADER_FIXED_HEIGHT_FACTOR
) */
  REF_WIDTH * HEADER_FIXED_HEIGHT_FACTOR;
const HEADER_VERTICAL_PADDING =
  /* scaleDimensionLinear(
  REF_WIDTH * HEADER_VERTICAL_PADDING_FACTOR
) */
  REF_WIDTH * HEADER_VERTICAL_PADDING_FACTOR;
const HEADER_TITLE_INTERLINE =
  /* scaleDimensionLinear(
  REF_WIDTH * HEADER_TITLE_INTERLINE_FACTOR
) */
  REF_WIDTH * HEADER_TITLE_INTERLINE_FACTOR;
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

      <PerfectContainer style={styles.mainHeaderContainer}>
        <PerfectContainer style={styles.titleContainer}>
          <PerfectText
            size={TITLE_SIZE}
            lines={1}
            immunity={true}
            containerWidth={
              (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
            }
            style={styles.titleText}
          >
            Il Nostro
          </PerfectText>
          <PerfectText
            size={TITLE_SIZE}
            lines={1}
            immunity={true}
            containerWidth={
              (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
            }
            style={[styles.titleText, styles.titleAccent]}
          >
            Impatto
          </PerfectText>
        </PerfectContainer>
        <PerfectText
          size={SUBTITLE_SIZE}
          lines={2}
          immunity={true}
          containerWidth={
            (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
          }
          style={styles.mainSubtitle}
        >
          Risultati concreti nella lotta contro la fame mondiale
        </PerfectText>
      </PerfectContainer>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[20] + 12, // AUMENTATO ANDROID: da Spacing[12] a Spacing[16] per più spazio
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
    opacity: Platform.OS === 'android' ? 0.01 : 0.02,
  },
  mainHeaderContainer: {
    alignSelf: 'stretch',
    width: '100%',
    alignItems: 'center',
    height: HEADER_INNER_HEIGHT,
    backgroundColor:
      Platform.OS === 'android'
        ? Colors.neutral[100]
        : 'rgba(31, 41, 55, 0.03)',
    paddingHorizontal: Spacing[4],
    paddingTop: HEADER_VERTICAL_PADDING,
    paddingBottom: HEADER_VERTICAL_PADDING,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200]
        : 'rgba(31, 41, 55, 0.08)',
    shadowColor: Colors.neutral[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08,
    shadowRadius: 6,
    elevation: Platform.OS === 'android' ? 1 : 3,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  titleText: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
    textAlign: 'center',
    letterSpacing: -0.5, // Tight
    lineHeight: HEADER_TITLE_SIZE * 1.2, // Baseline
    marginBottom: HEADER_TITLE_INTERLINE,
    textShadowColor: 'rgba(31, 41, 55, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    includeFontPadding: false,
  },
  titleAccent: {
    color: Colors.primary[600],
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  mainSubtitle: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: 0, // Normal
    lineHeight: IMPACT_SUBTITLE_SIZE * 1.2, // Baseline
    marginTop: Spacing[3],
    opacity: 0.8,
    includeFontPadding: false,
  },
});
