/**
 * HEADER TEXT SECTION - Componente modulare
 * Sezione testo del header con gradient e animazioni
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { ModernSmartTitle } from '../ModernSmartTitle';
import { type HeaderTextSectionProps } from '@/features/home/types/HomeHeaderTypes';
import { PerfectContainer } from '@/components/ui/PerfectContainer';

export const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform, styles }) => {
    const combinedStyle = StyleSheet.flatten([styles.headerSection, styles.textContainer]);
    
    return (
      <PerfectContainer style={combinedStyle}>
        <ModernSmartTitle
          titleAnim={titleAnim}
          titleOpacity={titleOpacity}
          titleTransform={titleTransform}
        />
      </PerfectContainer>
    );
  }
);

HeaderTextSection.displayName = 'HeaderTextSection';
