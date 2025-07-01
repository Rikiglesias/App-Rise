/* eslint-disable react-native/no-unused-styles */
// ↑ ESLint non riesce a tracciare gli stili quando sono passati tramite props a componenti figli.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import { Animated, Platform, StyleSheet, View, Text } from 'react-native';

import { PlatformTouchable } from '../../../../components/ui';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../../../shared/hooks/useLinkHandler';
import type { ContributeTabScreenProps } from '../../types/ContributeScreenTypes';
import type { useNewActionsAnimations } from './ContributeAnimations';
import DonationInfoModal from './DonationInfoModal';

// Types
interface ButtonData {
  id: string;
  title: string;
  icon: string;
  gradient: readonly [string, string, string];
  onPress: () => void;
}

interface ButtonStyles {
  container: object;
  categoryContainer: object;
  categoryHeader: object;

  donateTitleContainer: object;
  donateCategoryTitle: object;
  donateInlineSubtitle: object;

  exploreSubtitle: object;
  buttonsGrid: object;
  buttonRow: object;
  buttonContainer: object;
  gradientBorder: object;
  whiteContainer: object;
  buttonContent: object;
  buttonIcon: object;
  buttonTitle: object;
  infoButton: object;

  sectionDivider: object;
  firstSectionDivider: object;

  centeredRow: object;
  singleButtonContainer: object;
  chevronPosition: object;
  exploreTitle: object;
  communityTitle: object;
  exploreHeaderBackground: object;
  communityHeaderBackground: object;
  communitySubtitle: object;
  communityChevron: object;
}

interface NewActionButtonsSectionProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
  navigation: ContributeTabScreenProps['navigation'];
}

const NewActionButtonsSection: React.FC<NewActionButtonsSectionProps> = ({
  animations,
  navigation,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const {
    openLink,
    openDonationLink,
    openEventsLink,
    openShopLink,
    openGiftCardLink,
    openProjectsLink,
    openTracciabilitaLink,
  } = useLinkHandler();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const donateButtons = useMemo(
    () => [
      {
        id: 'dona',
        title: 'Dona Ora',
        icon: 'heart',
        gradient: ['#E11D48', '#DC2626', '#B91C1C'] as const, // ROSSO PRINCIPALE più vibrante
        onPress: () => openDonationLink(),
      },
      {
        id: 'charity-shop',
        title: 'Charity Shop',
        icon: 'shopping',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const, // ROSSO STANDARD
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: 'Gift Cards',
        icon: 'gift',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const, // ROSSO STANDARD
        onPress: () => openGiftCardLink(),
      },
    ],
    [openDonationLink, openShopLink, openGiftCardLink]
  );

  const exploreButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: 'Progetti',
        icon: 'charity',
        gradient: ['#0F766E', '#0D9488', '#14B8A6'] as const, // TEAL per progetti
        onPress: () => openProjectsLink(),
      },
      {
        id: 'tracciabilita',
        title: 'Tracciabilità',
        icon: 'map-marker-path',
        gradient: ['#1565C0', '#1976D2', '#2196F3'] as const, // BLU per tracciabilità
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'calendario',
        title: 'Eventi',
        icon: 'calendar',
        gradient: ['#7C3AED', '#8B5CF6', '#A855F7'] as const, // VIOLA per eventi
        onPress: () => openEventsLink(),
      },
    ],
    [openProjectsLink, openEventsLink, openTracciabilitaLink]
  );

  const openCommunityRegistration = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/register?redirect=https%3A%2F%2Friseagainsthunger.org.welfare4charity.com%2Fcharity%2Fecommerce',
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLink]);

  const communityButtons = useMemo(
    () => [
      {
        id: 'seguici',
        title: 'Seguici',
        icon: 'share-variant',
        gradient: ['#1F2937', '#374151', '#4B5563'] as const, // NERO per social
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'chi-siamo',
        title: 'Chi Siamo',
        icon: 'information',
        gradient: ['#1F2937', '#374151', '#4B5563'] as const, // GRIGIO SCURO per info
        onPress: () => navigation.navigate('ChiSiamo'),
      },
    ],
    [navigation]
  );

  const handleButtonPress = useCallback(
    async (button: ButtonData) => {
      await triggerHaptic('medium');
      button.onPress();
    },
    [triggerHaptic]
  );

  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    setShowInfoModal(true);
  }, [triggerHaptic]);

  const handleInfoModalClose = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  return (
    <>
      <ActionButtonsContent
        animations={animations}
        donateButtons={donateButtons}
        exploreButtons={exploreButtons}
        communityButtons={communityButtons}
        onButtonPress={handleButtonPress}
        onInfoPress={handleInfoPress}
        onCommunityTitlePress={openCommunityRegistration}
      />
      <DonationInfoModal
        visible={showInfoModal}
        onClose={handleInfoModalClose}
      />
    </>
  );
};

