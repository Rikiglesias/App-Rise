import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { View } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../../../components/ui';
import {
  DesignTokens,
  SpacingTokens,
  ShadowTokens,
} from '../../../../shared/constants/responsiveSystem';
import type { AnimatedButtonProps } from './ActionButtonTypes';

// Componente bottone PERFETTO - Sistema coerente cross-platform
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  button,
  animationValue: _animationValue, // Rinominato con underscore per evitare warning
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => (
  <View style={fullWidth ? {} : styles.buttonContainer}>
    <PlatformTouchable
      activeOpacity={0.6}
      onPress={onPress}
      style={{
        borderRadius: DesignTokens.borderRadius.xlarge,
        ...ShadowTokens.sm, // Sistema ombre coerente
      }}
    >
      {/* UNIFICATO: Stesso design per Android e iOS */}
      <LinearGradient
        colors={button.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: DesignTokens.borderRadius.xlarge,
          padding: SpacingTokens['1'], // 4dp responsive
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: Math.max(
              0,
              DesignTokens.borderRadius.xlarge - SpacingTokens['1']
            ),
            paddingVertical: SpacingTokens['4'], // 16dp responsive
            paddingHorizontal: SpacingTokens['3'], // 12dp responsive
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: DesignTokens.components.buttonHeight.large, // 56dp responsive
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
            size={DesignTokens.components.iconSize.large} // 32dp responsive
            color={iconColor}
            style={styles.buttonIcon}
          />
          <PerfectText
            size={18}
            lines={1}
            immunity={true}
            style={styles.buttonTitle}
          >
            {button.title}
          </PerfectText>
          <MaterialCommunityIcons
            name="chevron-right"
            size={DesignTokens.components.iconSize.small} // 20dp responsive
            color={iconColor}
            style={{
              position: 'absolute',
              top: SpacingTokens['2'], // 8dp responsive
              right: SpacingTokens['2'], // 8dp responsive
            }}
          />
        </View>
      </LinearGradient>
    </PlatformTouchable>
  </View>
);
