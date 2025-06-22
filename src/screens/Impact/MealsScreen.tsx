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
        'Ogni meal pack contiene riso, soia, verdure disidratate e un pacchetto di micronutrienti con 20 vitamine e minerali essenziali. Una combinazione scientificamente bilanciata.',
      highlight: '20 Vitamine e Minerali Essenziali',
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
        'Riso, soia, verdure disidratate e micronutrienti vengono pesati con precisione scientifica',
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
      icon: 'truck-delivery',
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

const CompactCard: React.FC<{
  card: (typeof MEALS_DATA.mainCards)[0];
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
            ? MEALS_COLORS.primary
            : MEALS_COLORS.primary + '40',
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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.screenContainer, { paddingTop: insets.top + Spacing[2] }]}
    >
      <ImpactInfoPage
        icon={MEALS_DATA.icon}
        title={MEALS_DATA.title}
        subtitle={MEALS_DATA.subtitle}
      >
        {/* Carousel Orizzontale delle Schede - COMPLETAMENTE RIDISEGNATO */}
        <Animated.View
          style={styles.carouselContainer}
          entering={FadeInUp.delay(200).duration(600)}
        >
          <View style={styles.carouselHeader}>
            <Text style={styles.carouselTitle}>🎯 Scopri i Nostri Pasti</Text>
            <Text style={styles.carouselSubtitle}>
              Le informazioni essenziali sui nostri meal pack
            </Text>
          </View>

          <PlatformScrollView>
            {MEALS_DATA.mainCards.map((card, index) => (
              <CompactCard
                key={card.title}
                card={card}
                delay={400 + index * 100}
              />
            ))}
          </PlatformScrollView>

          <AnimatedScrollIndicators
            currentIndex={0}
            totalCards={MEALS_DATA.mainCards.length}
          />
        </Animated.View>

        {/* Divisore tra Approfondimenti e Timeline - IDENTICO PAGINA IMPATTO */}
        <View style={styles.sectionDividerContainer}>
          <View style={styles.sectionDivider} />
        </View>

        {/* Processo Timeline Verticale - MIGLIORATO */}
        <Animated.View
          style={styles.processContainer}
          entering={FadeInUp.delay(800).duration(600)}
        >
          <View style={styles.processHeader}>
            <Text style={styles.processTitle}>
              🌍 Dal Volontario al Bambino
            </Text>
            <Text style={styles.processSubtitle}>
              Il percorso completo di ogni pasto: dalla produzione in Italia
              all&apos;impatto educativo nelle scuole africane
            </Text>
          </View>

          {/* Timeline Container */}
          <View style={styles.timelineContainer}>
            {MEALS_DATA.process.map((step, index) => (
              <ProcessStepCompact
                key={step.step}
                step={step}
                delay={1000 + index * 150}
                isLastStep={index === MEALS_DATA.process.length - 1}
              />
            ))}
          </View>

          {/* Call to Action finale */}
          <Animated.View
            style={styles.processCTA}
            entering={FadeInUp.delay(2600).duration(600)}
          >
            <LinearGradient
              colors={[
                MEALS_COLORS.primary + '10',
                MEALS_COLORS.primary + '05',
              ]}
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
      </ImpactInfoPage>
    </View>
  );
};

const styles = StyleSheet.create({
  // Container principale per gestire padding - SafeArea dinamico
  screenContainer: {
    flex: 1,
    paddingBottom: Spacing[20], // AUMENTATO per evitare sovrapposizione barra navigazione
  },

  // Carousel Mobile Orizzontale - HEADER AGGIORNATO
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
    color: MEALS_COLORS.primary,
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  carouselSubtitle: {
    fontSize: Typography.sizes.base,
    color: MEALS_COLORS.secondary,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },

  // Cards COMPLETAMENTE RIDISEGNATE - DESIGN MODERNO E PULITO
  modernCard: {
    width: 320, // AUMENTATO: da 300 a 320px
    height: 360, // AUMENTATO: da 280 a 360px per più spazio descrizione
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
    height: 70, // RIDOTTO: da 80 a 70px per dare più spazio al contenuto
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  modernCardBody: {
    flex: 1,
    padding: Spacing[5],
    paddingTop: Spacing[4],
    justifyContent: 'space-between', // AGGIUNTO: per distribuire meglio lo spazio
  },
  modernCardTitle: {
    fontSize: Typography.sizes.lg, // RIDOTTO: da xl a lg per dare più spazio alla descrizione
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center',
    marginBottom: Spacing[3],
    lineHeight: 24, // RIDOTTO: da 26 a 24
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
    fontSize: Typography.sizes.sm, // RIDOTTO: da base a sm per dare più spazio alla descrizione
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
  },
  modernCardDescription: {
    fontSize: Typography.sizes.base, // AUMENTATO: da sm a base per migliore leggibilità
    color: Colors.neutral[700], // SCURITO: da neutral[600] a neutral[700] per migliore contrasto
    lineHeight: 22, // AUMENTATO: da 20 a 22 per migliore leggibilità
    textAlign: 'center',
    flex: 1, // AGGIUNTO: per occupare tutto lo spazio disponibile
  },
  modernCardFooter: {
    height: 8, // AUMENTATO: da 6 a 8px
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[3],
  },
  modernCardIndicator: {
    height: 4, // AUMENTATO: da 3 a 4px per più presenza
    borderRadius: 2,
    width: '100%',
  },

  // Indicatori di scroll - MIGLIORATI CON ANIMAZIONI
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
    backgroundColor: MEALS_COLORS.primary + '40',
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

  // Processo Timeline - MIGLIORATO
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
    color: MEALS_COLORS.accent2,
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  processSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
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
