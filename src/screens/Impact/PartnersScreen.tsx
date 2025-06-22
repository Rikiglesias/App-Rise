import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformTouchable } from '../../components/ui';
import Animated, { FadeInUp } from 'react-native-reanimated';

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
    "Oltre 150 partner attivi collaborano con noi per moltiplicare l'impatto. Aziende globali, fondazioni e ONG unite nella missione #famezero.",
  icon: 'handshake-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
  stats: [
    {
      icon: 'handshake' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '150+',
      label: 'Partner Attivi',
      color: '#8B5CF6',
    },
    {
      icon: 'office-building' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '74',
      label: 'Paesi Raggiunti',
      color: '#F59E0B',
    },
    {
      icon: 'earth' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '365M+',
      label: 'Pasti Distribuiti',
      color: '#10B981',
    },
  ],
  categories: [
    {
      title: 'Partner Strategici Globali',
      icon: 'star-circle' as keyof typeof MaterialCommunityIcons.glyphMap,
      color: '#DC2626',
      partners: [
        'The Kraft Heinz Company Foundation',
        'FedEx Cares',
        'The Pfizer Foundation',
        'J.P. Morgan Chase',
        'The Walt Disney Company',
        'United Airlines',
      ],
    },
    {
      title: 'Partner Locali Italia',
      icon: 'map-marker-radius' as keyof typeof MaterialCommunityIcons.glyphMap,
      color: '#10B981',
      partners: [
        'Emporio Solidale Il Sole',
        'Restaurants du Cœur',
        'Rotary Club Italia',
        'Caritas Italiana',
        'Banco Alimentare',
        'Fondazione Magnetto',
      ],
    },
    {
      title: 'Partner Tecnologici',
      icon: 'laptop' as keyof typeof MaterialCommunityIcons.glyphMap,
      color: '#3B82F6',
      partners: [
        'AMD',
        'Western Digital',
        'Cadence Design Systems',
        'ADP',
        'Northern Trust',
        'BNY Mellon',
      ],
    },
  ],
  impactStory: {
    title: 'Partnership di Successo: Kraft Heinz',
    description:
      'Dal 2013, The Kraft Heinz Company Foundation ha investito oltre $15 milioni nei nostri programmi. Risultato: 463 milioni di pasti per 13.5 milioni di persone, con 75 milioni di bustine di micronutrienti fornite.',
    highlight: '$15M investiti in 3 anni',
  },
};

const PartnersScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon={PARTNERS_DATA.icon}
      title={PARTNERS_DATA.title}
      subtitle={PARTNERS_DATA.subtitle}
    >
      {/* Statistiche Partnership */}
      <Animated.View
        style={styles.statsContainer}
        entering={FadeInUp.delay(200).duration(600)}
      >
        <Text style={styles.statsTitle}>🤝 Network Globale</Text>
        <View style={styles.statsGrid}>
          {PARTNERS_DATA.stats.map((stat, index) => (
            <Animated.View
              key={stat.label}
              style={styles.statCard}
              entering={FadeInUp.delay((index + 1) * 150).duration(600)}
            >
              <MaterialCommunityIcons
                name={stat.icon}
                size={24}
                color={stat.color}
                style={styles.statIcon}
              />
              <Text style={[styles.statValue, { color: stat.color }]}>
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* Storia di Impatto */}
      <Animated.View
        style={styles.impactStoryContainer}
        entering={FadeInUp.delay(800).duration(600)}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          style={styles.impactStoryGradient}
        >
          <View style={styles.impactStoryContent}>
            <MaterialCommunityIcons
              name="trophy"
              size={32}
              color="#DC2626"
              style={styles.impactStoryIcon}
            />
            <Text style={styles.impactStoryTitle}>
              {PARTNERS_DATA.impactStory.title}
            </Text>
            <Text style={styles.impactStoryHighlight}>
              {PARTNERS_DATA.impactStory.highlight}
            </Text>
            <Text style={styles.impactStoryDescription}>
              {PARTNERS_DATA.impactStory.description}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Categorie Partner */}
      {PARTNERS_DATA.categories.map((category, categoryIndex) => (
        <Animated.View
          key={category.title}
          entering={FadeInUp.delay((categoryIndex + 5) * 200).duration(600)}
        >
          <PartnerCategory
            title={category.title}
            icon={category.icon}
            color={category.color}
            partners={category.partners}
          />
        </Animated.View>
      ))}

      {/* CTA Aziendale */}
      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(
          (PARTNERS_DATA.categories.length + 5) * 200
        ).duration(600)}
      >
        <PlatformTouchable
          activeOpacity={0.9}
          rippleColor="rgba(220, 38, 38, 0.2)"
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <MaterialCommunityIcons
                name="briefcase-plus"
                size={24}
                color={Colors.neutral[0]}
                style={styles.ctaIcon}
              />
              <Text style={styles.ctaButtonText}>Diventa nostro Partner</Text>
              <Text style={styles.ctaSubtext}>
                Unisciti a 150+ aziende che stanno facendo la differenza
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={Colors.neutral[0]}
                style={styles.ctaArrow}
              />
            </View>
          </LinearGradient>
        </PlatformTouchable>
      </Animated.View>

      {/* Benefici Partnership */}
      <Animated.View
        style={styles.benefitsContainer}
        entering={FadeInUp.delay(
          (PARTNERS_DATA.categories.length + 6) * 200
        ).duration(600)}
      >
        <Text style={styles.benefitsTitle}>Perché diventare Partner?</Text>
        <View style={styles.benefitsList}>
          <BenefitItem
            icon="target"
            text="CSR ad alto impatto con risultati misurabili"
            color="#10B981"
          />
          <BenefitItem
            icon="account-group"
            text="Team building solidale per i dipendenti"
            color="#3B82F6"
          />
          <BenefitItem
            icon="chart-line"
            text="Reportistica dettagliata sull'impatto generato"
            color="#F59E0B"
          />
          <BenefitItem
            icon="earth"
            text="Contributo concreto agli Obiettivi di Sviluppo Sostenibile"
            color="#8B5CF6"
          />
        </View>
      </Animated.View>
    </ImpactInfoPage>
  );
};

