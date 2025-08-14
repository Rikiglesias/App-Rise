import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, View } from 'react-native';

import { PerfectText, PlatformTouchable } from '../../../components/ui';
import { Spacing } from '../../../shared/constants';
import type { ButtonData } from '../hooks/useActionButtonsLogic';
import { actionButtonsStyles } from '../styles/ActionButtonsStyles';
import type { ActionButtonIconName } from '../utils/buttonHelpers';

interface Props {
  button: ButtonData;
  animationValue: Animated.Value; // Mantenuto per compatibilità ma non usato
  onPress: () => void;
  iconColor: string;
  fullWidth?: boolean;
}

/**
 * Componente bottone ottimizzato con rendering specifico per piattaforma
 * Android: Bordo colorato per evitare bleeding nelle animazioni
 * iOS: Mantiene il gradiente originale
 */
export const ActionButton: React.FC<Props> = ({
  button,
  animationValue: _animationValue, // Rinominato con underscore per evitare warning
  onPress,
  iconColor,
  fullWidth = false,
}) => (
  <View style={fullWidth ? {} : actionButtonsStyles.buttonContainer}>
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
              name={button.icon as ActionButtonIconName}
              size={36}
              color={iconColor}
              style={actionButtonsStyles.buttonIcon}
            />
            <PerfectText
              size={18}
              lines={1}
              immunity={true}
              lineBreakStrategyIOS="push-out"
              style={actionButtonsStyles.buttonTitle}
            >
              {button.title}
            </PerfectText>
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
        <LinearGradient
          colors={button.gradient}
          style={actionButtonsStyles.gradientBorder}
        >
          <View style={actionButtonsStyles.whiteContainer}>
            <View style={actionButtonsStyles.buttonContent}>
              <MaterialCommunityIcons
                name={button.icon as ActionButtonIconName}
                size={36}
                color={iconColor}
                style={actionButtonsStyles.buttonIcon}
              />
              <PerfectText
                size={18}
                lines={1}
                immunity={true}
                lineBreakStrategyIOS="push-out"
                style={actionButtonsStyles.buttonTitle}
              >
                {button.title}
              </PerfectText>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={iconColor}
                style={actionButtonsStyles.chevronPosition}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </PlatformTouchable>
  </View>
);
