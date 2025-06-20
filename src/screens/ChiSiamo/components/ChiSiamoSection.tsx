import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

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
            <TouchableOpacity
              onPress={handleInfoPress}
              activeOpacity={0.7}
              style={chiSiamoSectionStyles.titleClickableContainer}
            >
              <Text style={chiSiamoSectionStyles.categoryTitle}>
                <Text style={chiSiamoSectionStyles.titleAccent}>Chi Siamo</Text>
              </Text>
              <Text style={chiSiamoSectionStyles.mainSubtitleInline}>
                Non profit contro la fame - premi (i) per saperne di più
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleInfoPress}
              style={chiSiamoSectionStyles.infoIconImproved}
            >
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};
