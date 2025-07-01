/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { FormattedText, PlatformScrollView } from '../../../components/ui';

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

const Impatto2024Screen: React.FC<Props> = ({ navigation: _navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView>
        <View style={styles.header}>
          <FormattedText variant="display-small" style={styles.year}>
            2024
          </FormattedText>
          <FormattedText variant="headline-small" style={styles.title}>
            Il Nostro Impatto
          </FormattedText>
          <FormattedText variant="body-large" style={styles.subtitle}>
            Risultati raggiunti insieme
          </FormattedText>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <FormattedText variant="headline-large" style={styles.statIcon}>
              🍽️
            </FormattedText>
            <FormattedText variant="headline-medium" style={styles.statNumber}>
              3.14M
            </FormattedText>
            <FormattedText
              variant="title-large"
              style={styles.statLabel}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pasti Confezionati
            </FormattedText>
            <FormattedText variant="body-medium" style={styles.statDesc}>
              Nutrizione per comunità in difficoltà
            </FormattedText>
          </View>

          <View style={styles.statCard}>
            <FormattedText variant="headline-large" style={styles.statIcon}>
              📦
            </FormattedText>
            <FormattedText variant="headline-medium" style={styles.statNumber}>
              16.3K
            </FormattedText>
            <FormattedText
              variant="title-large"
              style={styles.statLabel}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Kit Prodotti
            </FormattedText>
            <FormattedText variant="body-medium" style={styles.statDesc}>
              Kit completi per emergenze
            </FormattedText>
          </View>

          <View style={styles.statCard}>
            <FormattedText variant="headline-large" style={styles.statIcon}>
              👥
            </FormattedText>
            <FormattedText variant="headline-medium" style={styles.statNumber}>
              13K
            </FormattedText>
            <FormattedText variant="title-large" style={styles.statLabel}>
              Volontari
            </FormattedText>
            <FormattedText variant="body-medium" style={styles.statDesc}>
              Persone che hanno fatto la differenza
            </FormattedText>
          </View>
        </View>

        <View style={styles.impactSection}>
          <FormattedText variant="title-medium" style={styles.impactTitle}>
            Dove Arrivano i Nostri Aiuti
          </FormattedText>

          <View style={styles.impactList}>
            <View style={styles.impactItem}>
              <FormattedText variant="title-medium" style={styles.impactIcon}>
                🌍
              </FormattedText>
              <FormattedText variant="body-large" style={styles.impactText}>
                Africa Subsahariana
              </FormattedText>
            </View>
            <View style={styles.impactItem}>
              <FormattedText variant="title-medium" style={styles.impactIcon}>
                🏫
              </FormattedText>
              <FormattedText variant="body-large" style={styles.impactText}>
                Programmi scolastici
              </FormattedText>
            </View>
            <View style={styles.impactItem}>
              <FormattedText variant="title-medium" style={styles.impactIcon}>
                🚨
              </FormattedText>
              <FormattedText variant="body-large" style={styles.impactText}>
                Emergenze umanitarie
              </FormattedText>
            </View>
            <View style={styles.impactItem}>
              <FormattedText variant="title-medium" style={styles.impactIcon}>
                🇮🇹
              </FormattedText>
              <FormattedText variant="body-large" style={styles.impactText}>
                Comunità italiane
              </FormattedText>
            </View>
          </View>
        </View>

        <View style={styles.goalSection}>
          <FormattedText variant="display-small" style={styles.goalIcon}>
            🎯
          </FormattedText>
          <FormattedText variant="title-medium" style={styles.goalTitle}>
            Obiettivo 2025
          </FormattedText>
          <FormattedText variant="body-large" style={styles.goalText}>
            Superare i 4 milioni di pasti confezionati
          </FormattedText>
        </View>
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
    fontWeight: '900',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  title: {
    fontWeight: '800',
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
    fontWeight: '800',
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
    fontWeight: '700',
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
    fontWeight: '700',
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

export default Impatto2024Screen;
