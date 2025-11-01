// ↑ ESLint non riesce a tracciare gli stili quando sono dentro useMemo.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useMemo } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { useNewActionsAnimations } from './ContributeAnimations';
import { PerfectContainer } from '@/components/ui';
import { Colors, Spacing } from '@/shared/constants/designTokens';

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
          height: 3, // PIÙ GROSSA: prima linea più prominente
          backgroundColor: Colors.neutral[300], // PIÙ SOFT per eleganza
          width: '80%', // PIÙ LUNGA: più estesa per maggiore presenza
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
      <PerfectContainer style={styles.mainDivider} />
    </Animated.View>
  );
};

export default HeaderDivider;
