/* eslint-disable react-native/no-unused-styles */
import React, { useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors, Spacing } from '../../../shared/constants/designTokens';
import type { useNewActionsAnimations } from './ContributeAnimations';

interface HeaderDividerProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
}

const HeaderDivider: React.FC<HeaderDividerProps> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dividerContainer: {
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[4], // BILANCIATO: spazio equilibrato per separazione
          alignItems: 'center',
        },
        mainDivider: {
          height: 2, // ELEGANTE: altezza bilanciata
          backgroundColor: Colors.neutral[300], // PIÙ SOFT per eleganza
          width: '60%', // BILANCIATO per proporzioni migliori
          borderRadius: 1,
          opacity: 0.8, // SOTTILE trasparenza per delicatezza
          // OMBRA ELEGANTE per profondità sottile
          shadowColor: Colors.neutral[400],
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
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
      <View style={styles.mainDivider} />
    </Animated.View>
  );
};

export default HeaderDivider;
