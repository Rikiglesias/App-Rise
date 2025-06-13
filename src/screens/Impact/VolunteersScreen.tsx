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

const VOLUNTEERS_DATA = {
  title: 'I Nostri Volontari',
  subtitle:
    'Il cuore pulsante della nostra missione. Nel 2024, 13.323 persone hanno donato il loro tempo per fare la differenza.',
  icon: 'hand-heart-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
  sections: [
    {
      icon: 'package-variant-closed' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Eventi di Meal Packing',
      description:
        "I volontari partecipano a eventi dinamici e coinvolgenti dove confezionano migliaia di pasti nutrienti in poche ore.\n\nUn'esperienza di team building che genera un impatto tangibile e immediato.",
      color: Colors.semantic.success.main,
    },
    {
      icon: 'account-group-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Creare Comunità',
      description:
        'Gli eventi non sono solo per confezionare pasti, ma anche per creare legami, sensibilizzare sulla fame nel mondo e costruire un movimento di persone unite da un obiettivo comune.',
      color: Colors.semantic.info.main,
    },
    {
      icon: 'map-marker-radius-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Volontariato Locale',
      description:
        'Collaboriamo con realtà locali in tutta Italia. I volontari supportano la logistica, la distribuzione di kit alimentari e partecipano a iniziative sul territorio, portando aiuto dove serve.',
      color: Colors.semantic.warning.main,
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
      {VOLUNTEERS_DATA.sections.map((section, index) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.delay(index * 200).duration(600)}
        >
          <InfoCard
            icon={section.icon}
            title={section.title}
            description={section.description}
            color={section.color}
          />
        </Animated.View>
      ))}
      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(
          VOLUNTEERS_DATA.sections.length * 200
        ).duration(600)}
      >
        <TouchableOpacity style={styles.ctaButton} activeOpacity={0.8}>
          <Text style={styles.ctaButtonText}>Diventa un Volontario</Text>
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

const InfoCard: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  color: string;
}> = ({ icon, title, description, color }) => (
  <View style={[styles.card, { borderLeftColor: color }]}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <MaterialCommunityIcons name={icon} size={32} color={Colors.neutral[0]} />
    </View>
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{title}</Text>
      <FormattedText text={description} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    padding: Spacing[5],
    ...Shadows.md,
    marginBottom: Spacing[5],
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[1],
  },
  ctaContainer: { marginTop: Spacing[6], alignItems: 'center' },
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

export default VolunteersScreen;
