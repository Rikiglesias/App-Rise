import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface HeaderDividerProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const HeaderDivider: React.FC<HeaderDividerProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dividerContainer: {
          paddingHorizontal: PerfectSpacing.base,
          paddingVertical: PerfectSpacing.base,
          alignItems: 'center',
        },
        mainDivider: {
          height: scale(4),
          backgroundColor: Colors.neutral[300],
          width: scale(314),  // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
          borderRadius: scale(2),
          opacity: 0.8,
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: scale(1) },
          shadowOpacity: 0.15,
          shadowRadius: scale(3),
          elevation: 2,
        },
      }),
    []
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
