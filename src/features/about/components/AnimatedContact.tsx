import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { PlatformTouchable } from '../../../components/ui';
import { PerfectText } from '../../../components/ui/PerfectText';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { animatedContactStyles } from '../styles';
import type { AnimatedContactProps } from '../types';

export const AnimatedContact: React.FC<AnimatedContactProps> = ({
  contact,
  animationValue: _animationValue, // Non più utilizzato ma mantenuto per compatibilità
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(async () => {
    await triggerHaptic('medium');
    contact.onPress();
  }, [contact, triggerHaptic]);

  return (
    <View style={animatedContactStyles.contactButtonContainer}>
      <PlatformTouchable
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
                size={36} // AUMENTATO: da 28 a 36 per coerenza con gli stili
                color="#1F2937"
                style={animatedContactStyles.contactIcon}
              />
              <View style={animatedContactStyles.contactTextContainer}>
                <PerfectText
                  size={animatedContactStyles.contactButtonTitle.fontSize ?? 18}
                  lines={1}
                  style={animatedContactStyles.contactButtonTitle}
                >
                  {contact.title}
                </PerfectText>
                <PerfectText
                  size={
                    animatedContactStyles.contactButtonSubtitle.fontSize ?? 16
                  }
                  lines={2}
                  style={animatedContactStyles.contactButtonSubtitle}
                >
                  {contact.subtitle}
                </PerfectText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </View>
  );
};
