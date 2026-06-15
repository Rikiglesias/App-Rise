import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useMemo } from 'react';
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
import { scale } from '@/shared/constants/perfectScale';
import { BorderRadius, Shadows } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

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
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top', 'bottom']}
      accessibilityLabel="Schermata Impatto 2024"
      testID="impatto2024-screen"
    >
      <PlatformScrollView>
        <PerfectContainer style={styles.header}>
          <PerfectContainer style={styles.headerContent}>
            <PerfectText
              size={36}
              lines={1}
              fontWeight="600"
              immunity={true}
              style={styles.year}
            >
              2024
            </PerfectText>
            <PerfectText
              size={20}
              lines={1}
              fontWeight="600"
              immunity={true}
              style={styles.title}
            >
              {t('impact.impactTitle')}
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
              fontWeight="500"
              immunity={true}
              style={styles.subtitle}
            >
              {t('impact.impactSubtitle')}
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>

        {/* Stats Cards - Data-driven rendering */}
        <PerfectContainer style={styles.statsSection}>
          {STATS_2024.map(stat => (
            <StatCard key={stat.labelKey} data={stat} />
          ))}
        </PerfectContainer>

        {/* Impact Areas Section */}
        <PerfectContainer style={styles.impactSection}>
          <PerfectContainer style={styles.sectionTitleContainer}>
            <PerfectText
              size={18}
              lines={1}
              fontWeight="400"
              immunity={true}
              style={styles.impactTitle}
            >
              {t('impact.whereHelpArrives')}
            </PerfectText>
          </PerfectContainer>

          <PerfectContainer style={styles.impactList}>
            {IMPACT_AREAS.map(area => (
              <ImpactItem key={area.textKey} data={area} />
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
          <PerfectContainer style={styles.sectionTitleContainer}>
            <PerfectText
              size={18}
              lines={1}
              fontWeight="400"
              immunity={true}
              style={styles.goalTitle}
            >
              {t(GOAL_2025.titleKey)}
            </PerfectText>
            <PerfectText
              size={16}
              lines={2}
              fontWeight="400"
              immunity={true}
              style={styles.goalText}
            >
              {t(GOAL_2025.descriptionKey)}
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },

    header: {
      backgroundColor: colors.neutral[0],
      paddingVertical: PerfectSpacing.xl,
      paddingHorizontal: PerfectSpacing.lg,
      alignItems: 'center',
    },

    headerContent: {
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
      alignSelf: 'center',
      alignItems: 'center',
    },

    year: {
      color: colors.primary[600],
      textAlign: 'center',
    },

    title: {
      color: colors.neutral[900],
      textAlign: 'center',
      marginTop: PerfectSpacing.sm,
    },

    subtitle: {
      color: colors.neutral[700],
      textAlign: 'center',
      marginTop: PerfectSpacing.md,
      backgroundColor: colors.primary[50],
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
      backgroundColor: colors.neutral[0],
      marginHorizontal: PerfectSpacing.base,
      marginTop: PerfectSpacing.lg,
      borderRadius: BorderRadius.lg,
      padding: PerfectSpacing.lg,
      ...Shadows.sm,
    },

    sectionTitleContainer: {
      width: scale(314), // Perfect System: 80% di 393px (iPhone 15), scala su tutti device
      alignSelf: 'center',
      alignItems: 'center',
    },

    impactTitle: {
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: PerfectSpacing.base,
    },

    impactList: {
      gap: PerfectSpacing.md,
    },

    goalSection: {
      backgroundColor: colors.primary[50],
      marginHorizontal: PerfectSpacing.base,
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing.xl,
      borderRadius: BorderRadius.lg,
      padding: PerfectSpacing.lg,
      alignItems: 'center',
      borderWidth: scale(1),
      borderColor: colors.primary[200],
    },

    goalIcon: {
      marginBottom: PerfectSpacing.md,
    },

    goalTitle: {
      color: colors.primary[800],
      textAlign: 'center',
      marginBottom: PerfectSpacing.sm,
    },

    goalText: {
      color: colors.primary[700],
      textAlign: 'center',
    },
  });

const Impatto2024Screen = React.memo(Impatto2024ScreenComponent);

export default Impatto2024Screen;
