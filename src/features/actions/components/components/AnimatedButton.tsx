import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, View } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../../../components/ui';
import {
  BorderColors,
  BorderRadius,
  Spacing,
} from '../../../../shared/constants';
import {
  scaleDimensionLinear,
  scaleSize,
} from '../../../../shared/constants/responsiveSystem';
import type { AnimatedButtonProps } from './ActionButtonTypes';

// Componente bottone senza animazioni - PULITO
export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  button,
  animationValue: _animationValue, // Rinominato con underscore per evitare warning
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => (
  <View style={fullWidth ? {} : styles.buttonContainer}>
    <PlatformTouchable activeOpacity={0.6} onPress={onPress}>
      {Platform.OS === 'android' ? (
        // ANDROID: LinearGradient per bordi uniformi - RISOLVE PROBLEMA ANGOLI
        <LinearGradient
          colors={[BorderColors.brandElegant, BorderColors.brandElegant]} // Gradiente elegante uniforme
          style={{
            borderRadius: BorderRadius.xl,
            padding: scaleSize(3), // Spessore bordo
            shadowColor: 'transparent',
            elevation: 2,
            overflow: 'hidden', // RISOLVE PROBLEMA ANGOLI COPERTI
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: Math.max(0, BorderRadius.xl - scaleSize(3)), // Radius interno sicuro
              paddingVertical: Spacing[4],
              paddingHorizontal: Spacing[3],
              alignItems: 'center',
              minHeight: scaleDimensionLinear(100) - scaleSize(6), // Compenso padding
              justifyContent: 'center',
              overflow: 'hidden', // PREVIENE CONTENUTO CHE COPRE ANGOLI
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
              size={36}
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
              size={20}
              color={iconColor}
              style={{
                position: 'absolute',
                top: scaleSize(8), // ← MIGRATO DA HARDCODED 8
                right: scaleSize(8), // ← MIGRATO DA HARDCODED 8
              }}
            />
          </View>
        </LinearGradient>
      ) : (
        // iOS: Mantieni il gradiente originale
        <LinearGradient colors={button.gradient} style={styles.gradientBorder}>
          <View style={styles.whiteContainer}>
            <View style={styles.buttonContent}>
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
                size={36}
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
                size={20}
                color={iconColor}
                style={styles.chevronPosition}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </PlatformTouchable>
  </View>
);
