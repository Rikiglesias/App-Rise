import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import { PerfectText, PerfectContainer } from '@/components/ui';
// Ratio inline per evitare dipendenze condivise
import { Colors, BorderRadius, Shadows  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { LOGICAL_REFERENCE, scale } from '@/shared/constants/perfectScale';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

// Header sizes - TITLE/SUBTITLE NON scalati (PerfectText scala automaticamente)
// HEADER dimensions SCALATI (usati direttamente negli styles)
const TITLE_SIZE = 40;
const SUBTITLE_SIZE = 18;
const REF_WIDTH = LOGICAL_REFERENCE.width;
const HEADER_INNER_HEIGHT = scale(REF_WIDTH * 0.43);
const HEADER_VERTICAL_PADDING = scale(REF_WIDTH * 0.025);
const HEADER_TITLE_INTERLINE = scale(REF_WIDTH * 0.002);
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
        colors={[Colors.neutral[50], 'transparent']}
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
    paddingTop: PerfectSpacing['5xl'] + scale(12),
    paddingHorizontal: PerfectSpacing.base,
    paddingBottom: PerfectSpacing.lg,
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
  mainHeaderContainer: {
    alignSelf: 'stretch',
    width: '100%',
    alignItems: 'center',
    height: HEADER_INNER_HEIGHT,
    backgroundColor: Colors.neutral[50],
    paddingHorizontal: PerfectSpacing.base,
    paddingTop: HEADER_VERTICAL_PADDING,
    paddingBottom: HEADER_VERTICAL_PADDING,
    borderRadius: BorderRadius.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: PerfectSpacing.xs,
  },
  titleText: {
    color: Colors.neutral[800],
    textAlign: 'center',
    letterSpacing: scale(-0.5),
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
    marginTop: PerfectSpacing.md,
    opacity: 0.8,
    includeFontPadding: false,
  },
});
