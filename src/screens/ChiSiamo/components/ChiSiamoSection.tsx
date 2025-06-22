import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { Animated, Text, View } from 'react-native';
import { PlatformTouchable } from '../../../components/ui';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { chiSiamoSectionStyles } from '../styles';
import type { ChiSiamoSectionProps } from '../types';

export const ChiSiamoSection: React.FC<ChiSiamoSectionProps> = ({
  animations,
  onInfoPress,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    onInfoPress();
  }, [onInfoPress, triggerHaptic]);

  return (
    <View style={chiSiamoSectionStyles.categoryContainer}>
      <Animated.View
        style={[
          {
            opacity: animations.fadeAnim,
            transform: [
              {
                translateY: animations.slideAnim,
              },
              {
                scale: animations.scaleAnim,
              },
            ],
          },
        ]}
      >
        {/* HEADER CON TITOLO CLICCABILE */}
        <View style={chiSiamoSectionStyles.headerContainer}>
          <View style={chiSiamoSectionStyles.titleHeaderContainer}>
            {/* TITOLO E SOTTOTITOLO ELEGANTI COME PAGINA AZIONI */}
            <PlatformTouchable
              onPress={handleInfoPress}
              activeOpacity={0.7}
              style={chiSiamoSectionStyles.titleClickableContainer}
              rippleColor="rgba(220, 38, 38, 0.2)"
            >
              <Text style={chiSiamoSectionStyles.categoryTitle}>
                <Text style={chiSiamoSectionStyles.titleAccent}>Chi Siamo</Text>
              </Text>
              <Text style={chiSiamoSectionStyles.mainSubtitleInline}>
                Non profit contro la fame - premi (i) per saperne di più
              </Text>
            </PlatformTouchable>
            <PlatformTouchable
              onPress={handleInfoPress}
              style={chiSiamoSectionStyles.infoIconImproved}
              rippleColor="rgba(220, 38, 38, 0.2)"
            >
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="white"
              />
            </PlatformTouchable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
