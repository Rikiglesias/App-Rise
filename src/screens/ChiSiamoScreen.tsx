/* eslint-disable @typescript-eslint/no-explicit-any */
import type { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../constants/designTokens';
import { useLinkHandler } from '../hooks/useLinkHandler';
import type { RootStackParamList } from '../navigation/types';
import { isSuccess } from '../utils/result';

type ChiSiamoScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ChiSiamo'
>;

interface Props {
  readonly navigation: ChiSiamoScreenNavigationProp;
}

const ChiSiamoScreen: React.FC<Props> = ({ navigation: _navigation }) => {
  const { openLink } = useLinkHandler();

  const handleLocationPress = useCallback(async () => {
    const address = 'Via dei Fornaciai, 17, 40129 Bologna, BO, Italia';
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    const result = await openLink(url, 'maps', 'Impossibile aprire la mappa.');

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open maps:', result.error);
    }
  }, [openLink]);

  const handlePhonePress = useCallback(async () => {
    const result = await openLink(
      'tel:051704070',
      'phone',
      'Impossibile aprire il dialer.'
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open dialer:', result.error);
    }
  }, [openLink]);

  const handleEmailPress = useCallback(async () => {
    const result = await openLink(
      'mailto:info@riseagainsthunger.it',
      'email',
      "Impossibile aprire l'app email."
    );

    if (!isSuccess(result) && __DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[ChiSiamoScreen] Failed to open email:', result.error);
    }
  }, [openLink]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Rise Against Hunger</Text>
          <Text style={styles.subtitle}>Italia</Text>
          <Text style={styles.mission}>Combattiamo la fame nel mondo</Text>
        </View>

        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Contatti</Text>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleLocationPress}
          >
            <Text style={styles.contactIcon}>📍</Text>
            <Text style={styles.contactText}>
              Via dei Fornaciai, 17 - Bologna
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handlePhonePress}
          >
            <Text style={styles.contactIcon}>📞</Text>
            <Text style={styles.contactText}>051 704070</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            onPress={handleEmailPress}
          >
            <Text style={styles.contactIcon}>✉️</Text>
            <Text style={styles.contactText}>info@riseagainsthunger.it</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsSection}>
          <Text style={styles.actionsTitle}>Come Aiutiamo</Text>

          <View style={styles.actionsList}>
            <View style={styles.actionItem}>
              <Text style={styles.actionIcon}>🍽️</Text>
              <Text style={styles.actionText}>Distribuzione pasti</Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.actionIcon}>🌱</Text>
              <Text style={styles.actionText}>Sviluppo sostenibile</Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.actionIcon}>📚</Text>
              <Text style={styles.actionText}>Educazione comunitaria</Text>
            </View>
            <View style={styles.actionItem}>
              <Text style={styles.actionIcon}>🤝</Text>
              <Text style={styles.actionText}>Partnership locali</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
  },

  scrollView: {
    flex: 1,
  },

  header: {
    backgroundColor: Colors.neutral[0],
    paddingVertical: Spacing[8],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
  },

  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: '800',
    color: Colors.neutral[900],
    textAlign: 'center',
  },

  subtitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: '600',
    color: Colors.primary[600],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  mission: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.neutral[700],
    textAlign: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
  },

  actionsSection: {
    backgroundColor: Colors.neutral[0],
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    ...Shadows.sm,
  },

  actionsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  actionsList: {
    gap: Spacing[3],
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: 20,
    marginRight: Spacing[3],
  },

  actionText: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.neutral[700],
  },

  contactSection: {
    marginHorizontal: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
  },

  contactTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: '700',
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[4],
  },

  contactCard: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
    ...Shadows.sm,
  },

  contactIcon: {
    fontSize: 20,
    marginRight: Spacing[3],
  },

  contactText: {
    fontSize: Typography.sizes.base,
    fontWeight: '500',
    color: Colors.neutral[700],
    flex: 1,
  },
});

export default ChiSiamoScreen;
