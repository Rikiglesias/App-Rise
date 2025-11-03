import React, { useCallback } from 'react';
import { animatedContactStyles } from '../styles/contactStyles';
import type { AnimatedContactProps } from '../types';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { Colors } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const AnimatedContact: React.FC<AnimatedContactProps> = ({
  contact,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handlePress = useCallback(() => {
    contact.onPress();
    void triggerHaptic('medium');
  }, [contact, triggerHaptic]);

  return (
    <PerfectContainer style={animatedContactStyles.contactButtonContainer}>
      <PlatformTouchable
        style={animatedContactStyles.contactTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Apri ${contact.title}`}
      >
        <PerfectContainer style={animatedContactStyles.contactCard}>
          <PerfectContainer style={animatedContactStyles.contactContent}>
            <PerfectIcon
              name={contact.icon}
              size={36}
              color={Colors.neutral[800]}
            />
            <PerfectContainer
              style={animatedContactStyles.contactTextContainer}
            >
              <PerfectText
                size={18}
                lines={1}
                containerWidth={0}
                style={animatedContactStyles.contactButtonTitle}
              >
                {contact.title}
              </PerfectText>
              <PerfectText
                size={16}
                lines={2}
                containerWidth={0}
                style={animatedContactStyles.contactButtonSubtitle}
              >
                {contact.subtitle}
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>
        </PerfectContainer>
      </PlatformTouchable>
    </PerfectContainer>
  );
};
