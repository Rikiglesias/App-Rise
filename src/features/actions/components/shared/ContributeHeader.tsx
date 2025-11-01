// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { LOGICAL_REFERENCE } from '@/shared/constants/perfectScale';
import { Spacing } from '@/shared/constants';

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
          color: '#1F2937',
          textAlign: 'center',
          letterSpacing: -0.5,
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
          color: '#374151',
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
        colors={['rgba(55, 65, 81, 0.03)', 'transparent']}
        style={styles.backgroundPattern}
      />

      <PerfectContainer style={styles.mainHeaderContainer}>
        {titleContent}
      </PerfectContainer>
    </Animated.View>
  );
};

export default NewActionsHeader;
