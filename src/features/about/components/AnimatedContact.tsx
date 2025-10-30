import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { animatedContactStyles } from '../styles/contactStyles';
import type { AnimatedContactProps } from '../types';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
// ELIMINATO: scaleDimensionLinear from '@/shared/constants/responsiveSystem';
import { Colors } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const AnimatedContact: React.FC<AnimatedContactProps> = ({
  contact,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(async () => {
    await triggerHaptic('medium');
    contact.onPress();
  }, [contact, triggerHaptic]);

  return (
    <PerfectContainer style={animatedContactStyles.contactButtonContainer}>
      <PlatformTouchable
        style={animatedContactStyles.contactTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {/* GRADIENT BORDER */}
        <LinearGradient
          colors={[
            Colors.neutral[800],
            Colors.neutral[700],
            Colors.neutral[900],
          ]}
          style={animatedContactStyles.gradientBorder}
        >
          <PerfectContainer style={animatedContactStyles.whiteContainer}>
            <PerfectContainer style={animatedContactStyles.contactContent}>
              <MaterialCommunityIcons
                name={
                  contact.icon as keyof typeof MaterialCommunityIcons.glyphMap
                }
                size={36} // ✅ SCALA automaticamente
                color={Colors.neutral[800]}
                style={animatedContactStyles.contactIcon}
              />
              <PerfectContainer
                style={animatedContactStyles.contactTextContainer}
              >
                <PerfectText
                  size={18}
                  lines={1}
                  style={animatedContactStyles.contactButtonTitle}
                >
                  {contact.title}
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={2}
                  style={animatedContactStyles.contactButtonSubtitle}
                >
                  {contact.subtitle}
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>
        </LinearGradient>
      </PlatformTouchable>
    </PerfectContainer>
  );
};
