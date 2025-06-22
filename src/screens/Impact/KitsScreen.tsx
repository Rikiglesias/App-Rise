import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PlatformScrollView } from '../../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
const KITS_COLORS = {
  primary: '#1F2937', // Grigio scuro principale (brand)
  secondary: '#DC2626', // Rosso (emergenza)
  accent1: '#10B981', // Verde (supporto locale/Pasto Sospeso)
  accent2: '#3B82F6', // Blu (logistica/distribuzione)
  accent3: '#F59E0B', // Arancione (emergenza Ucraina)
  accent4: '#8B5CF6', // Viola (monitoraggio/partnership)
};

const KITS_DATA = {
  title: 'Kit Packing',
  subtitle: 'Emergenze umanitarie e supporto alle comunità in difficoltà',
  icon: 'package-variant' as keyof typeof MaterialCommunityIcons.glyphMap,
  mainCards: [
    {
      icon: 'alert-octagon',
      title: 'Kit Emergenza Ucraina',
      description:
        'Kit specializzati per supportare la popolazione ucraina colpita dalla guerra. Contengono prodotti per igiene personale, articoli per bambini e beni di prima necessità.',
      highlight: 'Supporto Emergenza Bellica',
      color: KITS_COLORS.accent3,
    },
    {
      icon: 'home-heart',
      title: 'Pasto Sospeso Italia',
      description:
        'Iniziativa di solidarietà locale per famiglie italiane in difficoltà. Ogni kit contiene alimenti non deperibili, prodotti per infanzia e articoli igiene domestica.',
      highlight: 'Solidarietà Locale Attiva',
      color: KITS_COLORS.accent1,
    },
    {
      icon: 'truck-fast',
      title: 'Distribuzione Rapida',
      description:
        'Sistema logistico ottimizzato per emergenze. I kit raggiungono le zone di bisogno entro 48-72 ore attraverso la rete di partner locali consolidata.',
      highlight: 'Consegna in 48-72h',
      color: KITS_COLORS.accent2,
    },
  ],
  process: [
    {
      step: 1,
      icon: 'alert-circle',
      title: 'Identificazione Emergenza',
      description:
        'Monitoraggio costante delle crisi umanitarie e valutazione rapida dei bisogni nelle aree colpite',
      color: KITS_COLORS.secondary,
      side: 'left',
    },
    {
      step: 2,
      icon: 'clipboard-list',
      title: 'Pianificazione Kit',
      description:
        'Selezione mirata dei prodotti in base al tipo di emergenza: igiene, alimentari, infanzia',
      color: KITS_COLORS.accent3,
      side: 'right',
    },
    {
      step: 3,
      icon: 'account-group',
      title: 'Mobilitazione Volontari',
      description:
        'Attivazione della rete di volontari per la preparazione e il confezionamento dei kit',
      color: KITS_COLORS.accent1,
      side: 'left',
    },
    {
      step: 4,
      icon: 'package-variant',
      title: 'Assemblaggio Kit',
      description:
        'Confezionamento accurato dei kit con controllo qualità e verifica completezza',
      color: KITS_COLORS.primary,
      side: 'right',
    },
    {
      step: 5,
      icon: 'truck-delivery',
      title: 'Logistica e Trasporto',
      description:
        'Coordinamento trasporti verso le zone di distribuzione attraverso partner logistici',
      color: KITS_COLORS.accent2,
      side: 'left',
    },
    {
      step: 6,
      icon: 'handshake',
      title: 'Distribuzione Partner',
      description:
        'Consegna attraverso Caritas, comuni, associazioni locali e organizzazioni del territorio',
      color: KITS_COLORS.accent4,
      side: 'right',
    },
    {
      step: 7,
      icon: 'heart-multiple',
      title: 'Impatto Comunitario',
      description:
        'Supporto concreto alle famiglie in difficoltà con monitoraggio continuo dell&apos;efficacia',
      color: KITS_COLORS.accent1,
      side: 'center',
    },
  ],
};

