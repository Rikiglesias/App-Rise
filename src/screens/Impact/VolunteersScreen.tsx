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

const VolunteersScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <MaterialCommunityIcons
          name="hand-heart-outline"
          size={48}
          color={Colors.primary[600]}
        />
        <Text style={styles.title}>I Nostri Volontari</Text>
        <Text style={styles.subtitle}>
          Il cuore pulsante della nostra missione. Nel 2024, 13.323 persone
          hanno donato il loro tempo per fare la differenza.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)}>
        <InfoCard
          icon="package-variant-closed"
          title="Eventi di Meal Packing"
          description="I volontari partecipano a eventi dinamici e coinvolgenti dove confezionano migliaia di pasti nutrienti in poche ore. Un'esperienza di team building che genera un impatto tangibile e immediato."
          color={Colors.semantic.success.main}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)}>
        <InfoCard
          icon="account-group-outline"
          title="Creare Comunità"
          description="Gli eventi non sono solo per confezionare pasti, ma anche per creare legami, sensibilizzare sulla fame nel mondo e costruire un movimento di persone unite da un obiettivo comune."
          color={Colors.semantic.info.main}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(600)}>
        <InfoCard
          icon="map-marker-radius-outline"
          title="Volontariato Locale"
          description="Collaboriamo con realtà locali in tutta Italia. I volontari supportano la logistica, la distribuzione di kit alimentari e partecipano a iniziative sul territorio, portando aiuto dove serve."
          color={Colors.semantic.warning.main}
        />
      </Animated.View>

      <Animated.View
        style={styles.ctaContainer}
        entering={FadeInUp.delay(800).duration(600)}
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
    </ScrollView>
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
      <Text style={styles.cardDescription}>{description}</Text>
    </View>
  </View>
);

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
  cardDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: Typography.lineHeights.relaxed,
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