// Componente divisore semplice per separare le sezioni
const SectionDivider: React.FC<{ styles: ButtonStyles }> = ({ styles }) => (
  <View style={styles.sectionDivider} />
);

// Componente prima linea più grossa
const FirstSectionDivider: React.FC<{ styles: ButtonStyles }> = ({
  styles,
}) => <View style={styles.firstSectionDivider} />;

// Componente separato per il contenuto dei bottoni
const ActionButtonsContent: React.FC<{
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  exploreButtons: ButtonData[];
  communityButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
  onCommunityTitlePress: () => void;
}> = ({
  animations,
  donateButtons,
  exploreButtons,
  communityButtons,
  onButtonPress,
  onInfoPress,
  onCommunityTitlePress,
}) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: Spacing[4],
          gap: Spacing[2], // RIDOTTO: sezioni più unite, compensa l'aumento marginBottom categoryContainer
          paddingTop: Spacing[2], // AUMENTATO: più spazio sopra per respirazione
          paddingBottom: Spacing[4], // AUMENTATO: più spazio sotto per equilibrio
        },
        categoryContainer: {
          marginBottom: Spacing[6], // AUMENTATO: da Spacing[3] a Spacing[6] per maggiore separazione tra sezioni
        },
        categoryHeader: {
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing[12], // ULTERIORMENTE AUMENTATO: da Spacing[8] a Spacing[12] per respirazione ottimale
          position: 'relative',
        },

        // CONTAINER ELEGANTE PER TITOLO DONA - IDENTICO CROSS-PLATFORM
        donateTitleContainer: {
          alignItems: 'center',
          backgroundColor: 'rgba(220, 38, 38, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
          paddingVertical: Spacing[3],
          paddingHorizontal: Spacing[5],
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(220, 38, 38, 0.12)', // IDENTICO: stesso rgba su entrambe le piattaforme
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'android' ? 0.04 : 0.08, // Solo ombra diversa per stabilità
          shadowRadius: 8,
          elevation: Platform.OS === 'android' ? 2 : 3, // Solo elevation diversa per stabilità
        },

        // TITOLO CATEGORIA DONA ELEGANTE - PIÙ GRASSETTO
        donateCategoryTitle: {
          // fontSize rimosso - ora gestito da Text
          fontWeight: Typography.weights.black, // PIÙ GRASSETTO: da bold a black
          color: '#DC2626',
          textAlign: 'center',
          letterSpacing: -0.4,
          includeFontPadding: false,
        },

        // SUBTITLE ELEGANTE DONA INGRANDITO
        donateInlineSubtitle: {
          fontSize: Typography.sizes.base, // INGRANDITO: da sm a base
          fontWeight: Typography.weights.medium,
          color: '#B91C1C',
          textAlign: 'center',
          letterSpacing: 0.2,
          marginTop: Spacing[1], // MANTENUTO: spazio dal titolo anche senza container
          opacity: 0.8,
        },

        // TITOLO ESPLORA DISTINTIVO
        exploreTitle: {
          // fontSize rimosso - ora gestito da Text
          fontWeight: Typography.weights.bold, // BOLD normale
          color: '#374151', // GRIGIO SCURO ELEGANTE per Esplora
          textAlign: 'center',
          letterSpacing: -0.4,
          includeFontPadding: false,
          textShadowColor: 'rgba(55, 65, 81, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        },

        // TITOLO COMMUNITY DISTINTIVO
        communityTitle: {
          // fontSize rimosso - ora gestito da Text
          fontWeight: Typography.weights.bold, // BOLD normale
          color: '#1F2937', // NERO per Community
          textAlign: 'center',
          letterSpacing: -0.4,
          includeFontPadding: false,
          textShadowColor: 'rgba(31, 41, 55, 0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        },

        exploreSubtitle: {
          fontSize: Typography.sizes.base, // DIMENSIONE NORMALE
          fontWeight: Typography.weights.medium,
          color: '#4B5563', // GRIGIO MEDIO per leggibilità
          textAlign: 'center',
          marginTop: Spacing[3],
          opacity: 0.9,
          letterSpacing: 0.1,
        },

        infoButton: {
          position: 'absolute',
          right: Platform.OS === 'android' ? 33 : 45, // ANDROID: 33 come regolato / iOS: 45 ancora più a sinistra
          top: Platform.OS === 'android' ? 5 : 8, // ANDROID: 5 come regolato / iOS: 8 più in alto
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: '#DC2626',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 6,
          borderWidth: 1,
          borderColor: 'rgba(220, 38, 38, 0.8)',
        },

        buttonsGrid: {
          gap: Spacing[4],
        },
        buttonRow: {
          flexDirection: 'row',
          gap: Spacing[4],
        },
        buttonContainer: {
          flex: 1,
        },
        // GRADIENT CONTAINER PATTERN per bottoni (clickabili) - ANDROID OTTIMIZZATO
        gradientBorder: {
          borderRadius: 20,
          padding: 2,
          ...(Platform.OS === 'android'
            ? {
                // ANDROID: Rendering ottimizzato per evitare bleeding durante animazioni
                elevation: 2, // MOLTO RIDOTTO per animazioni fluide
                shadowColor: 'transparent',
                // Forza compositing layer per stabilità durante animazioni
                needsOffscreenAlphaCompositing: false,
              }
            : {
                // iOS: Ombreggiatura normale
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
              }),
        },
        whiteContainer: {
          backgroundColor: Colors.neutral[0],
          borderRadius: 18, // 20-2 per effetto bordo
          overflow: 'hidden',
          ...(Platform.OS === 'android' && {
            // ANDROID: Forza background completamente opaco durante le animazioni
            backgroundColor: '#FFFFFF',
            // Forza il render layer per evitare bleeding durante animazioni
            renderToHardwareTextureAndroid: true,
            shouldRasterizeIOS: false,
          }),
        },
        buttonContent: {
          paddingVertical: Spacing[4], // RIDOTTO per bottoni più compatti
          paddingHorizontal: Spacing[3], // RIDOTTO per minimalismo
          alignItems: 'center',
          minHeight: 100, // RIDOTTO per bottoni più piccoli
          justifyContent: 'center',
        },
        buttonIcon: {
          marginBottom: Spacing[3],
        },
        buttonTitle: {
          fontSize: Typography.sizes.xl, // AUMENTATO: testo più grande e visibile
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          letterSpacing: -0.3,
          // Text shadow per profondità
          textShadowColor: 'rgba(0, 0, 0, 0.05)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },

        // SUBTITLE POTENZIATO COMMUNITY
        communitySubtitle: {
          fontSize: Typography.sizes.base, // DIMENSIONE NORMALE
          fontWeight: Typography.weights.medium,
          color: '#374151', // GRIGIO SCURO per leggibilità
          textAlign: 'center',
          marginTop: Spacing[3],
          opacity: 0.9,
          letterSpacing: 0.1,
        },

        // DIVISORE ULTRA COMPATTO TRA SEZIONI
        sectionDivider: {
          height: 2, // SPESSORE STANDARD
          backgroundColor: Colors.neutral[200], // SCURITO: da neutral[100] a [200] per maggiore visibilità
          marginVertical: Spacing[2], // RIDOTTO ulteriormente
          marginHorizontal: Spacing[6], // LUNGHEZZA STANDARD
        },

        // LINEA TRA SEZIONI - IDENTICA A SECTIONDIVIDER
        firstSectionDivider: {
          height: 2, // STESSO SPESSORE di sectionDivider
          backgroundColor: Colors.neutral[200],
          marginVertical: Spacing[2],
          marginHorizontal: Spacing[6], // STESSA LUNGHEZZA di sectionDivider
        },

        // STILI PER INLINE STYLES
        centeredRow: {
          justifyContent: 'center',
        },
        singleButtonContainer: {
          flex: 0,
          width: '80%', // ANCORA PIÙ LARGO: dominante nella sezione
        },
        chevronPosition: {
          position: 'absolute',
          top: 8,
          right: 8,
        },

        // CONTAINER BACKGROUND ESPLORA - IDENTICO CROSS-PLATFORM
        exploreHeaderBackground: {
          backgroundColor: 'rgba(31, 41, 55, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
          borderRadius: 20,
          paddingVertical: Spacing[4],
          paddingHorizontal: Spacing[6],
          borderWidth: 1,
          borderColor: 'rgba(31, 41, 55, 0.08)', // IDENTICO: stesso rgba su entrambe le piattaforme
          shadowColor: '#374151',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'android' ? 0.03 : 0.05, // Solo ombra diversa per stabilità
          shadowRadius: 8,
          elevation: Platform.OS === 'android' ? 1 : 2, // Solo elevation diversa per stabilità
        },

        // CONTAINER BACKGROUND COMMUNITY - IDENTICO CROSS-PLATFORM
        communityHeaderBackground: {
          backgroundColor: 'rgba(31, 41, 55, 0.03)', // IDENTICO: stesso rgba su entrambe le piattaforme
          borderRadius: 20,
          paddingVertical: Spacing[4],
          paddingHorizontal: Spacing[6],
          borderWidth: 1,
          borderColor: 'rgba(31, 41, 55, 0.08)', // IDENTICO: stesso rgba su entrambe le piattaforme
          shadowColor: '#1F2937',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'android' ? 0.03 : 0.05, // Solo ombra diversa per stabilità
          shadowRadius: 8,
          elevation: Platform.OS === 'android' ? 1 : 2, // Solo elevation diversa per stabilità
          position: 'relative',
        },

        // ICONA LINK COMMUNITY - ESTREMO ANGOLO SUPERIORE DESTRO
        communityChevron: {
          position: 'absolute',
          top: Platform.OS === 'android' ? -4 : 8, // ANDROID: -4 come regolato / iOS: 8 più in basso
          right: Platform.OS === 'android' ? -8 : 12, // ANDROID: -8 come regolato / iOS: 12 più a sinistra
          opacity: 0.7, // IDENTICO iOS: semi-trasparente
        },
      }),
    []
  );

  return (
    <View style={styles.container}>
      {/* CATEGORIA CONTRIBUISCI con Info Button */}
      <DonateButtonsSection
        styles={styles}
        animations={animations}
        donateButtons={donateButtons}
        onButtonPress={onButtonPress}
        onInfoPress={onInfoPress}
      />

      <FirstSectionDivider styles={styles} />

      {/* CATEGORIA ESPLORA */}
      <ExploreButtonsSection
        styles={styles}
        animations={animations}
        exploreButtons={exploreButtons}
        onButtonPress={onButtonPress}
      />

      <SectionDivider styles={styles} />

      {/* CATEGORIA COMMUNITY */}
      <CommunityButtonsSection
        styles={styles}
        animations={animations}
        communityButtons={communityButtons}
        onButtonPress={onButtonPress}
        onCommunityTitlePress={onCommunityTitlePress}
      />
    </View>
  );
};

