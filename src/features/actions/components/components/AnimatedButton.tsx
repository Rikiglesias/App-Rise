import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../../../components/ui';
import {
  SpacingTokens,
  ShadowTokens,
  scaleDimensionLinear,
} from '../../../../shared/constants/responsiveSystem';
import type { AnimatedButtonProps } from './ActionButtonTypes';

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  button,
  animationValue: _animationValue, // mantenuto per compatibilità
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => {
  // Spessore bordo come pagina Azioni: 2pt (scalato linearmente)
  const borderPadding = Math.max(1, Math.round(scaleDimensionLinear(2)));
  const outerRadius = scaleDimensionLinear(20);
  const innerRadius = Math.max(0, outerRadius - borderPadding);

  return (
    <View style={fullWidth ? {} : styles.buttonContainer}>
      <PlatformTouchable
        activeOpacity={0.6}
        onPress={onPress}
        style={{
          borderRadius: outerRadius,
          ...ShadowTokens.sm,
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
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: innerRadius,
              paddingVertical: SpacingTokens['4'],
              paddingHorizontal: SpacingTokens['3'],
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
              size={scaleDimensionLinear(28)}
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
            <MaterialCommunityIcons
              name="chevron-right"
              size={scaleDimensionLinear(20)}
              color={iconColor}
              style={{
                position: 'absolute',
                top: SpacingTokens['2'],
                right: SpacingTokens['2'],
              }}
            />
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </View>
  );
};
