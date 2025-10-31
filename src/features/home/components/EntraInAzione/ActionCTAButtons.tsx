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
} from '../../../../components/ui';
import {
  BorderRadius,
  Colors,
  Spacing,
  Shadows,
} from '../../../../shared/constants/designTokens';
import { scale } from '../../../../shared/constants/perfectScale';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import type { BottomTabParamList } from '../../../../navigation/types';

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
      gap={Spacing[4]}
      paddingHorizontal={Spacing[1]}
      marginVertical={Spacing[4]}
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
          <PerfectContainer style={styles.whiteContainer}>
            <PerfectContainer style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="chart-line"
                size={scale(28)}
                color={Colors.primary[600]}
                style={styles.buttonIcon}
              />
              <PerfectText
                size={20}
                fontWeight="bold"
                lines={2}
                containerWidth={scale(140)}
                style={styles.buttonTitle}
              >
                Scopri{'\n'}Impatto
              </PerfectText>
              <PerfectContainer style={styles.directionRowRed}>
                <MaterialCommunityIcons
                  name="arrow-left"
                  size={scale(18)}
                  color={Colors.primary[500]}
                />
                <PerfectText
                  size={16}
                  fontWeight="bold"
                  lines={1}
                  containerWidth={scale(110)}
                  style={styles.buttonDirectionRed}
                >
                  Risultati
                </PerfectText>
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>
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
          <PerfectContainer style={styles.whiteContainer}>
            <PerfectContainer style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="hand-heart"
                size={scale(28)}
                color={Colors.semantic.success.dark}
                style={styles.buttonIcon}
              />
              <PerfectText
                size={20}
                fontWeight="bold"
                lines={2}
                containerWidth={scale(140)}
                textAlign="center"
                style={styles.buttonTitleGreen}
              >
                Dona e{'\n'}Aiuta
              </PerfectText>
              <PerfectContainer style={styles.directionRowGreen}>
                <PerfectText
                  size={16}
                  fontWeight="bold"
                  lines={1}
                  containerWidth={scale(110)}
                  style={styles.buttonDirection}
                >
                  Supporta
                </PerfectText>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={scale(18)}
                  color={Colors.semantic.success.main}
                />
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>
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
    borderRadius: BorderRadius.xl,
    padding: scale(3),
    ...Shadows.lg,
  },

  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(3),
    minHeight: scale(105),
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    justifyContent: 'center',
    flex: 1,
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    minHeight: scale(85),
    paddingTop: Spacing[1],
    paddingBottom: Spacing[1],
  },

  buttonIcon: {
    textAlign: 'center' as const,
    textAlignVertical: 'center' as const,
  },

  buttonTitle: {
    color: Colors.primary[600],
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    marginVertical: Spacing[1],
    ...Shadows.sm,
    textAlignVertical: 'center' as const,
  },

  buttonDirection: {
    color: Colors.semantic.success.main,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    marginVertical: Spacing[1],
    ...Shadows.sm,
    textAlignVertical: 'center' as const,
  },

  buttonDirectionRed: {
    color: Colors.semantic.error.main,
    textAlign: 'center' as const,
    letterSpacing: 0.3,
    marginVertical: Spacing[1],
    ...Shadows.sm,
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
    color: Colors.semantic.success.dark,
    textAlign: 'center' as const,
    letterSpacing: -0.6,
    marginVertical: Spacing[1],
    ...Shadows.sm,
    textAlignVertical: 'center' as const,
  },
});
