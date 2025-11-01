import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors, BorderRadius, Shadows  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
}

/**
 * Sezione dei risultati 2024 con header decorativo e statistiche annuali
 */
export const Results2024Section: React.FC<Props> = ({ animations }) => {
  return (
    <PerfectContainer style={styles.record2024Section}>
      {/* Header DRAMATICALLY ENHANCED */}
      <Animated.View
        style={[
          styles.results2024HeaderContainer,
          {
            opacity: animations.statsAnimations[1],
            transform: [{ scale: animations.statsAnimations[1] }],
          },
        ]}
      >
        <PerfectContainer style={styles.results2024HeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            style={styles.results2024Title}
          >
            🎯 Risultati Raggiunti
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            fontWeight="500"
            style={styles.results2024Subtitle}
          >
            I numeri che raccontano il nostro impegno annuale
          </PerfectText>
        </PerfectContainer>
      </Animated.View>

      {/* Cards informative senza "superato" */}
      <PerfectContainer style={styles.record2024Grid}>
        <Animated.View
          style={[
            styles.record2024Card,
            {
              opacity: animations.statsAnimations[2],
              transform: [{ scale: animations.statsAnimations[2] }],
            },
          ]}
        >
          <PerfectContainer style={styles.record2024CardContent}>
            <MaterialCommunityIcons
              name="food-apple"
              size={28}
              color={Colors.primary[600]}
            />
            <PerfectText
              size={24}
              lines={1}
              fontWeight="700"
              style={styles.record2024Value}
            >
              3.14M
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
              fontWeight="600"
              style={styles.record2024Label}
            >
              Pasti Confezionati
            </PerfectText>
            <PerfectText
              size={14}
              lines={1}
              fontWeight="500"
              style={styles.record2024Description}
            >
              Prodotti nel 2024
            </PerfectText>
          </PerfectContainer>
        </Animated.View>

        <Animated.View
          style={[
            styles.record2024Card,
            {
              opacity: animations.statsAnimations[3],
              transform: [{ scale: animations.statsAnimations[3] }],
            },
          ]}
        >
          <PerfectContainer style={styles.record2024CardContent}>
            <MaterialCommunityIcons
              name="package-variant"
              size={28}
              color={Colors.neutral[800]}
            />
            <PerfectText
              size={24}
              lines={1}
              fontWeight="700"
              style={styles.record2024Value}
            >
              16.3K
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
              fontWeight="600"
              style={styles.record2024Label}
            >
              Kit Confezionati
            </PerfectText>
            <PerfectText
              size={14}
              lines={1}
              fontWeight="500"
              style={styles.record2024Description}
            >
              Creati nel 2024
            </PerfectText>
          </PerfectContainer>
        </Animated.View>
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Record 2024 Section - INGRANDITA
  record2024Section: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    marginBottom: PerfectSpacing.xl,
  },
  record2024Grid: {
    flexDirection: 'row',
    gap: PerfectSpacing.md,
  },
  record2024Card: {
    flex: 1,
  },
  record2024CardContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    paddingVertical: PerfectSpacing.md,
    paddingHorizontal: PerfectSpacing.sm,
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: Colors.neutral[200],
    ...Shadows.sm,
  },
  record2024Value: {
    color: Colors.neutral[800],
    marginTop: PerfectSpacing.xs,
    marginBottom: PerfectSpacing.xs,
    textAlign: 'center',
  },
  record2024Label: {
    color: Colors.neutral[700],
    marginBottom: PerfectSpacing.xs,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  record2024Description: {
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: PerfectSpacing.xs,
    paddingHorizontal: PerfectSpacing.xs,
  },

  // Results 2024 Section - DRAMATICALLY ENHANCED
  results2024HeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  results2024HeaderBackground: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
  },
  results2024Title: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(-0.4),
    includeFontPadding: false,
    ...Shadows.sm,
  },
  results2024Subtitle: {
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    opacity: 0.9,
    letterSpacing: scale(0.1),
  },
});
