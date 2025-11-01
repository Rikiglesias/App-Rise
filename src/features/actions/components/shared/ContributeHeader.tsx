import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { LOGICAL_REFERENCE, scale } from '@/shared/constants/perfectScale';
import { Colors, Spacing } from '@/shared/constants';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

// Header sizes - hardcoded direttamente (Perfect System scala automaticamente)
const TITLE_SIZE = 40;
const SUBTITLE_SIZE = 18;
const REF_WIDTH = LOGICAL_REFERENCE.width;
const HEADER_INNER_HEIGHT = REF_WIDTH * 0.43;
const HEADER_VERTICAL_PADDING = REF_WIDTH * 0.025;
const HEADER_TITLE_INTERLINE = REF_WIDTH * 0.002;
const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          alignSelf: 'stretch',
          width: '100%',
          paddingTop: Spacing[20] + scale(12),
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

        mainHeaderContainer: {
          alignSelf: 'stretch',
          width: '100%',
          alignItems: 'center',
          height: HEADER_INNER_HEIGHT,
          backgroundColor: Colors.neutral[50],
          paddingHorizontal: Spacing[4],
          paddingTop: HEADER_VERTICAL_PADDING,
          paddingBottom: HEADER_VERTICAL_PADDING,
          borderRadius: scale(16),
          borderWidth: scale(1),
          borderColor: Colors.neutral[100],
          shadowColor: Colors.neutral[900],
          shadowOffset: { width: 0, height: scale(2) },
          shadowOpacity: 0.08,
          shadowRadius: scale(6),
          elevation: 3,
        },

        titleText: {
          color: Colors.neutral[900],
          textAlign: 'center',
          letterSpacing: scale(-0.5),
          marginBottom: HEADER_TITLE_INTERLINE,
          textShadowColor: Colors.neutral[800],
          textShadowOffset: { width: 0, height: scale(2) },
          textShadowRadius: scale(6),
          includeFontPadding: false,
        },

        titleAccent: {
          color: Colors.primary[600],
          textShadowColor: Colors.primary[600],
          textShadowOffset: { width: 0, height: scale(2) },
          textShadowRadius: scale(6),
        },

        mainSubtitle: {
          color: Colors.neutral[700],
          textAlign: 'center',
          letterSpacing: 0,
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
        colors={[Colors.neutral[50], 'transparent']}
        style={styles.backgroundPattern}
      />

      <PerfectContainer style={styles.mainHeaderContainer}>
        {titleContent}
      </PerfectContainer>
    </Animated.View>
  );
};

export default NewActionsHeader;
