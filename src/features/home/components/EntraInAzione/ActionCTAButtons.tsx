import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';

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
import { scaleDimensionLinear } from '../../../../shared/constants/responsiveSystem';
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
                size={28}
                color="#DC2626"
                style={styles.buttonIcon}
              />
              <PerfectText
                size={20}
                fontWeight="bold"
                lines={2}
                containerWidth={140}
                style={styles.buttonTitle}
              >
                Scopri{'\n'}Impatto
              </PerfectText>
              <View style={styles.directionRowRed}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={18}
                  color="#EF4444"
                />
                <PerfectText
                  size={16}
                  fontWeight="bold"
                  lines={1}
                  containerWidth={110}
                  style={styles.buttonDirectionRed}
                >
                  Risultati
                </PerfectText>
              </View>
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
                size={28}
                color="#059669"
                style={styles.buttonIcon}
              />
              <PerfectText
                size={20}
                fontWeight="bold"
                lines={2}
                containerWidth={140}
                textAlign="center"
                style={styles.buttonTitleGreen}
              >
                Dona e{'\n'}Aiuta
              </PerfectText>
              <View style={styles.directionRowGreen}>
                <PerfectText
                  size={16}
                  fontWeight="bold"
                  lines={1}
                  containerWidth={110}
                  style={styles.buttonDirection}
                >
                  Supporta
                </PerfectText>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color="#10B981"
                />
              </View>
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
    minHeight: scaleDimensionLinear(112), // Ridotto per bottoni più corti
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    justifyContent: 'center',
    flex: 1,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-between', // Assicura label sempre visibile in basso
    flex: 1,
    minHeight: scaleDimensionLinear(88), // Ridotto per compattare l'altezza
    paddingTop: Spacing[1],
    paddingBottom: Spacing[1],
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
    marginVertical: Spacing[1],
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
    marginVertical: Spacing[1],
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
    marginVertical: Spacing[1],
    textShadowColor: 'rgba(239, 68, 68, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center' as const,
  },

  directionRowRed: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing[1],
  },

  directionRowGreen: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing[1],
  },

  buttonTitleGreen: {
    fontWeight: Typography.weights.black,
    color: '#059669',
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    marginVertical: Spacing[1],
    textShadowColor: 'rgba(5, 150, 105, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlignVertical: 'center' as const,
  },
});
