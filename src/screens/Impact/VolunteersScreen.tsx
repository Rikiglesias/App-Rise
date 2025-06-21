import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import ImpactInfoPage from '../../components/domain/ImpactInfoPage';
import FormattedText from '../../components/ui/FormattedText';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

const VOLUNTEERS_DATA = {
  title: 'I Nostri Volontari',
  subtitle:
    'Il cuore pulsante della nostra missione. Nel 2024, 13.323 persone hanno donato il loro tempo per confezionare oltre 3 milioni di pasti e 16.000 kit di emergenza.',
  icon: 'hand-heart-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
  stats: [
    {
      icon: 'account-group' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '13.323',
      label: 'Volontari 2024',
      color: '#10B981',
    },
    {
      icon: 'food-apple' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '3.14M',
      label: 'Pasti Confezionati',
      color: '#DC2626',
    },
    {
      icon: 'package-variant' as keyof typeof MaterialCommunityIcons.glyphMap,
      value: '16.321',
      label: 'Kit Prodotti',
      color: '#1F2937',
    },
  ],
  sections: [
    {
      icon: 'package-variant-closed' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Eventi di Meal Packing',
      description:
        "I volontari partecipano a eventi dinamici dove confezionano migliaia di pasti nutrienti destinati ai programmi di scolarizzazione in Africa Subsahariana.\n\nUn'esperienza di team building che genera impatto tangibile: ogni pasto può nutrire un bambino per un giorno intero.",
      color: '#DC2626',
    },
    {
      icon: 'shield-account' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Kit Packing per Emergenze',
      description:
        'Confezionamento di kit alimentari per rispondere alle emergenze umanitarie in Europa e nel mondo, incluso il progetto "Pasto Sospeso" per supportare famiglie in difficoltà anche qui in Italia.',
      color: '#1F2937',
    },
    {
      icon: 'earth' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Impatto Globale',
      description:
        'Dal 2012, Rise Against Hunger Italia ha distribuito oltre 365 milioni di pasti in 74 paesi. I nostri volontari sono protagonisti di questo movimento globale contro la fame.',
      color: '#10B981',
    },
    {
      icon: 'handshake' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Partnership Aziendali',
      description:
        'Collaboriamo con aziende per eventi di volontariato aziendale che rafforzano il team building mentre si contribuisce alla lotta contro la fame mondiale.',
      color: '#8B5CF6',
    },
  ],
};

const VolunteersScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon={VOLUNTEERS_DATA.icon}
      title={VOLUNTEERS_DATA.title}
      subtitle={VOLUNTEERS_DATA.subtitle}
    >
      {/* Statistiche 2024 */}
      <Animated.View
        style={styles.statsContainer}
        entering={FadeInUp.delay(200).duration(600)}
      >
        <Text style={styles.statsTitle}>📊 Anno Record 2024</Text>
        <View style={styles.statsGrid}>
          {VOLUNTEERS_DATA.stats.map((stat, index) => (
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

      {/* Sezioni informative */}
      {VOLUNTEERS_DATA.sections.map((section, index) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.delay((index + 4) * 200).duration(600)}
        >
          <EnhancedInfoCard
            icon={section.icon}
            title={section.title}
            description={section.description}
            color={section.color}
          />
        </Animated.View>
      ))}

      {/* CTA Potenziato */}
      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(
          (VOLUNTEERS_DATA.sections.length + 4) * 200
        ).duration(600)}
      >
        <TouchableOpacity activeOpacity={0.9}>
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <MaterialCommunityIcons
                name="heart-plus"
                size={24}
                color={Colors.neutral[0]}
                style={styles.ctaIcon}
              />
              <Text style={styles.ctaButtonText}>Diventa un Volontario</Text>
              <Text style={styles.ctaSubtext}>
                Unisciti ai 13.323 volontari che stanno cambiando il mondo
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={Colors.neutral[0]}
                style={styles.ctaArrow}
              />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ImpactInfoPage>
  );
};

const EnhancedInfoCard: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <View style={styles.card}>
    <LinearGradient
      colors={[color, color + 'E6', color + 'CC']}
      style={styles.cardGradientBorder}
    >
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.cardTextContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <FormattedText text={description} style={styles.cardDescription} />
        </View>
      </View>
    </LinearGradient>
  </View>
);

const styles = StyleSheet.create({
  // Statistiche 2024
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

  // Cards potenziate
  card: {
    marginBottom: Spacing[5],
  },
  cardGradientBorder: {
    borderRadius: BorderRadius.xl,
    padding: 2,
    ...Shadows.lg,
  },
  cardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - 2,
    padding: Spacing[5],
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[2],
  },
  cardDescription: {
    fontSize: Typography.sizes.base,
    lineHeight: 24,
    color: Colors.neutral[700],
  },

  // CTA potenziato
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

export default VolunteersScreen;
