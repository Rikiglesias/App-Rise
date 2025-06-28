/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';

import type { RootStackParamList } from '../../../navigation/types';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
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
          <Text style={styles.year}>2024</Text>
          <Text style={styles.title}>Il Nostro Impatto</Text>
          <Text style={styles.subtitle}>Risultati raggiunti insieme</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🍽️</Text>
            <Text style={styles.statNumber}>3.1M</Text>
            <Text style={styles.statLabel}>Pasti Confezionati</Text>
            <Text style={styles.statDesc}>
              Nutrizione per comunità in difficoltà
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📦</Text>
            <Text style={styles.statNumber}>16K</Text>
            <Text style={styles.statLabel}>Kit Prodotti</Text>
            <Text style={styles.statDesc}>Kit completi per emergenze</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statNumber}>13K</Text>
            <Text style={styles.statLabel}>Volontari</Text>
            <Text style={styles.statDesc}>
              Persone che hanno fatto la differenza
            </Text>
          </View>
        </View>

        <View style={styles.impactSection}>
          <Text style={styles.impactTitle}>Dove Arrivano i Nostri Aiuti</Text>

          <View style={styles.impactList}>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🌍</Text>
              <Text style={styles.impactText}>Africa Subsahariana</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🏫</Text>
              <Text style={styles.impactText}>Programmi scolastici</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🚨</Text>
              <Text style={styles.impactText}>Emergenze umanitarie</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactIcon}>🇮🇹</Text>
              <Text style={styles.impactText}>Comunità italiane</Text>
            </View>
          </View>
        </View>

        <View style={styles.goalSection}>
          <Text style={styles.goalIcon}>🎯</Text>
          <Text style={styles.goalTitle}>Obiettivo 2025</Text>
          <Text style={styles.goalText}>
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
    fontSize: Typography.sizes['4xl'],
    fontWeight: '900',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  subtitle: {
    fontSize: Typography.sizes.base,
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
    fontSize: 32,
    marginBottom: Spacing[3],
  },

  statNumber: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: '800',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  statLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  statDesc: {
    fontSize: Typography.sizes.sm,
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
    fontSize: Typography.sizes.xl,
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
    fontSize: 20,
    marginRight: Spacing[3],
  },

  impactText: {
    fontSize: Typography.sizes.base,
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
    fontSize: 40,
    marginBottom: Spacing[3],
  },

  goalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  goalText: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.primary[700],
    textAlign: 'center',
  },
});

export default Impatto2024Screen;
