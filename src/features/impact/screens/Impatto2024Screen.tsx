/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';

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
          <Text style={[styles.year, { fontSize: 40 }]}>2024</Text>
          <Text style={[styles.title, { fontSize: 24 }]}>
            Il Nostro Impatto
          </Text>
          <Text style={[styles.subtitle, { fontSize: 16 }]}>
            Risultati raggiunti insieme
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { fontSize: 32 }]}>🍽️</Text>
            <Text style={[styles.statNumber, { fontSize: 28 }]}>3.14M</Text>
            <Text
              style={[styles.statLabel, { fontSize: 18 }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pasti Confezionati
            </Text>
            <Text style={[styles.statDesc, { fontSize: 14 }]}>
              Nutrizione per comunità in difficoltà
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { fontSize: 32 }]}>📦</Text>
            <Text style={[styles.statNumber, { fontSize: 28 }]}>16.3K</Text>
            <Text
              style={[styles.statLabel, { fontSize: 18 }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Kit Prodotti
            </Text>
            <Text style={[styles.statDesc, { fontSize: 14 }]}>
              Kit completi per emergenze
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statIcon, { fontSize: 32 }]}>👥</Text>
            <Text style={[styles.statNumber, { fontSize: 28 }]}>13K</Text>
            <Text style={[styles.statLabel, { fontSize: 18 }]}>Volontari</Text>
            <Text style={[styles.statDesc, { fontSize: 14 }]}>
              Persone che hanno fatto la differenza
            </Text>
          </View>
        </View>

        <View style={styles.impactSection}>
          <Text style={[styles.impactTitle, { fontSize: 20 }]}>
            Dove Arrivano i Nostri Aiuti
          </Text>

          <View style={styles.impactList}>
            <View style={styles.impactItem}>
              <Text style={[styles.impactIcon, { fontSize: 20 }]}>🌍</Text>
              <Text style={[styles.impactText, { fontSize: 16 }]}>
                Africa Subsahariana
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactIcon, { fontSize: 20 }]}>🏫</Text>
              <Text style={[styles.impactText, { fontSize: 16 }]}>
                Programmi scolastici
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactIcon, { fontSize: 20 }]}>🚨</Text>
              <Text style={[styles.impactText, { fontSize: 16 }]}>
                Emergenze umanitarie
              </Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={[styles.impactIcon, { fontSize: 20 }]}>🇮🇹</Text>
              <Text style={[styles.impactText, { fontSize: 16 }]}>
                Comunità italiane
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.goalSection}>
          <Text style={[styles.goalIcon, { fontSize: 40 }]}>🎯</Text>
          <Text style={[styles.goalTitle, { fontSize: 20 }]}>
            Obiettivo 2025
          </Text>
          <Text style={[styles.goalText, { fontSize: 16 }]}>
            Superare i 4 milioni di pasti confezionati
          </Text>
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
