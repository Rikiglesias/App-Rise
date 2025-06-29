import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { ResponsiveText } from '../../../../components/ui/ResponsiveText';
import { PlatformTouchable } from '../../../../components/ui';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
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
                size={36}
                color="#DC2626"
                style={styles.buttonIcon}
              />
              <ResponsiveText
                style={styles.buttonTitle}
                responsiveFontSize={Typography.sizes.lg}
              >
                Scopri{'\n'}Impatto
              </ResponsiveText>
              <ResponsiveText
                style={styles.buttonDirectionRed}
                responsiveFontSize={Typography.sizes.lg}
              >
                ← Risultati
              </ResponsiveText>
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
                size={36}
                color="#059669"
                style={styles.buttonIcon}
              />
              <ResponsiveText
                style={styles.buttonTitleGreen}
                responsiveFontSize={Typography.sizes.lg}
              >
                Dona e{'\n'}Aiuta
              </ResponsiveText>
              <ResponsiveText
                style={styles.buttonDirection}
                responsiveFontSize={Typography.sizes.lg}
              >
                Supporta →
              </ResponsiveText>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    justifyContent: 'center',
    flex: 1,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    paddingVertical: Spacing[1],
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
