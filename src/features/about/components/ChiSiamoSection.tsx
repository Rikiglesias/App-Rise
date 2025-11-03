import { PerfectIcon } from '@/components/ui';
import React, { useCallback } from 'react';

import { chiSiamoSectionStyles } from '../styles/chiSiamoStyles';
import type { ChiSiamoSectionProps } from '../types';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { Colors, PerfectSpacing } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const ChiSiamoSection: React.FC<ChiSiamoSectionProps> = ({
  onInfoPress,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleInfoPress = useCallback(() => {
    onInfoPress();
    void triggerHaptic('light');
  }, [onInfoPress, triggerHaptic]);

  return (
    <PerfectContainer style={chiSiamoSectionStyles.categoryContainer}>
      {/* HEADER CON TITOLO CLICCABILE */}
      <PerfectContainer style={chiSiamoSectionStyles.headerContainer}>
        <PerfectContainer
          paddingVertical={PerfectSpacing.md}
          paddingHorizontal={PerfectSpacing.lg}
          style={chiSiamoSectionStyles.titleHeaderContainer}
        >
          {/* TITOLO E SOTTOTITOLO */}
          <PlatformTouchable
            onPress={handleInfoPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Mostra la storia dell'organizzazione"
            style={chiSiamoSectionStyles.titleClickableContainer}
          >
            <PerfectText
              size={30}
              lines={1}
              fontWeight="700"
              style={chiSiamoSectionStyles.categoryTitle}
            >
              Chi Siamo
            </PerfectText>
            <PerfectText
              size={15}
              lines={2}
              fontWeight="500"
              style={chiSiamoSectionStyles.descriptionText}
            >
              Organizzazione contro la fame nel mondo
            </PerfectText>
          </PlatformTouchable>
          <PlatformTouchable
            onPress={handleInfoPress}
            accessibilityRole="button"
            accessibilityLabel="Apri informazioni su Chi Siamo"
            style={chiSiamoSectionStyles.infoIconImproved}
          >
            <PerfectIcon name="information" size={24} color={Colors.neutral[900]} />
          </PlatformTouchable>
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};

