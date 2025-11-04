import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import type { AnimatedButtonProps } from './ActionButtonTypes';
import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { Colors, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  button,
  animationValue: _animationValue, // mantenuto per compatibilità
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => {
  // Spessore bordo come pagina Azioni: 2pt (scalato)
  const borderPadding = Math.max(1, Math.round(scale(2)));
  const outerRadius = scale(20);
  const innerRadius = Math.max(0, outerRadius - borderPadding);

  return (
    <PerfectContainer style={fullWidth ? {} : styles.buttonContainer}>
      <PlatformTouchable
        activeOpacity={0.6}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={button.title}
        testID={`action-button-${button.id}`}
        style={{
          borderRadius: outerRadius,
          ...Shadows.sm,
        }}
      >
        <LinearGradient
          colors={button.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: outerRadius,
            padding: borderPadding,
            overflow: 'hidden',
          }}
        >
          <PerfectContainer
            style={{
              backgroundColor: Colors.neutral[0],
              borderRadius: innerRadius,
              paddingVertical: PerfectSpacing.base,
              paddingHorizontal: PerfectSpacing.md,
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <PerfectIcon
              name={button.icon}
              size={28}
              color={iconColor}
              style={styles.buttonIcon}
            />
            <PerfectText
              size={20}
              lines={1}
              immunity={true}
              style={styles.buttonTitle}
            >
              {button.title}
            </PerfectText>
            <PerfectIcon
              name="chevron-right"
              size={20}
              minSize={18}
              maxSize={24}
              color={iconColor}
              style={{
                position: 'absolute',
                top: PerfectSpacing.sm,
                right: PerfectSpacing.sm,
              }}
            />
          </PerfectContainer>
        </LinearGradient>
      </PlatformTouchable>
    </PerfectContainer>
  );
};
