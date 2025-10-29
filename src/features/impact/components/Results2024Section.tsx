import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { PerfectText, PerfectContainer } from '@/components/ui';
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';
import {
  Colors,
  Spacing,
  Typography,
} from '@/shared/constants/designTokens';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';

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
            style={styles.results2024Title}
          >
            🎯 Risultati Raggiunti
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
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
              size={scaleDimensionLinear(28)}
              color={Colors.primary[600]}
            />
            <PerfectText
              size={24}
              lines={1}
                style={styles.record2024Value}
            >
              3.14M
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
                style={styles.record2024Label}
            >
              Pasti Confezionati
            </PerfectText>
            <PerfectText
              size={14}
              lines={1}
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
              size={scaleDimensionLinear(28)}
              color={Colors.neutral[800]}
            />
            <PerfectText
              size={24}
              lines={1}
                style={styles.record2024Value}
            >
              16.3K
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
                style={styles.record2024Label}
            >
              Kit Confezionati
            </PerfectText>
            <PerfectText
              size={14}
              lines={1}
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
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
  },
  record2024Grid: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  record2024Card: {
    flex: 1,
  },
  record2024CardContent: {
    backgroundColor: Colors.neutral[50],
    borderRadius: 16,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[2],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
    shadowColor: Colors.black.pure,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  record2024Value: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginTop: Spacing[1],
    marginBottom: Spacing[1],
    textAlign: 'center',
  },
  record2024Label: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
    marginBottom: Spacing[1],
    textAlign: 'center',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  record2024Description: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[500],
    textAlign: 'center',
    marginTop: Spacing[1],
    lineHeight: 18,
    paddingHorizontal: Spacing[1],
  },

  // Results 2024 Section - DRAMATICALLY ENHANCED
  results2024HeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  results2024HeaderBackground: {
    backgroundColor:
      Platform.OS === 'android'
        ? Colors.neutral[100] // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200] // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: Colors.neutral[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  results2024Title: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.bold, // BOLD normale
    color: Colors.neutral[700], // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  results2024Subtitle: {
    // fontSize rimosso - ora gestito da PerfectText
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});
