import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatCard, ImpactItem } from '../components/Impatto2024Components';
import { STATS_2024, IMPACT_AREAS, GOAL_2025 } from '../data/impatto2024Data';
import type { RootStackParamList } from '@/navigation/types';
import {
  PerfectText,
  PlatformScrollView,
  PerfectContainer,
} from '@/components/ui';
import { LOGICAL_REFERENCE, scale } from '@/shared/constants/perfectScale';
import {
  BorderRadius,
  Colors,
  Shadows,
} from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';

type Impatto2024ScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Impatto2024'
>;

interface Props {
  readonly navigation: Impatto2024ScreenNavigationProp;
}

const Impatto2024ScreenComponent: React.FC<Props> = ({
  navigation: _navigation,
}) => {
  return (
    <SafeAreaView 
      style={styles.container}
      edges={['top', 'bottom']}
      accessibilityLabel="Schermata Impatto 2024"
      testID="impatto2024-screen"
    >
      <PlatformScrollView>
        <PerfectContainer style={styles.header}>
          <PerfectText
            size={36}
            lines={1}
            fontWeight="600"
            containerWidth={
              LOGICAL_REFERENCE.width * 0.7
            }
            style={styles.year}
          >
            2024
          </PerfectText>
          <PerfectText
            size={20}
            lines={1}
            fontWeight="600"
            containerWidth={
              LOGICAL_REFERENCE.width * 0.7
            }
            style={styles.title}
          >
            Il Nostro Impatto
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            fontWeight="500"
            containerWidth={
              LOGICAL_REFERENCE.width * 0.7
            }
            style={styles.subtitle}
          >
            Risultati raggiunti insieme
          </PerfectText>
        </PerfectContainer>

        {/* Stats Cards - Data-driven rendering */}
        <PerfectContainer style={styles.statsSection}>
          {STATS_2024.map((stat) => (
            <StatCard key={stat.label} data={stat} />
          ))}
        </PerfectContainer>

        {/* Impact Areas Section */}
        <PerfectContainer style={styles.impactSection}>
          <PerfectText
            size={18}
            lines={1}
            fontWeight="400"
            style={styles.impactTitle}
          >
            Dove Arrivano i Nostri Aiuti
          </PerfectText>

          <PerfectContainer style={styles.impactList}>
            {IMPACT_AREAS.map((area) => (
              <ImpactItem key={area.text} data={area} />
            ))}
          </PerfectContainer>
        </PerfectContainer>

        {/* Goal 2025 Section */}
        <PerfectContainer style={styles.goalSection}>
          <PerfectText
            size={36}
            lines={1}
            fontWeight="400"
            style={styles.goalIcon}
          >
            {GOAL_2025.icon}
          </PerfectText>
          <PerfectText
            size={18}
            lines={1}
            fontWeight="400"
            style={styles.goalTitle}
          >
            {GOAL_2025.title}
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            fontWeight="400"
            style={styles.goalText}
          >
            {GOAL_2025.description}
          </PerfectText>
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  header: {
    backgroundColor: Colors.neutral[0],
    paddingVertical: PerfectSpacing.xl,
    paddingHorizontal: PerfectSpacing.lg,
    alignItems: 'center',
  },

  year: {
    color: Colors.primary[600],
    textAlign: 'center',
  },

  title: {
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
  },

  subtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    backgroundColor: Colors.primary[50],
    paddingHorizontal: PerfectSpacing.base,
    paddingVertical: PerfectSpacing.sm,
    borderRadius: BorderRadius.full,
  },

  statsSection: {
    marginHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    gap: PerfectSpacing.base,
  },

  impactSection: {
    backgroundColor: Colors.neutral[0],
    marginHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    borderRadius: BorderRadius.lg,
    padding: PerfectSpacing.lg,
    ...Shadows.sm,
  },

  impactTitle: {
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: PerfectSpacing.base,
  },

  impactList: {
    gap: PerfectSpacing.md,
  },

  goalSection: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    marginBottom: PerfectSpacing.xl,
    borderRadius: BorderRadius.lg,
    padding: PerfectSpacing.lg,
    alignItems: 'center',
    borderWidth: scale(1),
    borderColor: Colors.primary[200],
  },

  goalIcon: {
    marginBottom: PerfectSpacing.md,
  },

  goalTitle: {
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: PerfectSpacing.sm,
  },

  goalText: {
    color: Colors.primary[700],
    textAlign: 'center',
  },
});

const Impatto2024Screen = React.memo(Impatto2024ScreenComponent);

export default Impatto2024Screen;
