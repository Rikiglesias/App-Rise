/**
 * HEADER TEXT SECTION - Componente modulare
 * Sezione testo del header con gradient e animazioni
 */

import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ViewStyle } from 'react-native';
import { ModernSmartTitle } from '../ModernSmartTitle';
import { type HeaderTextSectionProps } from '@/features/home/types/HomeHeaderTypes';
import { PerfectContainer } from '@/components/ui/PerfectContainer';

export const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ colors, titleAnim, titleOpacity, titleTransform, styles }) => (
    <PerfectContainer style={styles.headerSection as ViewStyle}>
      <LinearGradient
        colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <PerfectContainer style={styles.textContainer as ViewStyle}>
        <ModernSmartTitle
          titleAnim={titleAnim}
          titleOpacity={titleOpacity}
          titleTransform={titleTransform}
        />
      </PerfectContainer>
    </PerfectContainer>
  )
);

HeaderTextSection.displayName = 'HeaderTextSection';
