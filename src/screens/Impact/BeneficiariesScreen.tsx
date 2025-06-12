import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../constants/designTokens';

const BeneficiariesScreen: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View style={styles.header} entering={FadeInUp.duration(600)}>
        <MaterialCommunityIcons
          name="account-group-outline"
          size={48}
          color={Colors.primary[600]}
        />
        <Text style={styles.title}>I Nostri Beneficiari</Text>
        <Text style={styles.subtitle}>
          Ogni pasto donato raggiunge chi ne ha più bisogno, sostenendo
          istruzione, salute e sviluppo.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(600)}>
        <InfoCard
          icon="school-outline"
          title="Supporto all'Istruzione"
          description="I pasti distribuiti nelle scuole incentivano le famiglie a mandare i figli a scuola, garantendo loro un'istruzione e un futuro migliore. Un bambino nutrito è un bambino che può imparare."
          color={Colors.semantic.info.main}
        />
        <StatHighlight
          value="13.996"
          label="Bambini supportati in Zimbabwe nel 2024"
          color={Colors.semantic.info.dark}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).duration(600)}>
        <InfoCard
          icon="food-apple-outline"
          title="Sicurezza Alimentare"
          description="In contesti di emergenza come siccità o conflitti, i nostri interventi garantiscono cibo nutriente a intere comunità, migliorando la salute e costruendo resilienza per il futuro."
          color={Colors.semantic.success.main}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(600).duration(600)}>
        <InfoCard
          icon="home-heart"
          title="Comunità Locali in Italia"
          description="Grazie al programma Kit Packing, supportiamo famiglie e individui in difficoltà anche sul territorio italiano, collaborando con empori solidali e associazioni locali per contrastare la povertà."
          color={Colors.semantic.warning.main}
        />
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

const StatHighlight: React.FC<{
  value: string;
  label: string;
  color: string;
}> = ({ value, label, color }) => (
  <View style={[styles.statContainer, { backgroundColor: color + '20' }]}>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
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
    marginBottom: Spacing[2],
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
  statContainer: {
    padding: Spacing[4],
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing[6],
    marginTop: Spacing[2],
  },
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.black,
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[700],
    marginTop: Spacing[1],
  },
});

export default BeneficiariesScreen;
