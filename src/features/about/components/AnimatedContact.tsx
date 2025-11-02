import React, { useCallback } from 'react';
import { animatedContactStyles } from '../styles/contactStyles';
import type { AnimatedContactProps } from '../types';
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PlatformIcon,
} from '@/components/ui';
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
        <PerfectContainer style={animatedContactStyles.contactCard}>
          <PerfectContainer style={animatedContactStyles.contactContent}>
            <PlatformIcon
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
      </PlatformTouchable>
    </PerfectContainer>
  );
};
