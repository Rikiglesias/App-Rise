import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Components Premium - Versione Modernizzata
import { HomeHeaderSection } from '../components/domain/HomeHeaderSection';
// Hooks & Utils
import type { BottomTabParamList } from '../navigation/types';
import { Colors, Spacing, Typography } from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import { useHomeScrollAnimation } from '../shared/hooks/useHomeScrollAnimation';
import { useTheme } from '../shared/hooks/useTheme';

interface Props {
  // Non più necessario il navigation prop, uso useNavigation hook
}

// 🚀 PREMIUM CTA BUTTONS - DESIGN ULTRAMODERNO 2025
const ModernCTAButtons: React.FC = () => {
  const { triggerHaptic } = useHapticFeedback();
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();

  const handleImpactPress = React.useCallback(() => {
    triggerHaptic('heavy');
    navigation.navigate('ImpactTab'); // Vai alla pagina sinistra - Impatto e progetti
  }, [navigation, triggerHaptic]);

  const handleActionsPress = React.useCallback(() => {
    triggerHaptic('heavy');
    navigation.navigate('InfoTab'); // Vai alla pagina destra - Azioni concrete
  }, [navigation, triggerHaptic]);

  return (
    <View style={ctaStyles.container}>
      {/* SCOPRI IL NOSTRO IMPATTO - DESIGN SYSTEM PATTERN */}
      <TouchableOpacity
        style={ctaStyles.buttonWrapper}
        onPress={handleImpactPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={ctaStyles.gradientBorder}
        >
          <View style={ctaStyles.whiteContainer}>
            <View style={ctaStyles.buttonContent}>
              <MaterialCommunityIcons
                name="chart-line"
                size={36}
                color="#DC2626"
                style={ctaStyles.buttonIcon}
              />
              <Text style={ctaStyles.buttonTitle}>Scopri{'\n'}Impatto</Text>
              <Text style={ctaStyles.buttonDirectionRed}>← Risultati</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* AZIONI CONCRETE - DESIGN SYSTEM PATTERN */}
      <TouchableOpacity
        style={ctaStyles.buttonWrapper}
        onPress={handleActionsPress}
        activeOpacity={0.92}
      >
        <LinearGradient
          colors={['#059669', '#10B981', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={ctaStyles.gradientBorder}
        >
          <View style={ctaStyles.whiteContainer}>
            <View style={ctaStyles.buttonContent}>
              <MaterialCommunityIcons
                name="hand-heart"
                size={36}
                color="#059669"
                style={ctaStyles.buttonIcon}
              />
              <Text style={ctaStyles.buttonTitleGreen}>Dona e{'\n'}Aiuta</Text>
              <Text style={ctaStyles.buttonDirection}>Supporta →</Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const HomeScreen: React.FC<Props> = () => {
  const { colors } = useTheme();

  // Enhanced scroll animation hook - RIPRISTINATO
  const { scrollY, handleScroll } = useHomeScrollAnimation();

  // Styles ottimizzati per impaginazione e spazi
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[0], // Sfondo bianco pulito
    },

    scrollView: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingBottom: Spacing[20], // AUMENTATO: da Spacing[12] a Spacing[20] - più spazio per evitare overlap con navigation
    },

    // Hero section con spazi ottimizzati
    heroSection: {
      marginBottom: Spacing[4], // Spazio ridotto prima del separatore
    },

    // Stile separatore rimosso - ora la transizione è fluida

    // CTA section allineata con sezione impatto
    ctaSection: {
      marginHorizontal: Spacing[4], // Margini laterali allineati con sezione impatto
      paddingTop: Spacing[2], // Padding sopra per continuità
      paddingBottom: Spacing[6], // Spazio generoso sotto i bottoni
    },

    // Stili per il titolo CTA moderno
    ctaTitleSection: {
      alignItems: 'center',
      marginBottom: Spacing[6], // Spazio maggiore per respirazione
    },

    ctaTitleGradient: {
      borderRadius: 24,
      padding: 3,
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },

    ctaTitleContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 21,
      paddingHorizontal: Spacing[8],
      paddingVertical: Spacing[4],
    },

    ctaTitleText: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      textAlign: 'center',
      letterSpacing: -0.8,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },

    // DESIGN SYSTEM PREMIUM per la descrizione CTA - ULTRA PROFESSIONALE
    ctaDescriptionContainer: {
      marginTop: Spacing[5], // AUMENTATO: da Spacing[4] a Spacing[5] - più respiro sopra
      marginBottom: Spacing[3], // RIDOTTO: da Spacing[6] a Spacing[3] - meno spazio sotto per compensare il marginTop dei bottoni
      marginHorizontal: Spacing[3], // Margini laterali per respirazione
    },

    ctaDescriptionGradient: {
      borderRadius: 20, // Border radius elegante
      padding: 2, // Padding per effetto bordo sottile
      shadowColor: '#6B7280',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    },

    ctaDescriptionContent: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 18, // Radius coordinato
      paddingVertical: Spacing[5], // Padding verticale generoso
      paddingHorizontal: Spacing[6], // Padding laterale
      alignItems: 'center',
    },

    ctaDescriptionMain: {
      fontSize: Typography.sizes.xl, // Dimensione aumentata per impatto
      fontWeight: Typography.weights.bold, // Peso aumentato per autorevolezza
      color: '#1F2937', // Nero scuro professionale
      textAlign: 'center',
      letterSpacing: -0.3, // Letter spacing elegante
      lineHeight: Typography.sizes.xl * 1.3, // Line height ottimizzato
      textShadowColor: 'rgba(31, 41, 55, 0.1)', // Ombra sottile
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    ctaDescriptionDivider: {
      height: 2,
      width: 40, // Larghezza fissa elegante
      backgroundColor: '#DC2626', // Rosso del brand per richiamo
      borderRadius: 1,
      marginVertical: Spacing[3], // Spazio sopra e sotto
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
    },

    ctaDescriptionSecondary: {
      fontSize: Typography.sizes.lg, // Dimensione coordinata
      fontWeight: Typography.weights.medium, // Peso elegante
      color: '#6B7280', // Grigio elegante coordinato al design system
      textAlign: 'center',
      letterSpacing: 0.3, // Letter spacing raffinato
      lineHeight: Typography.sizes.lg * 1.4, // Line height generoso
      fontStyle: 'italic', // Corsivo per eleganza
      textShadowColor: 'rgba(107, 114, 128, 0.1)', // Ombra coordinata al grigio
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // NUOVO: Gradient border per delimitare la sezione CTA - Design System Pattern
    ctaSectionGradientBorder: {
      borderRadius: 24, // Radius allineato con la sezione impatto
      padding: 3, // Padding per effetto bordo gradient
      shadowColor: '#1F2937',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },

    // NUOVO: Container interno bianco per la sezione CTA
    ctaSectionContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 21, // Radius coordinato con il bordo (24-3=21)
      paddingVertical: Spacing[6], // Padding verticale generoso
      paddingHorizontal: Spacing[4], // Padding laterale
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        accessible
        accessibilityLabel="Schermata principale Rise Against Hunger Italia"
      >
        <View style={styles.content}>
          {/* 🎨 MODERN HERO SECTION */}
          <View style={styles.heroSection}>
            <HomeHeaderSection scrollY={scrollY} />
          </View>

          {/* Separatore rimosso - transizione fluida tra immagine e azioni */}

          {/* 🚀 MODERN CTA SECTION - DESIGN SYSTEM DELIMITATO */}
          <View style={styles.ctaSection}>
            {/* Container delimitato con gradient border pattern */}
            <LinearGradient
              colors={['#1F2937', '#374151', '#111827']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaSectionGradientBorder}
            >
              <View style={styles.ctaSectionContainer}>
                {/* Titolo moderno per i CTA */}
                <View style={styles.ctaTitleSection}>
                  <LinearGradient
                    colors={['#DC2626', '#B91C1C', '#991B1B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaTitleGradient}
                  >
                    <View style={styles.ctaTitleContainer}>
                      <Text style={styles.ctaTitleText}>
                        🤝 Entra in Azione
                      </Text>
                    </View>
                  </LinearGradient>
                  {/* Descrizione con design system premium */}
                  <View style={styles.ctaDescriptionContainer}>
                    <LinearGradient
                      colors={['#F3F4F6', '#E5E7EB', '#F9FAFB']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.ctaDescriptionGradient}
                    >
                      <View style={styles.ctaDescriptionContent}>
                        <Text style={styles.ctaDescriptionMain}>
                          Unisciti a noi nella lotta contro la fame nel mondo
                        </Text>
                        <View style={styles.ctaDescriptionDivider} />
                        <Text style={styles.ctaDescriptionSecondary}>
                          Ogni azione conta per cambiare vite
                        </Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>
                <ModernCTAButtons />
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 🎨 GRADIENT CONTAINER PATTERN - DESIGN SYSTEM UFFICIALE
const ctaStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing[4], // AUMENTATO: da Spacing[3] a Spacing[4] - più respiro tra bottoni
    marginHorizontal: Spacing[2],
    marginTop: Spacing[4], // AGGIUNTO: spazio sopra i bottoni per respiro
    marginBottom: Spacing[6],
  },

  buttonWrapper: {
    flex: 1,
  },

  // Gradient Border Pattern ULTRA PROFESSIONALE - Design System Ufficiale
  gradientBorder: {
    borderRadius: 24, // Radius aumentato per modernità
    padding: 3, // Padding aumentato per effetto bordo più marcato
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // Ombra più profonda
    shadowOpacity: 0.3, // Opacità aumentata per maggiore impatto
    shadowRadius: 16, // Radius aumentato per ombra più diffusa
    elevation: 10, // Elevation maggiore per Android
  },

  // Container bianco interno OTTIMIZZATO per allineamento - Design System Pattern
  whiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21, // Radius aggiornato per coordinamento
    paddingVertical: Spacing[3], // RIDOTTO: da Spacing[5] a Spacing[3] - meno spazio vuoto
    paddingHorizontal: Spacing[4], // Padding laterale standardizzato
    justifyContent: 'center',
    flex: 1, // Forza dimensioni identiche
    // Aggiunta ombra interna sottile per profondità
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },

  buttonContent: {
    alignItems: 'center',
    justifyContent: 'space-between', // Distribuzione uniforme degli elementi
    flex: 1, // Forza contenuti identici
    paddingVertical: Spacing[1], // RIDOTTO: da Spacing[2] a Spacing[1] - padding compatto
  },

  // Icone PROFESSIONALI ottimizzate per allineamento naturale
  buttonIcon: {
    textAlign: 'center',
    textAlignVertical: 'center',
  },

  // Typography OTTIMIZZATO per layout a 2 righe - PERFETTO
  buttonTitle: {
    fontSize: Typography.sizes.lg, // Dimensione aumentata per impatto su 2 righe
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.6, // Letter spacing ottimizzato per leggibilità
    marginVertical: Spacing[1], // Margine verticale bilanciato
    textShadowColor: 'rgba(220, 38, 38, 0.2)', // Ombra più intensa
    textShadowOffset: { width: 0, height: 2 }, // Ombra ottimizzata
    textShadowRadius: 4, // Radius ottimizzato
    lineHeight: Typography.sizes.lg * 1.1, // Line height compatto per 2 righe
    textAlignVertical: 'center',
  },

  // Typography PREMIUM per le direzioni - ULTRA BELLA - ALLINEAMENTO PERFETTO
  buttonDirection: {
    fontSize: Typography.sizes.lg, // Dimensione aumentata per visibilità
    fontWeight: Typography.weights.bold,
    color: '#10B981', // Verde più vivace e moderno
    textAlign: 'center',
    letterSpacing: 0.3, // Letter spacing raffinato
    marginVertical: Spacing[1], // Margine bilanciato
    lineHeight: Typography.sizes.lg * 1.2, // Line height fisso per allineamento
    textShadowColor: 'rgba(16, 185, 129, 0.12)', // Ombra sottile per profondità
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center', // Allineamento verticale perfetto
  },

  // Stili PROFESSIONALI per colori specifici dei bottoni - ALLINEAMENTO PERFETTO
  buttonDirectionRed: {
    fontSize: Typography.sizes.lg, // Dimensione uniformata
    fontWeight: Typography.weights.bold,
    color: '#EF4444', // Rosso più vibrante per impatto
    textAlign: 'center',
    letterSpacing: 0.3, // Letter spacing uniforme
    marginVertical: Spacing[1], // Margine bilanciato
    lineHeight: Typography.sizes.lg * 1.2, // Line height identico per allineamento
    textShadowColor: 'rgba(239, 68, 68, 0.12)', // Ombra coordinata
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textAlignVertical: 'center', // Allineamento verticale identico
  },

  buttonTitleGreen: {
    fontSize: Typography.sizes.lg, // Dimensione aumentata per impatto su 2 righe
    fontWeight: Typography.weights.black,
    color: '#059669', // Verde confermato per azioni
    textAlign: 'center',
    letterSpacing: -0.6, // Letter spacing ottimizzato per leggibilità
    marginVertical: Spacing[1], // Margine bilanciato
    textShadowColor: 'rgba(5, 150, 105, 0.2)', // Ombra più intensa
    textShadowOffset: { width: 0, height: 2 }, // Ombra ottimizzata
    textShadowRadius: 4, // Radius ottimizzato
    lineHeight: Typography.sizes.lg * 1.1, // Line height compatto per 2 righe
    textAlignVertical: 'center',
  },
});

export default HomeScreen;
