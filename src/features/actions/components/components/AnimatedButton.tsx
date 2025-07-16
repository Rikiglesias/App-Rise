import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, View } from 'react-native';

import { PlatformTouchable, FormattedText } from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants';
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
        // ANDROID: Container bianco con bordo colorato - ZERO sanguinamento durante animazioni
        <View
          style={{
            backgroundColor: '#FFFFFF', // Background bianco solido
            borderRadius: 20,
            borderWidth: 3, // Bordo colorato esterno
            borderColor: button.gradient[0], // Primo colore del gradiente
            shadowColor: 'transparent', // Nessuna ombra per evitare artefatti
            elevation: 2,
            overflow: 'hidden', // Blocca qualsiasi overflow
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF', // Doppio layer bianco per sicurezza
              paddingVertical: Spacing[4],
              paddingHorizontal: Spacing[3],
              alignItems: 'center',
              minHeight: 100,
              justifyContent: 'center',
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
            <FormattedText
              fontSize={18}
              lineBreakStrategyIOS="push-out"
              breakStrategyAndroid="highQuality"
              hyphenationFrequencyAndroid="full"
              style={styles.buttonTitle}
            >
              {button.title}
            </FormattedText>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={iconColor}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            />
          </View>
        </View>
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
              <FormattedText
                fontSize={18}
                lineBreakStrategyIOS="push-out"
                breakStrategyAndroid="highQuality"
                hyphenationFrequencyAndroid="full"
                style={styles.buttonTitle}
              >
                {button.title}
              </FormattedText>
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
