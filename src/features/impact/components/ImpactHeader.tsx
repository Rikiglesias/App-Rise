import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { PerfectText } from '../../../components/ui';
import { Spacing, Typography } from '../../../shared/constants/designTokens';
import responsiveSystem, {
  scaleDimensionLinear,
  TypographyTokens,
} from '../../../shared/constants/responsiveSystem';
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
            style={[styles.titleText, styles.titleAccent]}
          >
            Impatto
          </PerfectText>
        </View>
        <PerfectText
          size={SUBTITLE_SIZE}
          lines={2}
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
  headerContainer: {
    alignSelf: 'stretch',
    width: '100%',
    paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[8],
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
      Platform.OS === 'android' ? '#F5F6F6' : 'rgba(31, 41, 55, 0.03)',
    paddingHorizontal: Spacing[4],
    paddingTop: HEADER_VERTICAL_PADDING,
    paddingBottom: HEADER_VERTICAL_PADDING,
    borderRadius: 16,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android' ? '#E8EAEB' : 'rgba(31, 41, 55, 0.08)',
    shadowColor: '#1F2937',
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
  titleAccent: {
    color: '#DC2626',
    textShadowColor: 'rgba(220, 38, 38, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  mainSubtitle: {
    fontWeight: Typography.weights.medium,
    color: '#374151',
    textAlign: 'center',
    letterSpacing: TypographyTokens.letterSpacing.normal,
    lineHeight: TypographyTokens.lineHeights.baseline(IMPACT_SUBTITLE_SIZE),
    marginTop: Spacing[3],
    opacity: 0.8,
    includeFontPadding: false,
  },
});
