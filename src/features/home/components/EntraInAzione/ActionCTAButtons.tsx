import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import {
  BorderRadius,
  Colors,
  Shadows,
} from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale, scaleSpacing, scaleTouch } from '@/shared/constants/perfectScale';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import type { BottomTabParamList } from '@/navigation/types';

export const ActionCTAButtons: React.FC = () => {
  const { triggerHaptic } = useHapticFeedback();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const handleImpactPress = useCallback(() => {
    void triggerHaptic('heavy');
    navigation.navigate('ImpactTab');
  }, [navigation, triggerHaptic]);

  const handleActionsPress = useCallback(() => {
    void triggerHaptic('heavy');
    navigation.navigate('InfoTab');
  }, [navigation, triggerHaptic]);

  return (
    <PerfectContainer
      preset="section"
      flexDirection="row"
      gap={PerfectSpacing.base}
      paddingHorizontal={PerfectSpacing.xs}
      marginVertical={PerfectSpacing.base}
    >
      {/* SCOPRI IL NOSTRO IMPATTO */}
      <PlatformTouchable
        style={{ flex: 1 }}
        onPress={handleImpactPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer style={styles.buttonContainer}>
            <MaterialCommunityIcons
              name="chart-line"
              size={scale(28)}
              color={Colors.primary[500]}
            />
            <PerfectText
              size={20}
              fontWeight="bold"
              lines={2}
              color={Colors.primary[500]}
              textAlign="center"
              style={{ marginVertical: PerfectSpacing.xs, ...Shadows.sm }}
            >
              Scopri{'\n'}Impatto
            </PerfectText>
            <PerfectContainer flexDirection="row" alignItems="center" gap={PerfectSpacing.sm}>
              <MaterialCommunityIcons
                name="arrow-left"
                size={scale(20)}
                color={Colors.primary[500]}
              />
              <PerfectText
                size={16}
                fontWeight="bold"
                lines={1}
                color={Colors.primary[500]}
              >
                Risultati
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>
        </LinearGradient>
      </PlatformTouchable>

      {/* DONA E AIUTA */}
      <PlatformTouchable
        style={{ flex: 1 }}
        onPress={handleActionsPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={Colors.gradients.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer style={styles.buttonContainer}>
            <MaterialCommunityIcons
              name="hand-heart"
              size={scale(28)}
              color={Colors.semantic.success.main}
            />
            <PerfectText
              size={20}
              fontWeight="bold"
              lines={2}
              color={Colors.semantic.success.main}
              textAlign="center"
              style={{ marginVertical: PerfectSpacing.xs, ...Shadows.sm }}
            >
              Dona e{'\n'}Aiuta
            </PerfectText>
            <PerfectContainer flexDirection="row" alignItems="center" gap={PerfectSpacing.sm}>
              <PerfectText
                size={16}
                fontWeight="bold"
                lines={1}
                color={Colors.semantic.success.main}
              >
                Supporta
              </PerfectText>
              <MaterialCommunityIcons
                name="arrow-right"
                size={scale(20)}
                color={Colors.semantic.success.main}
              />
            </PerfectContainer>
          </PerfectContainer>
        </LinearGradient>
      </PlatformTouchable>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  gradientBorder: {
    borderRadius: BorderRadius.xl,
    padding: scale(3),
    ...Shadows.lg,
  },

  buttonContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(3),
    minHeight: scaleTouch(105),
    paddingVertical: scaleSpacing(12),
    paddingHorizontal: scaleSpacing(12),
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
});
