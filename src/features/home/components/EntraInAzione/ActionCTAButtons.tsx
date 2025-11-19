import React, { useCallback, useMemo } from 'react';
import { StyleSheet, PixelRatio, View } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
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
import { useTranslation } from '@/shared/hooks/useTranslation';

// Helper tipizzato per ottenere il threshold
const getFontScaleThreshold = (): number => {
  const expoExtra = Constants.expoConfig?.extra as
    | Record<string, unknown>
    | undefined;
  const updatesExtra = (
    Updates as unknown as { manifest?: { extra?: Record<string, unknown> } }
  ).manifest?.extra;

  return (
    (expoExtra?.fontScaleUnlockThreshold as number | undefined) ??
    (updatesExtra?.fontScaleUnlockThreshold as number | undefined) ??
    1.3
  );
};

const ActionCTAButtonsComponent: React.FC = () => {
  const { t } = useTranslation();
  const { triggerHaptic } = useHapticFeedback();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const fontScale = PixelRatio.getFontScale();
  const threshold = getFontScaleThreshold();
  const isLargeFontScale = fontScale > threshold;

  // Memoize conditional styles
  const conditionalStyles = useMemo(
    () => ({
      buttonPadding: isLargeFontScale
        ? { paddingHorizontal: PerfectSpacing.md }
        : {},
      subTextPadding: isLargeFontScale
        ? { paddingHorizontal: PerfectSpacing.xs }
        : {},
    }),
    [isLargeFontScale]
  );

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
        style={styles.buttonWrapper}
        onPress={handleImpactPress}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={t('home.ctaImpactLabel')}
        accessibilityHint={t('home.ctaImpactHint')}
        testID="cta-impact"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LinearGradient
          colors={Colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer
            style={[styles.buttonContainer, conditionalStyles.buttonPadding]}
          >
            <PerfectIcon
              name="chart-line"
              size={30}
              color={Colors.primary[500]}
            />
            <PerfectText
              size={22}
              lines={2}
              color={Colors.primary[500]}
              textAlign="center"
              style={styles.buttonTitle}
              testID="cta-impact-label"
            >
              {t('home.ctaImpactButton')}
            </PerfectText>
            <PerfectContainer
              style={[styles.buttonFooter, conditionalStyles.subTextPadding]}
            >
              <View style={styles.buttonDivider} />
              <PerfectContainer style={styles.footerRow}>
                <PerfectIcon
                  name="arrow-left"
                  size={20}
                  {...IconClamps.chevron}
                  color={Colors.primary[500]}
                />
                <PerfectText
                  size={18}
                  lines={1}
                  color={Colors.primary[500]}
                  textAlign="center"
                  style={styles.buttonSubtext}
                  testID="cta-impact-sub"
                >
                  {t('home.ctaImpactSub')}
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
        accessibilityRole="button"
        accessibilityLabel={t('home.ctaDonateLabel')}
        accessibilityHint={t('home.ctaDonateHint')}
        testID="cta-donate"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LinearGradient
          colors={Colors.gradients.success}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <PerfectContainer
            style={[styles.buttonContainer, conditionalStyles.buttonPadding]}
          >
            <PerfectIcon
              name="hand-heart"
              size={30}
              color={Colors.semantic.success.main}
            />
            <PerfectText
              size={22}
              lines={2}
              color={Colors.semantic.success.main}
              textAlign="center"
              style={styles.buttonTitle}
              testID="cta-donate-label"
            >
              {t('home.ctaDonateButton')}
            </PerfectText>
            <PerfectContainer
              style={[styles.buttonFooter, conditionalStyles.subTextPadding]}
            >
              <View style={styles.buttonDivider} />
              <PerfectContainer style={styles.footerRow}>
                <PerfectText
                  size={18}
                  lines={1}
                  color={Colors.semantic.success.main}
                  textAlign="center"
                  style={styles.buttonSubtext}
                  testID="cta-donate-sub"
                >
                  {t('home.ctaDonateSub')}
                </PerfectText>
                <PerfectIcon
                  name="arrow-right"
                  size={20}
                  {...IconClamps.chevron}
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
  buttonFooter: {
    width: '100%',
    alignItems: 'center',
    marginTop: PerfectSpacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: PerfectSpacing.xs,
  },
  buttonDivider: {
    width: '70%',
    height: StyleSheet.hairlineWidth * 2,
    backgroundColor: Colors.neutral[100],
    borderRadius: 999,
    marginBottom: PerfectSpacing.sm,
  },
});

export const ActionCTAButtons = React.memo(ActionCTAButtonsComponent);
