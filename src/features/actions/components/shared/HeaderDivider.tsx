import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer } from '@/components/ui';
import { Colors, Spacing } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';

interface HeaderDividerProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const HeaderDivider: React.FC<HeaderDividerProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dividerContainer: {
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[4],
          alignItems: 'center',
        },
        mainDivider: {
          height: scale(3),
          backgroundColor: Colors.neutral[300],
          width: '80%',
          borderRadius: scale(1),
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
    >
      <PerfectContainer style={styles.mainDivider} />
    </Animated.View>
  );
};

export default HeaderDivider;
