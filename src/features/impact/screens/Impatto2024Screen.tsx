import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  PerfectText,
  PlatformScrollView,
  PerfectContainer,
} from '../../../components/ui';
// Ratio inline per evitare dipendenze condivise
import responsiveSystem from '../../../shared/constants/responsiveSystem';

import type { RootStackParamList } from '../../../navigation/types';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
} from '../../../shared/constants/designTokens';

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
    <SafeAreaView style={styles.container}>
      <PlatformScrollView>
        <PerfectContainer style={styles.header}>
          <PerfectText
            size={36}
            lines={1}
            fontWeight="600"
            containerWidth={
              (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
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
              (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
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
              (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
            }
            style={styles.subtitle}
          >
            Risultati raggiunti insieme
          </PerfectText>
        </PerfectContainer>

        <PerfectContainer style={styles.statsSection}>
          <PerfectContainer style={styles.statCard}>
            <PerfectText
              size={28}
              lines={1}
              fontWeight="400"
              style={styles.statIcon}
            >
              🍽️
            </PerfectText>
            <PerfectText
              size={24}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              3.14M
            </PerfectText>
            <PerfectText
              size={18}
              lines={1}
              fontWeight="400"
              style={styles.statLabel}
            >
              Pasti Confezionati
            </PerfectText>
            <PerfectText
              size={14}
              lines={2}
              fontWeight="400"
              style={styles.statDesc}
            >
              Nutrizione per comunità in difficoltà
            </PerfectText>
          </PerfectContainer>

          <PerfectContainer style={styles.statCard}>
            <PerfectText
              size={28}
              lines={1}
              fontWeight="400"
              style={styles.statIcon}
            >
              📦
            </PerfectText>
            <PerfectText
              size={24}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              16.3K
            </PerfectText>
            <PerfectText
              size={18}
              lines={1}
              fontWeight="400"
              style={styles.statLabel}
            >
              Kit Prodotti
            </PerfectText>
            <PerfectText
              size={14}
              lines={2}
              fontWeight="400"
              style={styles.statDesc}
            >
              Kit completi per emergenze
            </PerfectText>
          </PerfectContainer>

          <PerfectContainer style={styles.statCard}>
            <PerfectText
              size={28}
              lines={1}
              fontWeight="400"
              style={styles.statIcon}
            >
              👥
            </PerfectText>
            <PerfectText
              size={24}
              lines={1}
              fontWeight="400"
              style={styles.statNumber}
            >
              13K
            </PerfectText>
            <PerfectText
              size={18}
              lines={1}
              fontWeight="400"
              style={styles.statLabel}
            >
              Volontari
            </PerfectText>
            <PerfectText
              size={14}
              lines={2}
              fontWeight="400"
              style={styles.statDesc}
            >
              Persone che hanno fatto la differenza
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>

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
            <PerfectContainer style={styles.impactItem}>
              <PerfectText
                size={18}
                lines={1}
                fontWeight="400"
                style={styles.impactIcon}
              >
                🌍
              </PerfectText>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.impactText}
              >
                Africa Subsahariana
              </PerfectText>
            </PerfectContainer>
            <PerfectContainer style={styles.impactItem}>
              <PerfectText
                size={18}
                lines={1}
                fontWeight="400"
                style={styles.impactIcon}
              >
                🏫
              </PerfectText>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.impactText}
              >
                Programmi scolastici
              </PerfectText>
            </PerfectContainer>
            <PerfectContainer style={styles.impactItem}>
              <PerfectText
                size={18}
                lines={1}
                fontWeight="400"
                style={styles.impactIcon}
              >
                🚨
              </PerfectText>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.impactText}
              >
                Emergenze umanitarie
              </PerfectText>
            </PerfectContainer>
            <PerfectContainer style={styles.impactItem}>
              <PerfectText
                size={18}
                lines={1}
                fontWeight="400"
                style={styles.impactIcon}
              >
                🇮🇹
              </PerfectText>
              <PerfectText
                size={16}
                lines={1}
                fontWeight="400"
                style={styles.impactText}
              >
                Comunità italiane
              </PerfectText>
            </PerfectContainer>
          </PerfectContainer>
        </PerfectContainer>

        <PerfectContainer style={styles.goalSection}>
          <PerfectText
            size={36}
            lines={1}
            fontWeight="400"
            style={styles.goalIcon}
          >
            🎯
          </PerfectText>
          <PerfectText
            size={18}
            lines={1}
            fontWeight="400"
            style={styles.goalTitle}
          >
            Obiettivo 2025
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            fontWeight="400"
            style={styles.goalText}
          >
            Superare i 4 milioni di pasti confezionati
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
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  year: {
    fontWeight: '600',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  title: {
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  subtitle: {
    fontWeight: '500',
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: Spacing[3],
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },

  statsSection: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    gap: Spacing[4],
  },

  statCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    ...Shadows.sm,
  },

  statIcon: {
    marginBottom: Spacing[3],
  },

  statNumber: {
    fontWeight: '600',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  statLabel: {
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  statDesc: {
    fontWeight: '400',
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing[1],
  },

  impactSection: {
    backgroundColor: Colors.neutral[0],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    ...Shadows.sm,
  },

  impactTitle: {
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  impactList: {
    gap: Spacing[3],
  },

  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  impactIcon: {
    marginRight: Spacing[3],
  },

  impactText: {
    fontWeight: '500',
    color: Colors.neutral[700],
  },

  goalSection: {
    backgroundColor: Colors.primary[50],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },

  goalIcon: {
    marginBottom: Spacing[3],
  },

  goalTitle: {
    fontWeight: '600',
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  goalText: {
    fontWeight: '500',
    color: Colors.primary[700],
    textAlign: 'center',
  },
});

const Impatto2024Screen = React.memo(Impatto2024ScreenComponent);

export default Impatto2024Screen;
