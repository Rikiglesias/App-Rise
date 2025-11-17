import React from 'react';
import { StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useTranslation } from '@/shared/hooks/useTranslation';

// Header sizes - OTTIMIZZATI PER SCALING UNIFORME
const TITLE_SIZE = 32;
const SUBTITLE_SIZE = 16; // Ridotto da 18 per evitare limite minimo su small devices

export const ImpactHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PerfectContainer style={styles.headerContainer} accessibilityRole="header">
      <PerfectContainer style={styles.mainHeaderContainer}>
        <PerfectText
          size={TITLE_SIZE}
          lines={1}
          fontWeight="900"
          style={styles.titleText}
          accessibilityLabel={t('impact.impactAccessibility')}
        >
          {t('impact.impactTitle1')}
        </PerfectText>
        <PerfectText
          size={TITLE_SIZE}
          lines={1}
          fontWeight="900"
          style={[styles.titleText, styles.titleAccent]}
        >
          {t('impact.impactTitle2')}
        </PerfectText>
        <PerfectText
          size={SUBTITLE_SIZE}
          lines={2}
          fontWeight="500"
          style={styles.mainSubtitle}
        >
          {t('actions.headerSubtitle')}
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
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
  },
  mainHeaderContainer: {
    alignSelf: 'stretch',
    width: '100%',
    alignItems: 'center',
    backgroundColor: Colors.neutral[0],
    paddingHorizontal: PerfectSpacing.base,
    paddingTop: PerfectSpacing.lg,
    paddingBottom: PerfectSpacing.lg,
    borderRadius: scale(16),
    borderWidth: scale(1),
    borderColor: Colors.neutral[300],
  },
  titleText: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
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
  },
});
