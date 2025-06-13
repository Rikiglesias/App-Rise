import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import FormattedText from '../../components/ui/FormattedText';
import ImpactInfoPage from '../../components/domain/ImpactInfoPage';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

const PARTNERS_DATA = {
  title: 'La Nostra Rete di Partner',
  subtitle:
    'La collaborazione è la chiave del nostro successo. Lavoriamo con aziende, fondazioni e ONG per moltiplicare il nostro impatto.',
  icon: 'handshake-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
  partners: [
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
  ],
  cta: {
    text: 'Diventa nostro Partner',
    // onPress: () => {}, // Add navigation logic
  },
  section: {
    title: 'Perché diventare Partner?',
    text: "Collaborare con Rise Against Hunger Italia significa investire in un progetto di responsabilità sociale d'impresa (CSR) ad alto impatto.\n\nOffriamo programmi di volontariato aziendale, eventi di team building solidale e progetti personalizzati per raggiungere insieme obiettivi comuni.",
  },
};

const PartnersScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon={PARTNERS_DATA.icon}
      title={PARTNERS_DATA.title}
      subtitle={PARTNERS_DATA.subtitle}
    >
      <Animated.View
        style={styles.partnersGrid}
        entering={FadeInUp.delay(200).duration(600)}
      >
        {PARTNERS_DATA.partners.map(partner => (
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
        <Text style={styles.sectionTitle}>{PARTNERS_DATA.section.title}</Text>
        <FormattedText text={PARTNERS_DATA.section.text} />
      </Animated.View>

      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(600).duration(600)}
      >
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>{PARTNERS_DATA.cta.text}</Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={20}
            color={Colors.neutral[0]}
          />
        </TouchableOpacity>
      </Animated.View>
    </ImpactInfoPage>
  );
};

const styles = StyleSheet.create({
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