const CompactCard: React.FC<{
  card: (typeof KITS_DATA.mainCards)[0];
  delay: number;
}> = ({ card, delay }) => (
  <Animated.View
    style={styles.modernCard}
    entering={FadeInUp.duration(600).delay(delay)}
  >
    <View style={styles.modernCardContent}>
      {/* Header superiore con icona e colore */}
      <View style={[styles.modernCardHeader, { backgroundColor: card.color }]}>
        <MaterialCommunityIcons
          name={card.icon as keyof typeof MaterialCommunityIcons.glyphMap}
          size={36}
          color={Colors.neutral[0]}
        />
      </View>

      {/* Contenuto principale */}
      <View style={styles.modernCardBody}>
        <Text style={styles.modernCardTitle}>{card.title}</Text>

        <View style={styles.modernCardHighlight}>
          <Text style={[styles.modernCardHighlightText, { color: card.color }]}>
            {card.highlight}
          </Text>
        </View>

        <Text style={styles.modernCardDescription}>{card.description}</Text>
      </View>

      {/* Footer con indicatore colore */}
      <View style={styles.modernCardFooter}>
        <View
          style={[styles.modernCardIndicator, { backgroundColor: card.color }]}
        />
      </View>
    </View>
  </Animated.View>
);

// Componente per un singolo dot animato
const AnimatedDot: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => {
  const scaleAnim = useSharedValue(isActive ? 1.3 : 1);
  const opacityAnim = useSharedValue(isActive ? 1 : 0.3);

  React.useEffect(() => {
    scaleAnim.value = withTiming(isActive ? 1.3 : 1, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
    opacityAnim.value = withTiming(isActive ? 1 : 0.3, {
      duration: 300,
      easing: Easing.out(Easing.quad),
    });
  }, [isActive, scaleAnim, opacityAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
    opacity: opacityAnim.value,
  }));

  return (
    <Animated.View
      style={[
        styles.scrollDot,
        animatedStyle,
        {
          backgroundColor: isActive
            ? KITS_COLORS.primary
            : KITS_COLORS.primary + '40',
        },
      ]}
    />
  );
};

// Componente per gli indicatori di scroll animati e funzionali
const AnimatedScrollIndicators: React.FC<{
  currentIndex: number;
  totalCards: number;
}> = ({ currentIndex, totalCards }) => {
  return (
    <View style={styles.scrollIndicators}>
      <View style={styles.scrollDots}>
        {Array.from({ length: totalCards }, (_, index) => ({
          id: `indicator-${index}`,
          index,
        })).map(({ id, index }) => (
          <AnimatedDot key={id} isActive={index === currentIndex} />
        ))}
      </View>
    </View>
  );
};

