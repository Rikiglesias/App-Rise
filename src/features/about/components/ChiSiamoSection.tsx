import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';

import { chiSiamoSectionStyles } from '../styles/chiSiamoStyles';
import type { ChiSiamoSectionProps } from '../types';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const ChiSiamoSection: React.FC<ChiSiamoSectionProps> = ({
  onInfoPress,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    onInfoPress();
  }, [onInfoPress, triggerHaptic]);

  return (
    <PerfectContainer style={chiSiamoSectionStyles.categoryContainer}>
      {/* HEADER CON TITOLO CLICCABILE */}
      <PerfectContainer style={chiSiamoSectionStyles.headerContainer}>
        <PerfectContainer
          paddingVertical={12} // ✅ Spacing[3] - SCALA!
          paddingHorizontal={20} // ✅ Spacing[5] - SCALA!
          borderRadius={16} // ✅ SCALA!
          style={chiSiamoSectionStyles.titleHeaderContainer}
        >
          {/* TITOLO E SOTTOTITOLO */}
          <PlatformTouchable
            onPress={handleInfoPress}
            activeOpacity={0.7}
            style={chiSiamoSectionStyles.titleClickableContainer}
          >
            <PerfectText
              size={30}
              lines={1}
              fontWeight="400"
              style={[
                chiSiamoSectionStyles.categoryTitle,
                chiSiamoSectionStyles.titleAccent,
              ]}
            >
              Chi Siamo
            </PerfectText>
            <PerfectText
              size={15}
              lines={2}
              fontWeight="400"
              style={chiSiamoSectionStyles.mainSubtitleInline}
            >
              Non profit contro la fame - premi (i) per saperne di più
            </PerfectText>
          </PlatformTouchable>
          <PlatformTouchable
            onPress={handleInfoPress}
            style={chiSiamoSectionStyles.infoIconImproved}
          >
            <MaterialCommunityIcons
              name="information"
              size={40} // ✅ Scaling diretto, no hook
              color="white"
            />
          </PlatformTouchable>
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};
