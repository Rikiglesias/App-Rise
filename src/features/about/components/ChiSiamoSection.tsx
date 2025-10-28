import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { PlatformTouchable, PerfectText } from '../../../components/ui';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { useResponsive } from '../../../shared/hooks';
import { chiSiamoSectionStyles } from '../styles';
// Ratio inline per evitare dipendenze condivise
import responsiveSystem from '../../../shared/constants/responsiveSystem';
import type { ChiSiamoSectionProps } from '../types';

export const ChiSiamoSection: React.FC<ChiSiamoSectionProps> = ({
  animations: _animations,
  onInfoPress,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { scale } = useResponsive();

  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    onInfoPress();
  }, [onInfoPress, triggerHaptic]);

  return (
    <View style={chiSiamoSectionStyles.categoryContainer}>
      <View>
        {/* HEADER CON TITOLO CLICCABILE */}
        <View style={chiSiamoSectionStyles.headerContainer}>
          <View style={chiSiamoSectionStyles.titleHeaderContainer}>
            {/* TITOLO E SOTTOTITOLO ELEGANTI COME PAGINA AZIONI */}
            <PlatformTouchable
              onPress={handleInfoPress}
              activeOpacity={0.7}
              style={chiSiamoSectionStyles.titleClickableContainer}
            >
              <PerfectText
                size={30}
                lines={1}
                fontWeight="400"
                containerWidth={
                  (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
                }
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
                containerWidth={
                  (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
                }
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
                size={scale(20)}
                color="white"
              />
            </PlatformTouchable>
          </View>
        </View>
      </View>
    </View>
  );
};
