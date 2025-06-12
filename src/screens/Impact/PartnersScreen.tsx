import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../constants/designTokens';

const PARTNERS = [
  'Rotary',
  'Caritas',
  'Kraft Heinz',
  'FedEx',
  'Pfizer',
  'TMF Group',
  'J.P. Morgan',
  'Disney',
  'United Airlines',
  'Fondazione Magnetto',
  'Gruppo Abele',
  'Banco Alimentare',
];

const PartnersScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <MaterialCommunityIcons
          name="handshake-outline"
          size={48}
          color={Colors.primary[600]}
        />
        <Text style={styles.title}>La Nostra Rete di Partner</Text>
        <Text style={styles.subtitle}>
          La collaborazione è la chiave del nostro successo. Lavoriamo con
          aziende, fondazioni e ONG per moltiplicare il nostro impatto.
        </Text>
      </Animated.View>

      <Animated.View
        style={styles.partnersGrid}
        entering={FadeInUp.delay(200).duration(600)}
      >
        {PARTNERS.map(partner => (
          <View key={partner} style={styles.partnerChip}>
            <Text style={styles.partnerText}>{partner}</Text>
          </View>
        ))}
        <View style={[styles.partnerChip, styles.partnerChipMore]}>
          <Text style={styles.partnerText}>e molti altri...</Text>
        </View>
      </Animated.View>

      <Animated.View
        style={styles.section}
        entering={FadeInUp.delay(400).duration(600)}
      >
        <Text style={styles.sectionTitle}>Perché diventare Partner?</Text>
        <Text style={styles.sectionText}>
          Collaborare con Rise Against Hunger Italia significa investire in un
          progetto di responsabilità sociale d&apos;impresa (CSR) ad alto
          impatto. Offriamo programmi di volontariato aziendale, eventi di team
          building solidale e progetti personalizzati per raggiungere insieme
          obiettivi comuni.
        </Text>
      </Animated.View>

      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(600).duration(600)}
      >
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>Diventa nostro Partner</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={Colors.neutral[0]}
          />
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing[5],
    backgroundColor: Colors.neutral[50],
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginTop: Spacing[4],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sizes.lg,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginTop: Spacing[2],
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing[3],
    paddingHorizontal: Spacing[2],
  },
  partnerChip: {
    backgroundColor: Colors.neutral[0],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: BorderRadius.full,
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  partnerText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
  },
  partnerChipMore: { backgroundColor: Colors.neutral[200] },
  section: {
    marginTop: Spacing[8],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[3],
    textAlign: 'center',
  },
  sectionText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed,
    textAlign: 'center',
  },
  ctaContainer: { marginTop: Spacing[8], alignItems: 'center' },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[6],
    borderRadius: BorderRadius.full,
    ...Shadows.lg,
  },
  ctaButtonText: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginRight: Spacing[2],
  },
});

export default PartnersScreen;
