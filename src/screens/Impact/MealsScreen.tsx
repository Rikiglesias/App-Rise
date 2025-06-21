import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import ImpactInfoPage from '../../components/domain/ImpactInfoPage';
import {
  BorderRadius,
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

// Schema colori coerente per tutta la pagina
const MEALS_COLORS = {
  primary: '#DC2626', // Rosso principale (brand)
  secondary: '#1F2937', // Grigio scuro
  accent1: '#10B981', // Verde (educazione/crescita)
  accent2: '#3B82F6', // Blu (globale/distribuzione)
  accent3: '#F59E0B', // Arancione (nutrizione/energia)
  accent4: '#8B5CF6', // Viola (qualità/controllo)
};

const MEALS_DATA = {
  title: 'Meal Packing',
  subtitle: "Pasti nutrienti per sostenere l'istruzione in Africa Subsahariana",
  icon: 'food-apple' as keyof typeof MaterialCommunityIcons.glyphMap,
  stats: [
    { value: '3.14M', label: 'Pasti 2024', color: MEALS_COLORS.primary },
    { value: '365M+', label: 'Pasti Globali', color: MEALS_COLORS.accent1 },
    { value: '74', label: 'Paesi Raggiunti', color: MEALS_COLORS.accent2 },
  ],
  mainCards: [
    {
      icon: 'school',
      title: 'Programmi di Scolarizzazione',
      description:
        'I nostri pasti supportano programmi educativi in Africa Subsahariana, fornendo incentivi alimentari che permettono ai bambini di frequentare la scuola regolarmente.',
      highlight: 'Educazione + Nutrizione = Futuro',
      color: MEALS_COLORS.accent1,
    },
    {
      icon: 'nutrition',
      title: 'Composizione Nutrizionale',
      description:
        'Ogni meal pack contiene riso, soia, verdure disidratate e un pacchetto di 20 vitamine e minerali. Una combinazione bilanciata per il fabbisogno nutrizionale.',
      highlight: '20 Vitamine e Minerali',
      color: MEALS_COLORS.accent3,
    },
    {
      icon: 'earth-box',
      title: 'Destinazione Africa',
      description:
        'I pasti raggiungono comunità vulnerabili in Africa Subsahariana attraverso partnership locali consolidate e programmi di distribuzione controllata.',
      highlight: 'Partnership Locali Attive',
      color: MEALS_COLORS.accent2,
    },
  ],
  process: [
    {
      step: 1,
      icon: 'account-group',
      title: 'Volontari si Riuniscono',
      description:
        "I nostri volontari si incontrano nei centri per iniziare l'attività di confezionamento",
      color: MEALS_COLORS.accent1,
      side: 'left',
    },
    {
      step: 2,
      icon: 'scale-balance',
      title: 'Misurazione Precisa',
      description:
        'Riso, soia, verdure disidratate e vitamine vengono pesati con precisione scientifica',
      color: MEALS_COLORS.accent3,
      side: 'right',
    },
    {
      step: 3,
      icon: 'package-variant',
      title: 'Confezionamento Manuale',
      description:
        'Ogni pasto viene confezionato a mano con cura, creando porzioni nutrienti bilanciate',
      color: MEALS_COLORS.primary,
      side: 'left',
    },
    {
      step: 4,
      icon: 'quality-high',
      title: 'Controllo Qualità',
      description:
        'Verifiche rigorose su peso, sigillatura ed etichettatura per garantire standard elevati',
      color: MEALS_COLORS.accent4,
      side: 'right',
    },
    {
      step: 5,
      icon: 'ship',
      title: "Spedizione verso l'Africa",
      description:
        "I pasti partono dall'Italia verso l'Africa Subsahariana attraverso la rete logistica",
      color: MEALS_COLORS.accent2,
      side: 'left',
    },
    {
      step: 6,
      icon: 'school',
      title: 'Distribuzione Scolastica',
      description:
        'Partner locali distribuiscono i pasti nelle scuole, incentivando frequenza e apprendimento',
      color: MEALS_COLORS.accent1,
      side: 'right',
    },
    {
      step: 7,
      icon: 'heart-multiple',
      title: 'Impatto Educativo',
      description:
        'Bambini nutriti frequentano la scuola, imparano e costruiscono un futuro migliore',
      color: MEALS_COLORS.primary,
      side: 'center',
    },
  ],
};

const StatCard: React.FC<{
  value: string;
  label: string;
  color: string;
  delay: number;
}> = ({ value, label, color, delay }) => (
  <Animated.View
    style={[styles.statCard, { borderColor: color + '40' }]}
    entering={FadeInUp.delay(delay).duration(600)}
  >
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Animated.View>
);

const CompactCard: React.FC<{
  card: (typeof MEALS_DATA.mainCards)[0];
  delay: number;
}> = ({ card, delay }) => (
  <Animated.View
    style={styles.compactCard}
    entering={FadeInUp.duration(600).delay(delay)}
  >
    <LinearGradient
      colors={[card.color + '20', card.color + '10', 'transparent']}
      style={styles.compactGradient}
    >
      <View style={styles.compactContent}>
        <View style={[styles.compactIcon, { backgroundColor: card.color }]}>
          <MaterialCommunityIcons
            name={card.icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={28}
            color={Colors.neutral[0]}
          />
        </View>
        <Text style={styles.compactTitle}>{card.title}</Text>
        <Text style={[styles.compactHighlight, { color: card.color }]}>
          {card.highlight}
        </Text>
        <Text style={styles.compactDescription} numberOfLines={3}>
          {card.description}
        </Text>
      </View>
    </LinearGradient>
  </Animated.View>
);

const ProcessStepCompact: React.FC<{
  step: (typeof MEALS_DATA.process)[0];
  delay: number;
  isLastStep?: boolean;
}> = ({ step, delay, isLastStep = false }) => {
  const scaleAnim = useSharedValue(0);
  const progressAnim = useSharedValue(0);

  React.useEffect(() => {
    scaleAnim.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 150,
      })
    );

    if (!isLastStep) {
      progressAnim.value = withDelay(
        delay + 200,
        withTiming(1, {
          duration: 800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        })
      );
    }
  }, [delay, isLastStep, scaleAnim, progressAnim]);

  const animatedStepStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: scaleAnim.value,
  }));

  const animatedLineStyle = useAnimatedStyle(() => ({
    height: interpolate(progressAnim.value, [0, 1], [0, 60]),
    opacity: progressAnim.value,
  }));

  return (
    <View style={styles.timelineStep}>
      {/* Linea di connessione */}
      {!isLastStep && (
        <Animated.View style={[styles.timelineConnector, animatedLineStyle]}>
          <LinearGradient
            colors={[step.color, step.color + '60']}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      )}

      {/* Step Container */}
      <Animated.View style={[styles.timelineStepContainer, animatedStepStyle]}>
        {/* Numero Step con cerchio */}
        <View style={styles.timelineStepNumber}>
          <LinearGradient
            colors={[step.color, step.color + 'DD']}
            style={styles.timelineStepCircle}
          >
            <Text style={styles.timelineStepNumberText}>{step.step}</Text>
          </LinearGradient>

          {/* Anello decorativo */}
          <View
            style={[
              styles.timelineStepRing,
              { borderColor: step.color + '30' },
            ]}
          />
        </View>

        {/* Contenuto Step */}
        <View style={styles.timelineStepContent}>
          <View
            style={[styles.timelineStepCard, { borderLeftColor: step.color }]}
          >
            {/* Header con icona */}
            <View style={styles.timelineStepHeader}>
              <View
                style={[
                  styles.timelineStepIconContainer,
                  { backgroundColor: step.color + '15' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    step.icon as keyof typeof MaterialCommunityIcons.glyphMap
                  }
                  size={24}
                  color={step.color}
                />
              </View>
              <Text style={[styles.timelineStepTitle, { color: step.color }]}>
                {step.title}
              </Text>
            </View>

            {/* Descrizione */}
            <Text style={styles.timelineStepDescription}>
              {step.description}
            </Text>

            {/* Indicatore speciale per ultimo step */}
            {isLastStep && (
              <View style={styles.timelineStepSpecial}>
                <MaterialCommunityIcons
                  name="star"
                  size={20}
                  color={step.color}
                />
                <Text
                  style={[
                    styles.timelineStepSpecialText,
                    { color: step.color },
                  ]}
                >
                  Obiettivo Raggiunto!
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const MealsScreen: React.FC = () => {
  return (
    <ImpactInfoPage
      icon={MEALS_DATA.icon}
      title={MEALS_DATA.title}
      subtitle={MEALS_DATA.subtitle}
    >
      {/* Statistiche Veloci */}
      <Animated.View
        style={styles.statsContainer}
        entering={FadeInUp.delay(200).duration(600)}
      >
        {MEALS_DATA.stats.map((stat, index) => (
          <StatCard
            key={stat.label}
            value={stat.value}
            label={stat.label}
            color={stat.color}
            delay={(index + 1) * 150}
          />
        ))}
      </Animated.View>

      {/* Carousel Orizzontale delle Schede */}
      <Animated.View
        style={styles.carouselContainer}
        entering={FadeInUp.delay(600).duration(600)}
      >
        <Text style={styles.carouselTitle}>💡 Scopri di Più</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          snapToInterval={340}
          decelerationRate="fast"
        >
          {MEALS_DATA.mainCards.map((card, index) => (
            <CompactCard
              key={card.title}
              card={card}
              delay={800 + index * 100}
            />
          ))}
        </ScrollView>
      </Animated.View>

      {/* Processo Timeline Verticale */}
      <Animated.View
        style={styles.processContainer}
        entering={FadeInUp.delay(1400).duration(600)}
      >
        <Text style={styles.processTitle}>✨ Il Viaggio di un Pasto</Text>
        <Text style={styles.processSubtitle}>
          Dal confezionamento in Italia all&apos;impatto educativo in Africa
        </Text>

        {/* Timeline Container */}
        <View style={styles.timelineContainer}>
          {MEALS_DATA.process.map((step, index) => (
            <ProcessStepCompact
              key={step.step}
              step={step}
              delay={1600 + index * 150}
              isLastStep={index === MEALS_DATA.process.length - 1}
            />
          ))}
        </View>

        {/* Call to Action finale */}
        <Animated.View
          style={styles.processCTA}
          entering={FadeInUp.delay(3200).duration(600)}
        >
          <LinearGradient
            colors={[MEALS_COLORS.primary + '10', MEALS_COLORS.primary + '05']}
            style={styles.processCTAGradient}
          >
            <MaterialCommunityIcons
              name="hand-heart"
              size={32}
              color={MEALS_COLORS.primary}
            />
            <Text style={styles.processCTAText}>
              Ogni pasto confezionato è un passo verso un futuro migliore
            </Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>

      {/* Impatto Finale */}
      <Animated.View
        style={styles.impactContainer}
        entering={FadeInUp.delay(3000).duration(600)}
      >
        <LinearGradient
          colors={[
            MEALS_COLORS.primary,
            MEALS_COLORS.primary + 'DD',
            MEALS_COLORS.primary + 'BB',
          ]}
          style={styles.impactGradient}
        >
          <View style={styles.impactContent}>
            <MaterialCommunityIcons
              name="heart-multiple"
              size={36}
              color={MEALS_COLORS.primary}
              style={styles.impactIcon}
            />
            <Text style={styles.impactTitle}>🎓 Educazione + Nutrizione</Text>
            <Text style={styles.impactHighlight}>
              Ogni pasto è un ponte verso l&apos;istruzione
            </Text>
            <Text style={styles.impactDescription}>
              Dal 2012, Rise Against Hunger Italia confeziona pasti nutrienti
              che supportano programmi di scolarizzazione in Africa
              Subsahariana. Ogni meal pack rappresenta una possibilità di
              apprendimento e crescita per i bambini più vulnerabili.
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </ImpactInfoPage>
  );
};

const styles = StyleSheet.create({
  // Statistiche
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[6],
    gap: Spacing[3],
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[1],
  },
  statLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    textAlign: 'center',
  },

  // Carousel Mobile Orizzontale
  carouselContainer: {
    marginBottom: Spacing[6],
  },
  carouselTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: MEALS_COLORS.secondary,
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  carouselContent: {
    paddingHorizontal: Spacing[4],
    gap: Spacing[3],
  },
  compactCard: {
    width: 320,
    height: 220,
    marginRight: Spacing[3],
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  compactGradient: {
    flex: 1,
    borderRadius: BorderRadius.xl,
    padding: 3,
  },
  compactContent: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - 3,
    padding: Spacing[5],
    justifyContent: 'space-between',
  },
  compactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: Spacing[3],
  },
  compactTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    marginBottom: Spacing[2],
  },
  compactHighlight: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing[3],
  },
  compactDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    lineHeight: 22,
  },

  // Processo Timeline
  processContainer: {
    marginBottom: Spacing[6],
  },
  processTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: MEALS_COLORS.primary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  processSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    marginBottom: Spacing[6],
  },

  // Timeline Layout
  timelineContainer: {
    paddingHorizontal: Spacing[3],
  },
  timelineStep: {
    marginBottom: Spacing[3],
  },
  timelineStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  timelineStepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[2],
  },
  timelineStepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineStepNumberText: {
    color: Colors.neutral[0],
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
  },
  timelineStepRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.neutral[300],
  },
  timelineStepContent: {
    flex: 1,
  },
  timelineStepCard: {
    flex: 1,
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.lg,
    padding: Spacing[3],
    borderLeftWidth: 4,
    borderLeftColor: Colors.neutral[300],
  },
  timelineStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[1],
  },
  timelineStepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[2],
  },
  timelineStepTitle: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.bold,
    flex: 1,
  },
  timelineStepDescription: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutral[600],
    lineHeight: 18,
  },
  timelineStepSpecial: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[2],
  },
  timelineStepSpecialText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    marginLeft: Spacing[2],
  },

  // Timeline Connectors
  timelineConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 60,
    overflow: 'hidden',
  },

  // Impatto Finale
  impactContainer: {
    marginTop: Spacing[6],
    marginBottom: Spacing[8],
    paddingHorizontal: Spacing[3],
  },
  impactGradient: {
    padding: Spacing[6],
    alignItems: 'center',
  },
  impactContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - 2,
    padding: Spacing[5],
    alignItems: 'center',
  },
  impactIcon: {
    marginBottom: Spacing[3],
  },
  impactTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: MEALS_COLORS.secondary,
    marginBottom: Spacing[2],
    textAlign: 'center',
  },
  impactHighlight: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: MEALS_COLORS.primary,
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  impactDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 24,
  },

  // Process Call to Action
  processCTA: {
    marginTop: Spacing[6],
    marginHorizontal: Spacing[3],
  },
  processCTAGradient: {
    padding: Spacing[5],
    borderRadius: BorderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[3],
  },
  processCTAText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
    color: MEALS_COLORS.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MealsScreen;
