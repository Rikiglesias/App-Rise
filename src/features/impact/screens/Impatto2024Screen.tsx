/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { ResponsiveText } from '../../../components/ui/ResponsiveText';
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
          <ResponsiveText style={[{ fontSize: 40 }, styles.year]}>
            2024
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 24 }, styles.title]}>
            Il Nostro Impatto
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 16 }, styles.subtitle]}>
            Risultati raggiunti insieme
          </ResponsiveText>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <ResponsiveText style={[{ fontSize: 32 }, styles.statIcon]}>
              🍽️
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 28 }, styles.statNumber]}>
              3.14M
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 18 }, styles.statLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Pasti Confezionati
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.statDesc]}>
              Nutrizione per comunità in difficoltà
            </ResponsiveText>
          </View>

          <View style={styles.statCard}>
            <ResponsiveText style={[{ fontSize: 32 }, styles.statIcon]}>
              📦
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 28 }, styles.statNumber]}>
              16.3K
            </ResponsiveText>
            <ResponsiveText
              style={[{ fontSize: 18 }, styles.statLabel]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              Kit Prodotti
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.statDesc]}>
              Kit completi per emergenze
            </ResponsiveText>
          </View>

          <View style={styles.statCard}>
            <ResponsiveText style={[{ fontSize: 32 }, styles.statIcon]}>
              👥
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 28 }, styles.statNumber]}>
              13K
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 18 }, styles.statLabel]}>
              Volontari
            </ResponsiveText>
            <ResponsiveText style={[{ fontSize: 14 }, styles.statDesc]}>
              Persone che hanno fatto la differenza
            </ResponsiveText>
          </View>
        </View>

        <View style={styles.impactSection}>
          <ResponsiveText style={[{ fontSize: 20 }, styles.impactTitle]}>
            Dove Arrivano i Nostri Aiuti
          </ResponsiveText>

          <View style={styles.impactList}>
            <View style={styles.impactItem}>
              <ResponsiveText style={[{ fontSize: 20 }, styles.impactIcon]}>
                🌍
              </ResponsiveText>
              <ResponsiveText style={[{ fontSize: 16 }, styles.impactText]}>
                Africa Subsahariana
              </ResponsiveText>
            </View>
            <View style={styles.impactItem}>
              <ResponsiveText style={[{ fontSize: 20 }, styles.impactIcon]}>
                🏫
              </ResponsiveText>
              <ResponsiveText style={[{ fontSize: 16 }, styles.impactText]}>
                Programmi scolastici
              </ResponsiveText>
            </View>
            <View style={styles.impactItem}>
              <ResponsiveText style={[{ fontSize: 20 }, styles.impactIcon]}>
                🚨
              </ResponsiveText>
              <ResponsiveText style={[{ fontSize: 16 }, styles.impactText]}>
                Emergenze umanitarie
              </ResponsiveText>
            </View>
            <View style={styles.impactItem}>
              <ResponsiveText style={[{ fontSize: 20 }, styles.impactIcon]}>
                🇮🇹
              </ResponsiveText>
              <ResponsiveText style={[{ fontSize: 16 }, styles.impactText]}>
                Comunità italiane
              </ResponsiveText>
            </View>
          </View>
        </View>

        <View style={styles.goalSection}>
          <ResponsiveText style={[{ fontSize: 40 }, styles.goalIcon]}>
            🎯
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 20 }, styles.goalTitle]}>
            Obiettivo 2025
          </ResponsiveText>
          <ResponsiveText style={[{ fontSize: 16 }, styles.goalText]}>
            Superare i 4 milioni di pasti confezionati
          </ResponsiveText>
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
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '900',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  title: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '800',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  subtitle: {
    // fontSize rimosso - ora gestito da ResponsiveText
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
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '800',
    color: Colors.primary[600],
    textAlign: 'center',
  },

  statLabel: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '600',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginTop: Spacing[2],
  },

  statDesc: {
    // fontSize rimosso - ora gestito da ResponsiveText
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
    // fontSize rimosso - ora gestito da ResponsiveText
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
    // fontSize rimosso - ora gestito da ResponsiveText
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
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '700',
    color: Colors.primary[800],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },

  goalText: {
    // fontSize rimosso - ora gestito da ResponsiveText
    fontWeight: '500',
    color: Colors.primary[700],
    textAlign: 'center',
  },
});

export default Impatto2024Screen;
