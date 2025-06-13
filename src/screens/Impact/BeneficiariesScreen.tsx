import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
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

const BENEFICIARIES_DATA = {
  title: 'I Nostri Beneficiari',
  subtitle:
    'Ogni pasto donato raggiunge chi ne ha più bisogno, sostenendo istruzione, salute e sviluppo.',
  icon: 'account-group-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
  sections: [
    {
      icon: 'school-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: "Supporto all'Istruzione",
      description:
        "I pasti distribuiti nelle scuole incentivano le famiglie a mandare i figli a scuola, garantendo loro un'istruzione e un futuro migliore.\n\nUn bambino nutrito è un bambino che può imparare.",
      color: Colors.semantic.info.main,
      stat: {
        value: '13.996',
        label: 'Bambini supportati in Zimbabwe nel 2024',
        color: Colors.semantic.info.dark,
      },
    },
    {
      icon: 'food-apple-outline' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Sicurezza Alimentare',
      description:
        'In contesti di emergenza come siccità o conflitti, i nostri interventi garantiscono cibo nutriente a intere comunità, migliorando la salute e costruendo resilienza per il futuro.',
      color: Colors.semantic.success.main,
    },
    {
      icon: 'home-heart' as keyof typeof MaterialCommunityIcons.glyphMap,
      title: 'Comunità Locali in Italia',
      description:
        'Grazie al programma Kit Packing, supportiamo famiglie e individui in difficoltà anche sul territorio italiano.\n\nCollaboriamo con empori solidali e associazioni locali per contrastare la povertà.',
      color: Colors.semantic.warning.main,
    },
  ],
};

const BeneficiariesScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon={BENEFICIARIES_DATA.icon}
      title={BENEFICIARIES_DATA.title}
      subtitle={BENEFICIARIES_DATA.subtitle}
    >
      {BENEFICIARIES_DATA.sections.map((section, index) => (
        <Animated.View
          key={section.title}
          entering={FadeInUp.delay(index * 200 + 200).duration(600)}
        >
          <InfoCard
            icon={section.icon}
            title={section.title}
            description={section.description}
            color={section.color}
          />
          {section.stat && (
            <StatHighlight
              value={section.stat.value}
              label={section.stat.label}
              color={section.stat.color}
            />
          )}
        </Animated.View>
      ))}
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
