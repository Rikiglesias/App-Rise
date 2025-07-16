import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import {
  PerfectText,
  PerfectContainer,
  PlatformTouchable,
} from '../../../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
import { PlatformShadows } from '../../../../shared/constants/platformDesignTokens';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { BottomTabParamList } from '../../../../navigation/types';

interface ActionCTAButtonsProps {
  navigation: BottomTabNavigationProp<BottomTabParamList>;
}

export const ActionCTAButtons: React.FC<ActionCTAButtonsProps> = () => {
  const { triggerHaptic } = useHapticFeedback();
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
    <PerfectContainer
      preset="section"
      flexDirection="row"
      gap={16}
      paddingHorizontal={8}
      marginVertical={16}
    >
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
                size={Platform.OS === 'android' ? 35 : 36}
                color="#DC2626"
                style={styles.buttonIcon}
              />
              <PerfectText
                fontSize={22}
                fontWeight="bold"
                lines={2}
                style={styles.buttonTitle}
              >
                Scopri{'\n'}Impatto
              </PerfectText>
              <PerfectText
                fontSize={18}
                fontWeight="bold"
                lines={1}
                style={styles.buttonDirectionRed}
              >
                ← Risultati
              </PerfectText>
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
                size={Platform.OS === 'android' ? 35 : 36}
                color="#059669"
                style={styles.buttonIcon}
              />
              <PerfectText
                fontSize={22}
                fontWeight="bold"
                lines={2}
                style={styles.buttonTitleGreen}
              >
                Dona e{'\n'}Aiuta
              </PerfectText>
              <PerfectText
                fontSize={18}
                fontWeight="bold"
                lines={1}
                style={styles.buttonDirection}
              >
                Supporta →
              </PerfectText>
            </View>
          </View>
        </LinearGradient>
      </PlatformTouchable>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  buttonWrapper: {
    flex: 1,
  },

  gradientBorder: {
    borderRadius: 20,
    padding: 2,
    ...PlatformShadows.lg,
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18,
    minHeight: 90, // ← RIDOTTO da 120 a 90 per bottoni meno alti
    ...(Platform.OS === 'android' && {
      paddingVertical: Spacing[3], // ← RIDOTTO da Spacing[4] a Spacing[3]
      paddingHorizontal: Spacing[3],
    }),
    ...(Platform.OS === 'ios' && {
      paddingVertical: Spacing[3], // ← RIDOTTO da Spacing[4] a Spacing[3]
      paddingHorizontal: Spacing[4],
    }),
    justifyContent: 'center',
    flex: 1,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-around', // ← Cambiato da 'space-between' a 'space-around'
    flex: 1,
    minHeight: 75, // ← RIDOTTO da 100 a 75 per contenuto meno alto
    ...(Platform.OS === 'android' && {
      paddingVertical: Spacing[1], // ← RIDOTTO da Spacing[2] a Spacing[1]
    }),
    ...(Platform.OS === 'ios' && {
      paddingVertical: Spacing[1], // ← RIDOTTO da Spacing[2] a Spacing[1]
    }),
  },

  buttonIcon: {
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
  },

  buttonTitle: {
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 2,
    }),
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlignVertical: 'center' as const,
  },

  buttonDirection: {
    fontWeight: Typography.weights.bold,
    color: '#10B981',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 1,
    }),
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(16, 185, 129, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center' as const,
  },

  buttonDirectionRed: {
    fontWeight: Typography.weights.bold,
    color: '#EF4444',
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 1,
    }),
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(239, 68, 68, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center' as const,
  },

  buttonTitleGreen: {
    fontWeight: Typography.weights.black,
    color: '#059669',
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    ...(Platform.OS === 'android' && {
      marginVertical: Spacing[0] + 2,
    }),
    ...(Platform.OS === 'ios' && {
      marginVertical: Spacing[1],
    }),
    textShadowColor: 'rgba(5, 150, 105, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlignVertical: 'center' as const,
  },
});
