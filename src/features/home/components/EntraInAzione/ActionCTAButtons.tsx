import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import { PlatformTouchable, FormattedText } from '../../../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
import { PlatformShadows } from '../../../../shared/constants/platformDesignTokens';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import { useResponsive } from '../../../../shared/hooks/useResponsive';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { BottomTabParamList } from '../../../../navigation/types';

interface ActionCTAButtonsProps {
  navigation: BottomTabNavigationProp<BottomTabParamList>;
}

export const ActionCTAButtons: React.FC<ActionCTAButtonsProps> = () => {
  const { triggerHaptic } = useHapticFeedback();
  const { scaleFont } = useResponsive();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const handleImpactPress = useCallback(() => {
    triggerHaptic('heavy');
    navigation.navigate('ImpactTab');
  }, [navigation, triggerHaptic]);

  const handleActionsPress = useCallback(() => {
    triggerHaptic('heavy');
    navigation.navigate('InfoTab');
  }, [navigation, triggerHaptic]);

  return (
    <View style={styles.container}>
      {/* SCOPRI IL NOSTRO IMPATTO */}
      <PlatformTouchable
        style={styles.buttonWrapper}
        onPress={handleImpactPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.whiteContainer}>
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="chart-line"
                size={Platform.OS === 'android' ? 35 : 36} // ANDROID: Icona ingrandita
                color="#DC2626"
                style={styles.buttonIcon}
              />
              <FormattedText
                variant="title-medium"
                style={[styles.buttonTitle, { fontSize: scaleFont(20) }]}
              >
                Scopri{'\n'}Impatto
              </FormattedText>
              <FormattedText
                variant="body-large"
                style={[styles.buttonDirectionRed, { fontSize: scaleFont(16) }]}
              >
                ← Risultati
              </FormattedText>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>

      {/* DONA E AIUTA */}
      <PlatformTouchable
        style={styles.buttonWrapper}
        onPress={handleActionsPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={['#059669', '#10B981', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <View style={styles.whiteContainer}>
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="hand-heart"
                size={Platform.OS === 'android' ? 35 : 36} // ANDROID: Icona ingrandita
                color="#059669"
                style={styles.buttonIcon}
              />
              <FormattedText
                variant="title-medium"
                style={[styles.buttonTitleGreen, { fontSize: scaleFont(20) }]}
              >
                Dona e{'\n'}Aiuta
              </FormattedText>
              <FormattedText
                variant="body-large"
                style={[styles.buttonDirection, { fontSize: scaleFont(16) }]}
              >
                Supporta →
              </FormattedText>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginHorizontal: Spacing[2],
    marginTop: Spacing[2],
    marginBottom: Spacing[6],
  },

  buttonWrapper: {
    flex: 1,
  },

  gradientBorder: {
    borderRadius: 20,
    padding: 2,
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18,
    // ANDROID: Bottoni leggermente più grandi
    ...(Platform.OS === 'android' && {
      paddingVertical: Spacing[3], // AUMENTATO: tornato a Spacing[3] per più spazio
      paddingHorizontal: Spacing[3], // Mantenuto per equilibrio
    }),
    // iOS: Dimensioni originali
    ...(Platform.OS === 'ios' && {
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
    }),
    justifyContent: 'center',
    flex: 1,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    // ANDROID: Padding interno leggermente aumentato
    ...(Platform.OS === 'android' && {
      paddingVertical: Spacing[1], // AUMENTATO: tornato a Spacing[1] per più spazio
    }),
    // iOS: Padding originale
    ...(Platform.OS === 'ios' && {
      paddingVertical: Spacing[1],
    }),
  },

  buttonIcon: {
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
  },

  buttonTitle: {
    // fontSize moved to dynamic scaleFont(20) - responsive scaling
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    // ANDROID: Margini leggermente aumentati
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 2, // Leggermente aumentato per più spazio
    }),
    // iOS: Margini originali
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlignVertical: 'center' as const,
  },

  buttonDirection: {
    // fontSize moved to dynamic scaleFont(16) - responsive scaling
    fontWeight: Typography.weights.bold,
    color: '#10B981',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    // ANDROID: Margini leggermente aumentati
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 1, // Leggermente aumentato per più spazio
    }),
    // iOS: Margini originali
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(16, 185, 129, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center' as const,
  },

  buttonDirectionRed: {
    // fontSize moved to dynamic scaleFont(16) - responsive scaling
    fontWeight: Typography.weights.bold,
    color: '#EF4444',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    // ANDROID: Margini leggermente aumentati
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 1, // Leggermente aumentato per più spazio
    }),
    // iOS: Margini originali
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(239, 68, 68, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center' as const,
  },

  buttonTitleGreen: {
    // fontSize moved to dynamic scaleFont(20) - responsive scaling
    fontWeight: Typography.weights.black,
    color: '#059669',
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    // ANDROID: Margini leggermente aumentati
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 2, // Leggermente aumentato per più spazio
    }),
    // iOS: Margini originali
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(5, 150, 105, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlignVertical: 'center' as const,
  },
});
