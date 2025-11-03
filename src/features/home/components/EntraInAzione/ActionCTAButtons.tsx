import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { BottomTabParamList } from '@/navigation/types';
import {
  PerfectIcon,
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import {
  BorderRadius,
  Colors,
  Typography,
} from '@/shared/constants/designTokens';
import { PerfectSpacing, IconClamps } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

const ActionCTAButtonsComponent: React.FC = () => {
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
      testID="home-cta-section"
    >
      {/* SCOPRI IL NOSTRO IMPATTO */}
      <PlatformTouchable
        style={{ flex: 1 }}
        onPress={handleImpactPress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel="Scopri il nostro impatto"
        accessibilityHint="Apre la sezione Impatto"
        testID="cta-impact"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer style={styles.buttonContainer}>
            <PerfectIcon name="chart-line" size={28} color={Colors.primary[500]} />
            <PerfectText
              size={20}
              lines={2}
              color={Colors.primary[500]}
              textAlign="center"
              style={styles.buttonTitle}
              testID="cta-impact-label"
            >
              Scopri{'\n'}Impatto
            </PerfectText>
            <PerfectContainer
              flexDirection="row"
              alignItems="center"
              gap={PerfectSpacing.sm}
            >
              <PerfectIcon name="arrow-left" size={20} {...IconClamps.chevron} color={Colors.primary[500]} />
              <PerfectText
                size={16}
                lines={1}
                color={Colors.primary[500]}
                style={styles.buttonSubtext}
                testID="cta-impact-sub"
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
        accessibilityRole="button"
        accessibilityLabel="Dona e aiuta"
        accessibilityHint="Apre la sezione Azioni"
        testID="cta-donate"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LinearGradient
          colors={Colors.gradients.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer style={styles.buttonContainer}>
            <PerfectIcon name="hand-heart" size={28} color={Colors.semantic.success.main} />
            <PerfectText
              size={20}
              lines={2}
              color={Colors.semantic.success.main}
              textAlign="center"
              style={styles.buttonTitle}
              testID="cta-donate-label"
            >
              Dona e{'\n'}Aiuta
            </PerfectText>
            <PerfectContainer
              flexDirection="row"
              alignItems="center"
              gap={PerfectSpacing.sm}
            >
              <PerfectText
                size={16}
                lines={1}
                color={Colors.semantic.success.main}
                style={styles.buttonSubtext}
                testID="cta-donate-sub"
              >
                Supporta
              </PerfectText>
              <PerfectIcon name="arrow-right" size={20} {...IconClamps.chevron} color={Colors.semantic.success.main} />
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
  },

  buttonContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(3),
    minHeight: scale(105),
    paddingVertical: PerfectSpacing.sm,
    paddingHorizontal: PerfectSpacing.sm,
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },

  buttonTitle: {
    fontWeight: Typography.weights.bold,
    marginVertical: PerfectSpacing.xs,
  },

  buttonSubtext: {
    fontWeight: Typography.weights.bold,
  },
});

export const ActionCTAButtons = React.memo(ActionCTAButtonsComponent);

