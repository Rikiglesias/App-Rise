import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import ImpactInfoPage from '../../components/domain/ImpactInfoPage';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

const InfoCard: React.FC<{
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  iconColor?: string;
  backgroundColor?: string;
  delay?: number;
}> = ({
  icon,
  title,
  description,
  iconColor = '#1F2937',
  backgroundColor = Colors.neutral[0],
  delay = 0,
}) => (
  <Animated.View
    style={[styles.infoCard, { backgroundColor }]}
    entering={FadeInUp.duration(800).delay(delay)}
  >
    <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
      <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{description}</Text>
  </Animated.View>
);

const StatHighlight: React.FC<{
  value: string;
  label: string;
  color?: string;
  delay?: number;
}> = ({ value, label, color = '#1F2937', delay = 0 }) => (
  <Animated.View
    style={[styles.statCard, { borderColor: color }]}
    entering={FadeInUp.duration(600).delay(delay)}
  >
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

const KitsScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon="package-variant"
      title="Kit Packing"
      subtitle="Emergenze umanitarie e supporto alle comunità in difficoltà"
    >
      {/* Statistiche Chiave */}
      <View style={styles.statsContainer}>
        <StatHighlight value="142K" label="Kit Totali Creati" delay={200} />
        <StatHighlight value="16.3K" label="Kit 2024" delay={400} />
      </View>

      {/* Tipi di Kit */}
      <InfoCard
        icon="alert-octagon"
        title="Kit Emergenza Ucraina"
        description="Kit specializzati per supportare la popolazione ucraina colpita dalla guerra. Contengono prodotti per l'igiene personale, articoli per bambini e beni di prima necessità per affrontare l'emergenza umanitaria in corso."
        iconColor="#FFD700"
        delay={600}
      />

      <InfoCard
        icon="home-heart"
        title="Pasto Sospeso"
        description="Iniziativa di solidarietà locale che supporta famiglie italiane in difficoltà economica. Ogni kit contiene alimenti non deperibili, prodotti per l'infanzia e articoli per l'igiene domestica distribuiti tramite centri Caritas locali."
        iconColor="#10B981"
        delay={800}
      />

      {/* Distribuzione Locale */}
      <View style={styles.processSection}>
        <Text style={styles.sectionTitle}>Distribuzione e Impatto</Text>

        <InfoCard
          icon="map-marker-radius"
          title="Rete Italiana"
          description="I kit vengono distribuiti attraverso una rete consolidata di partner locali: centri Caritas, associazioni di volontariato, comuni e organizzazioni del terzo settore presenti in tutta Italia."
          iconColor="#8B5CF6"
          delay={1200}
        />

        <InfoCard
          icon="truck-fast"
          title="Logistica Rapida"
          description="Sistema di distribuzione ottimizzato per rispondere rapidamente alle emergenze. Dal momento dell'attivazione, i kit raggiungono le zone di bisogno entro 48-72 ore attraverso la nostra rete logistica."
          iconColor="#EF4444"
          delay={1400}
        />

        <InfoCard
          icon="account-heart"
          title="Monitoraggio Beneficiari"
          description="Tracciamento accurato di ogni kit distribuito con follow-up sui beneficiari per verificare l'efficacia dell'intervento e identificare bisogni aggiuntivi nelle comunità supportate."
          iconColor="#059669"
          delay={1600}
        />

        <InfoCard
          icon="handshake"
          title="Partnership Locali"
          description="Collaborazione strategica con enti locali, amministrazioni comunali e organizzazioni del territorio per garantire una distribuzione capillare e mirata dei kit di supporto."
          iconColor="#F59E0B"
          delay={1800}
        />
      </View>
    </ImpactInfoPage>
  );
};

const styles = StyleSheet.create({
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
    gap: Spacing[4],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing[5],
    marginBottom: Spacing[4],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  cardTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },
  cardDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
  },
  processSection: {
    marginTop: Spacing[6],
  },
  sectionTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
});

export default KitsScreen;