const DonateButtonsSection: React.FC<{
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
}> = ({ styles, animations, donateButtons, onButtonPress, onInfoPress }) => {
  const handleFirstRowButton = useMemo(
    () => () => {
      const button = donateButtons[0];
      if (button) onButtonPress(button);
    },
    [onButtonPress, donateButtons]
  );

  const handleSecondRowButtons = useMemo(
    () => [
      () => {
        const button = donateButtons[1];
        if (button) onButtonPress(button);
      },
      () => {
        const button = donateButtons[2];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, donateButtons]
  );

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  styles.donateTitleContainer,
                  {
                    backgroundColor: '#FEF2F2', // Rosso più delicato e raffinato
                    borderColor: '#FECACA', // Rosso più sottile per eleganza
                  },
                ]
              : styles.donateTitleContainer
          }
          onPress={onInfoPress}
          activeOpacity={0.8}
        >
          <Text style={[{ fontSize: 24 }, styles.donateCategoryTitle]}>
            ❤️ Contribuisci
          </Text>
          <Text style={styles.donateInlineSubtitle}>
            Supporta la lotta contro la fame
          </Text>
        </PlatformTouchable>
        <PlatformTouchable
          style={styles.infoButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={16} color="white" />
        </PlatformTouchable>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Prima riga: Charity Shop, Gift Cards */}
        <View style={styles.buttonRow}>
          {donateButtons.slice(1, 3).map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 1];
            const onPress = handleSecondRowButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor="#E11D48"
                />
              );
            }
            return null;
          })}
        </View>
        {/* Seconda riga: Dona (lungo e centrato) */}
        <View style={[styles.buttonRow, styles.centeredRow]}>
          {donateButtons[0] && (
            <View style={styles.singleButtonContainer}>
              <AnimatedButton
                button={donateButtons[0]}
                animationValue={animations.buttonAnimations[0]}
                styles={styles}
                onPress={handleFirstRowButton}
                iconColor="#DC2626"
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// Helper function per determinare i colori delle icone
const getExploreIconColor = (index: number): string => {
  if (index === 0) return '#0F766E'; // Teal per Progetti
  if (index === 1) return '#1565C0'; // Blu per Tracciabilità
  return '#7C3AED'; // Viola per Eventi
};

const getCommunityIconColor = (index: number): string => {
  if (index === 0) return '#1F2937'; // Nero per Seguici
  return '#1F2937'; // Grigio scuro per Chi Siamo
};

const ExploreButtonsSection: React.FC<{
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  exploreButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
}> = ({ styles, animations, exploreButtons, onButtonPress }) => {
  const handleFirstRowButtons = useMemo(
    () => [
      () => {
        const button = exploreButtons[0]; // Progetti
        if (button) onButtonPress(button);
      },
      () => {
        const button = exploreButtons[2]; // Eventi
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, exploreButtons]
  );

  const handleSecondRowButton = useMemo(
    () => () => {
      const button = exploreButtons[1]; // Tracciabilità
      if (button) onButtonPress(button);
    },
    [onButtonPress, exploreButtons]
  );

  return (
    <View style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}>
      <View style={styles.categoryHeader}>
        <View
          style={
            Platform.OS === 'android'
              ? [
                  styles.exploreHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore
                  },
                ]
              : styles.exploreHeaderBackground
          }
        >
          <Text style={[{ fontSize: 24 }, styles.exploreTitle]}>
            🔍 Esplora
          </Text>
          <Text style={styles.exploreSubtitle}>
            Progetti e iniziative umanitarie
          </Text>
        </View>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Prima riga: Progetti, Eventi */}
        <View style={styles.buttonRow}>
          {[exploreButtons[0], exploreButtons[2]].map((button, index) => {
            if (!button) return null;
            const animationValue =
              animations.buttonAnimations[index === 0 ? 3 : 5];
            const onPress = handleFirstRowButtons[index];
            const iconColorIndex = index === 0 ? 0 : 2; // 0 per Progetti, 2 per Eventi
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor={getExploreIconColor(iconColorIndex)}
                />
              );
            }
            return null;
          })}
        </View>
        {/* Seconda riga: Tracciabilità (centrata) */}
        <View style={[styles.buttonRow, styles.centeredRow]}>
          {exploreButtons[1] && (
            <View style={styles.singleButtonContainer}>
              <AnimatedButton
                button={exploreButtons[1]}
                animationValue={animations.buttonAnimations[4]}
                styles={styles}
                onPress={handleSecondRowButton}
                iconColor={getExploreIconColor(1)}
              />
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const CommunityButtonsSection: React.FC<{
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  communityButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onCommunityTitlePress: () => void;
}> = ({
  styles,
  animations,
  communityButtons,
  onButtonPress,
  onCommunityTitlePress,
}) => {
  const handleCommunityButtons = useMemo(
    () => [
      () => {
        const button = communityButtons[0];
        if (button) onButtonPress(button);
      },
      () => {
        const button = communityButtons[1];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, communityButtons]
  );

  return (
    <View style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}>
      <View style={styles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  styles.communityHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità (identico a Esplora)
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore (identico a Esplora)
                  },
                ]
              : styles.communityHeaderBackground
          }
          onPress={onCommunityTitlePress}
          activeOpacity={0.8}
        >
          <Text style={[{ fontSize: 24 }, styles.communityTitle]}>
            🤝 Community
          </Text>
          <Text style={styles.communitySubtitle}>
            Unisciti alla nostra comunità
          </Text>
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color="#1F2937"
            style={styles.communityChevron}
          />
        </PlatformTouchable>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Riga unica: Seguici, Chi Siamo */}
        <View style={styles.buttonRow}>
          {communityButtons.map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 6];
            const onPress = handleCommunityButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor={getCommunityIconColor(index)}
                />
              );
            }
            return null;
          })}
        </View>
      </View>
    </View>
  );
};

