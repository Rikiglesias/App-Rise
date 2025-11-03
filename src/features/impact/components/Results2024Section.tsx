import React from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

/**
 * Sezione dei risultati 2024 con header decorativo e statistiche annuali
 */
export const Results2024Section: React.FC = () => {
  return (
    <PerfectContainer style={styles.record2024Section}>
      {/* Header DRAMATICALLY ENHANCED */}
      <PerfectContainer style={styles.results2024HeaderContainer}>
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
      </PerfectContainer>

      {/* Cards informative senza "superato" */}
      <PerfectContainer style={styles.record2024Grid}>
        <StatCard
          icon="food-apple"
          iconColor={Colors.primary[600]}
          value="3.14M"
          label="Pasti Confezionati"
          subtitle="Prodotti nel 2024"
          gradientColors={[Colors.primary[500], Colors.primary[700]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
        <StatCard
          icon="package-variant"
          iconColor={Colors.neutral[800]}
          value="16.3K"
          label="Kit Confezionati"
          subtitle="Creati nel 2024"
          gradientColors={[Colors.neutral[600], Colors.neutral[800]]}
          pressable={false}
          showChevron={false}
          withGradientBorder={false}
        />
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
    gap: PerfectSpacing.base,
  },

  // Results 2024 Section - DRAMATICALLY ENHANCED
  results2024HeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  results2024HeaderBackground: {
    alignSelf: 'stretch',
    backgroundColor: Colors.neutral[0],
    borderRadius: scale(16),
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[300],
  },
  results2024Title: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
  },
  results2024Subtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    opacity: 0.8,
    letterSpacing: 0,
  },
});