const PartnerCategory: React.FC<{
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  partners: string[];
}> = ({ title, icon, color, partners }) => (
  <View style={styles.categoryContainer}>
    <View style={styles.categoryHeader}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.categoryTitle, { color }]}>{title}</Text>
    </View>
    <View style={styles.partnersGrid}>
      {partners.map((partner, index) => (
        <Animated.View
          key={partner}
          style={[styles.partnerChip, { borderColor: color + '40' }]}
          entering={FadeInUp.delay(index * 100).duration(400)}
        >
          <Text style={styles.partnerText}>{partner}</Text>
        </Animated.View>
      ))}
    </View>
  </View>
);

const BenefitItem: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  color: string;
}> = ({ icon, text, color }) => (
  <View style={styles.benefitItem}>
    <MaterialCommunityIcons name={icon} size={20} color={color} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  // Statistiche
  statsContainer: {
    marginBottom: Spacing[6],
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.md,
  },
  statsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  statIcon: {
    marginBottom: Spacing[2],
  },
  statValue: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },

  // Storia di Impatto
  impactStoryContainer: {
    marginBottom: Spacing[6],
  },
  impactStoryGradient: {
    borderRadius: BorderRadius.xl,
    padding: 2,
    ...Shadows.lg,
  },
  impactStoryContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - 2,
    padding: Spacing[5],
    alignItems: 'center',
  },
  impactStoryIcon: {
    marginBottom: Spacing[3],
  },
  impactStoryTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  impactStoryHighlight: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  impactStoryDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22,
  },

  // Categorie Partner
  categoryContainer: {
    marginBottom: Spacing[6],
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.sm,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  categoryTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing[2],
  },
  partnersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
  },
  partnerChip: {
    backgroundColor: Colors.neutral[50],
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[3],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginBottom: Spacing[2],
  },
  partnerText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
  },

  // Benefici
  benefitsContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.md,
    marginBottom: Spacing[6],
  },
  benefitsTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  benefitsList: {
    gap: Spacing[3],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[2],
  },
  benefitText: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    marginLeft: Spacing[3],
    flex: 1,
  },

  // CTA
  ctaContainer: {
    marginTop: Spacing[6],
    alignItems: 'center',
  },
  ctaGradient: {
    borderRadius: BorderRadius.xl,
    ...Shadows.xl,
  },
  ctaContent: {
    paddingVertical: Spacing[5],
    paddingHorizontal: Spacing[6],
    alignItems: 'center',
    position: 'relative',
  },
  ctaIcon: {
    marginBottom: Spacing[2],
  },
  ctaButtonText: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  ctaSubtext: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.sm,
    opacity: 0.9,
    textAlign: 'center',
  },
  ctaArrow: {
    position: 'absolute',
    top: Spacing[3],
    right: Spacing[3],
  },
});

export default PartnersScreen;
