import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { animatedContactStyles } from '../styles';
import type { AnimatedContactProps } from '../types';

export const AnimatedContact: React.FC<AnimatedContactProps> = ({
  contact,
  animationValue,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(async () => {
    await triggerHaptic('medium');
    contact.onPress();
  }, [contact, triggerHaptic]);

  return (
    <Animated.View
      style={[
        animatedContactStyles.contactButtonContainer,
        {
          transform: [
            {
              scale: animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={animatedContactStyles.contactTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* GRADIENT CONTAINER PATTERN per bottoni */}
        <LinearGradient
          colors={['#1F2937', '#374151', '#111827']}
          style={animatedContactStyles.gradientBorder}
        >
          <View style={animatedContactStyles.whiteContainer}>
            <View style={animatedContactStyles.contactContent}>
              <MaterialCommunityIcons
                name={
                  contact.icon as keyof typeof MaterialCommunityIcons.glyphMap
                }
                size={28}
                color="#1F2937"
                style={animatedContactStyles.contactIcon}
              />
              <View style={animatedContactStyles.contactTextContainer}>
                <Text style={animatedContactStyles.contactButtonTitle}>
                  {contact.title}
                </Text>
                <Text style={animatedContactStyles.contactButtonSubtitle}>
                  {contact.subtitle}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};
