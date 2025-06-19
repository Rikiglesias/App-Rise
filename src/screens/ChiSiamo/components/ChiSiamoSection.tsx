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
        <View style={chiSiamoSectionStyles.titleContainer}>
          <Text style={chiSiamoSectionStyles.categoryTitle}>
            Rise Against Hunger Italia
          </Text>
          <TouchableOpacity
            onPress={handleInfoPress}
            style={chiSiamoSectionStyles.infoIcon}
          >
            <MaterialCommunityIcons
              name="information-outline"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
        {/* Separatore decorativo */}
        <View style={chiSiamoSectionStyles.titleSeparator}>
          <View style={chiSiamoSectionStyles.separatorLine} />
          <Text style={chiSiamoSectionStyles.separatorIcon}>•</Text>
          <View style={chiSiamoSectionStyles.separatorLine} />
        </View>
        <Text style={chiSiamoSectionStyles.categorySubtitle}>
          Dal cuore di Bologna, oltre 3,1 milioni di pasti distribuiti nel mondo
          grazie ai nostri volontari.{'\n\n'}
          Scopri la nostra storia completa toccando l&apos;icona ℹ️
        </Text>
        <View style={chiSiamoSectionStyles.categoryDivider} />
      </Animated.View>
    </View>
  );
};
