import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { LOGICAL_REFERENCE, scale } from '@/shared/constants/perfectScale';
import { Colors, PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface NewActionsHeaderProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

// Header sizes - TITLE/SUBTITLE NON scalati (PerfectText scala automaticamente)
// HEADER dimensions SCALATI (usati direttamente negli styles)
const TITLE_SIZE = 32;
const SUBTITLE_SIZE = 16; // Ridotto da 18 per evitare limite minimo su small devices
const REF_WIDTH = LOGICAL_REFERENCE.width;
const HEADER_VERTICAL_PADDING = scale(REF_WIDTH * 0.025);
const HEADER_TITLE_INTERLINE = scale(REF_WIDTH * 0.002);
const NewActionsHeader: React.FC<NewActionsHeaderProps> = ({ animations }) => {
  const { t } = useTranslation();
  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          // minHeight rimosso: permette espansione con Large Text iOS
          backgroundColor: Colors.neutral[0],
          paddingHorizontal: PerfectSpacing.base,
          paddingTop: HEADER_VERTICAL_PADDING,
          paddingBottom: HEADER_VERTICAL_PADDING,
          borderRadius: scale(16),
          borderWidth: scale(1),
          borderColor: Colors.neutral[300],
        },

        titleText: {
          color: Colors.neutral[900],
          textAlign: 'center',
          letterSpacing: scale(-0.5),
          marginBottom: HEADER_TITLE_INTERLINE,
          includeFontPadding: false,
        },

        titleAccent: {
          color: Colors.primary[500],
        },

        mainSubtitle: {
          color: Colors.neutral[700],
          textAlign: 'center',
          letterSpacing: 0,
          marginTop: PerfectSpacing.md,
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
        fontWeight="900"
        style={styles.titleText}
        testID="actions-title-1"
      >
        {t('actions.headerTitle1')}
      </PerfectText>
      <PerfectText
        size={TITLE_SIZE}
        lines={1}
        fontWeight="900"
        style={[styles.titleText, styles.titleAccent]}
        testID="actions-title-2"
      >
        {t('actions.headerTitle2')}
      </PerfectText>
      <PerfectText
        size={SUBTITLE_SIZE}
        lines={2}
        immunity={true}
        fontWeight="500"
        style={styles.mainSubtitle}
        testID="actions-subtitle"
      >
        {t('actions.headerSubtitle')}
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
      accessibilityRole="header"
      accessibilityLabel={t('actions.headerAccessibility')}
      testID="actions-header"
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
