import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';

import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '../../../../components/ui';
import { Spacing, Shadows } from '../../../../shared/constants/designTokens';
import { scale } from '../../../../shared/constants/responsiveSystem';
import type { AnimatedButtonProps } from './ActionButtonTypes';

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
  const outerRadius = 20;
  const innerRadius = Math.max(0, outerRadius - borderPadding);

  return (
    <PerfectContainer style={fullWidth ? {} : styles.buttonContainer}>
      <PlatformTouchable
        activeOpacity={0.6}
        onPress={onPress}
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
              backgroundColor: '#FFFFFF',
              borderRadius: innerRadius,
              paddingVertical: Spacing[4],
              paddingHorizontal: Spacing[3],
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <MaterialCommunityIcons
              name={
                button.icon as
                  | 'heart'
                  | 'charity'
                  | 'shopping'
                  | 'gift'
                  | 'calendar'
                  | 'share-variant'
                  | 'map-marker-path'
                  | 'information'
              }
              size={scale(28)}
              color={iconColor}
              style={styles.buttonIcon}
            />
            <PerfectText
              size={20}
              lines={1}
              fontWeight="400"
              immunity={true}
              style={styles.buttonTitle}
            >
              {button.title}
            </PerfectText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={scale(20)}
              color={iconColor}
              style={{
                position: 'absolute',
                top: Spacing[2],
                right: Spacing[2],
              }}
            />
          </PerfectContainer>
        </LinearGradient>
      </PlatformTouchable>
    </PerfectContainer>
  );
};