// Componente bottone senza animazioni - PULITO
const AnimatedButton: React.FC<{
  button: ButtonData;
  animationValue: Animated.Value; // Mantenuto per compatibilità ma non usato
  styles: ButtonStyles;
  onPress: () => void;
  iconColor: string;
  fullWidth?: boolean;
}> = ({
  button,
  animationValue: _animationValue, // Rinominato con underscore per evitare warning
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => (
  <View style={fullWidth ? {} : styles.buttonContainer}>
    <PlatformTouchable activeOpacity={0.6} onPress={onPress}>
      {Platform.OS === 'android' ? (
        // ANDROID: Container bianco con bordo colorato - ZERO sanguinamento durante animazioni
        <View
          style={{
            backgroundColor: '#FFFFFF', // Background bianco solido
            borderRadius: 20,
            borderWidth: 3, // Bordo colorato esterno
            borderColor: button.gradient[0], // Primo colore del gradiente
            shadowColor: 'transparent', // Nessuna ombra per evitare artefatti
            elevation: 2,
            overflow: 'hidden', // Blocca qualsiasi overflow
          }}
        >
          <View
            style={{
              backgroundColor: '#FFFFFF', // Doppio layer bianco per sicurezza
              paddingVertical: Spacing[4],
              paddingHorizontal: Spacing[3],
              alignItems: 'center',
              minHeight: 100,
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name={
                button.icon as
                  | 'heart'
                  | 'charity'
                  | 'shopping'
                  | 'gift'
                  | 'calendar'
                  | 'share-variant'
                  | 'map-marker-path'
                  | 'information'
              }
              size={36}
              color={iconColor}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonTitle}>{button.title}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color={iconColor}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            />
          </View>
        </View>
      ) : (
        // iOS: Mantieni il gradiente originale
        <LinearGradient colors={button.gradient} style={styles.gradientBorder}>
          <View style={styles.whiteContainer}>
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name={
                  button.icon as
                    | 'heart'
                    | 'charity'
                    | 'shopping'
                    | 'gift'
                    | 'calendar'
                    | 'share-variant'
                    | 'map-marker-path'
                    | 'information'
                }
                size={36}
                color={iconColor}
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonTitle}>{button.title}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={iconColor}
                style={styles.chevronPosition}
              />
            </View>
          </View>
        </LinearGradient>
      )}
    </PlatformTouchable>
  </View>
);

export default NewActionButtonsSection;