const ProcessStepCompact: React.FC<{
  step: (typeof KITS_DATA.process)[0];
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

const KitsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.screenContainer, { paddingTop: insets.top + Spacing[2] }]}
    >
      <ImpactInfoPage
        icon={KITS_DATA.icon}
        title={KITS_DATA.title}
        subtitle={KITS_DATA.subtitle}
      >
        {/* Carousel Orizzontale delle Schede - IDENTICO MEALS */}
        <Animated.View
          style={styles.carouselContainer}
          entering={FadeInUp.delay(200).duration(600)}
        >
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>🎯 Scopri i Nostri Kit</Text>
            <Text style={styles.carouselSubtitle}>
              Le informazioni essenziali sui nostri kit di emergenza
            </Text>
          </View>

          <PlatformScrollView>
            {KITS_DATA.mainCards.map((card, index) => (
              <CompactCard
                key={card.title}
                card={card}
                delay={400 + index * 100}
              />
            ))}
          </PlatformScrollView>

          <AnimatedScrollIndicators
            currentIndex={0}
            totalCards={KITS_DATA.mainCards.length}
          />
        </Animated.View>

        {/* Divisore tra Approfondimenti e Timeline - IDENTICO PAGINA IMPATTO */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
        </View>

        {/* Processo Timeline Verticale - IDENTICO MEALS */}
        <Animated.View
          style={styles.processContainer}
          entering={FadeInUp.delay(800).duration(600)}
        >
          <View style={styles.processHeader}>
            <Text style={styles.processTitle}>
              🚨 Dall&apos;Emergenza al Supporto
            </Text>
            <Text style={styles.processSubtitle}>
              Il percorso completo di ogni kit: dall&apos;identificazione
              dell&apos;emergenza all&apos;impatto nelle comunità in difficoltà
            </Text>
          </View>

          {/* Timeline Container */}
          <View style={styles.timelineContainer}>
            {KITS_DATA.process.map((step, index) => (
              <ProcessStepCompact
                key={step.step}
                step={step}
                delay={1000 + index * 150}
                isLastStep={index === KITS_DATA.process.length - 1}
              />
            ))}
          </View>

          {/* Call to Action finale */}
          <Animated.View
            style={styles.processCTA}
            entering={FadeInUp.delay(2600).duration(600)}
          >
            <LinearGradient
              colors={[KITS_COLORS.primary + '10', KITS_COLORS.primary + '05']}
              style={styles.processCTAGradient}
            >
              <MaterialCommunityIcons
                name="package-variant"
                size={32}
                color={KITS_COLORS.primary}
              />
              <Text style={styles.processCTAText}>
                Ogni kit assemblato è un sostegno concreto per chi ne ha bisogno
              </Text>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </ImpactInfoPage>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container principale per gestire padding - SafeArea dinamico
  screenContainer: {
    flex: 1,
    paddingBottom: Spacing[20],
  },

  // Carousel Mobile Orizzontale - IDENTICO MEALS
  carouselContainer: {
    marginBottom: Spacing[8],
  },
  carouselHeader: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  carouselTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: KITS_COLORS.primary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  carouselSubtitle: {
    fontSize: Typography.sizes.base,
    color: KITS_COLORS.secondary,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },

  // Cards IDENTICHE MEALS - DESIGN MODERNO E PULITO
  modernCard: {
    width: 320,
    height: 360,
    marginRight: Spacing[4],
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  modernCardContent: {
    flex: 1,
  },
  modernCardHeader: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modernCardBody: {
    flex: 1,
    padding: Spacing[5],
    paddingTop: Spacing[4],
    justifyContent: 'space-between',
  },
  modernCardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[3],
    lineHeight: 24,
  },
  modernCardHighlight: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    marginBottom: Spacing[4],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral[200],
  },
  modernCardHighlightText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  modernCardDescription: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[700],
    lineHeight: 22,
    textAlign: 'center',
    flex: 1,
  },
  modernCardFooter: {
    height: 8,
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  modernCardIndicator: {
    height: 4,
    borderRadius: 2,
    width: '100%',
  },

  // Indicatori di scroll - IDENTICI MEALS
  scrollIndicators: {
    alignItems: 'center',
    marginTop: Spacing[6],
  },
  scrollDots: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  scrollDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: KITS_COLORS.primary + '40',
  },

  // Divisori tra sezioni - IDENTICI PAGINA IMPATTO
  sectionDividerContainer: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[6],
  },
  sectionDivider: {
    height: 2,
    backgroundColor: Colors.neutral[300],
    width: '60%',
    borderRadius: 1,
    opacity: 0.8,
    alignSelf: 'center',
    shadowColor: Colors.neutral[400],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },

  // Processo Timeline - IDENTICO MEALS
  processContainer: {
    marginBottom: Spacing[8],
  },
  processHeader: {
    alignItems: 'center',
    marginBottom: Spacing[6],
    paddingHorizontal: Spacing[4],
  },
  processTitle: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: KITS_COLORS.secondary,
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  processSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },

  // Timeline Layout - IDENTICO MEALS
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

  // Timeline Connectors - IDENTICI MEALS
  timelineConnector: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 60,
    overflow: 'hidden',
  },

  // Process Call to Action - IDENTICO MEALS
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
    color: KITS_COLORS.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default KitsScreen;
