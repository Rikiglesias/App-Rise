import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

interface HeaderDividerProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const HeaderDivider: React.FC<HeaderDividerProps> = ({ animations }) => {
  const colors = useThemeColors();
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dividerContainer: {
          paddingHorizontal: PerfectSpacing.base,
          paddingTop: PerfectSpacing.lg,
          paddingBottom: PerfectSpacing.xl,
          alignItems: 'center',
        },
        mainDivider: {
          height: scale(4),
          backgroundColor: colors.neutral[200],
          width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
          borderRadius: scale(2),
          opacity: 1,
        },
      }),
    [colors]
  );

  return (
    <Animated.View
      style={[
        styles.dividerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [{ translateY: animations.slideAnim }],
        },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no"
      testID="actions-header-divider"
    >
      <PerfectContainer style={styles.mainDivider} />
    </Animated.View>
  );
};

export default HeaderDivider;
