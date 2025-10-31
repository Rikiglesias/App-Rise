import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '../../../components/ui';
// Ratio inline per evitare dipendenze condivise
import { Colors, Spacing, BorderRadius, Shadows } from '../../../shared/constants/designTokens';
import { LOGICAL_REFERENCE } from '../../../shared/constants/perfectScale';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

// Header sizes - hardcoded direttamente (Perfect System scala automaticamente)
const TITLE_SIZE = 40;
const SUBTITLE_SIZE = 18;
const REF_WIDTH = LOGICAL_REFERENCE.width;
const HEADER_INNER_HEIGHT = REF_WIDTH * 0.43;
const HEADER_VERTICAL_PADDING = REF_WIDTH * 0.025;
const HEADER_TITLE_INTERLINE = REF_WIDTH * 0.002;
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
            fontWeight="900"
            immunity={true}
            containerWidth={
              LOGICAL_REFERENCE.width * 0.7
            }
            style={styles.titleText}
          >
            Il Nostro
          </PerfectText>
          <PerfectText
            size={TITLE_SIZE}
            lines={1}
            fontWeight="900"
            immunity={true}
            containerWidth={
              LOGICAL_REFERENCE.width * 0.7
            }
            style={[styles.titleText, styles.titleAccent]}
          >
            Impatto
          </PerfectText>
        </PerfectContainer>
        <PerfectText
          size={SUBTITLE_SIZE}
          lines={2}
          fontWeight="500"
          immunity={true}
          containerWidth={
            LOGICAL_REFERENCE.width * 0.7
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
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200]
        : 'rgba(31, 41, 55, 0.08)',
    ...Shadows.sm,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[1],
  },
  titleText: {
    color: Colors.neutral[800],
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: HEADER_TITLE_INTERLINE,
    ...Shadows.sm,
    includeFontPadding: false,
  },
  titleAccent: {
    color: Colors.primary[600],
    ...Shadows.sm,
  },
  mainSubtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: Spacing[3],
    opacity: 0.8,
    includeFontPadding: false,
  },
});
