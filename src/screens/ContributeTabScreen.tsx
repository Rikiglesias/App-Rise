/* eslint-disable react-native/no-unused-styles */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Spacing, Typography } from '../shared/constants/designTokens';
import { useHapticFeedback } from '../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../shared/hooks/useLinkHandler';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';

const { width: screenWidth } = Dimensions.get('window');

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
  categoryTitle: object;
  donateCategoryTitle: object; // NUOVO: stile per titolo "Dona Ora"
  categorySubtitle: object;
  categoryDivider: object;
  donateSubtitle: object;
  exploreSubtitle: object;
  titleSeparator: object;
  separatorLine: object;
  separatorIcon: object;
  buttonsGrid: object;
  buttonRow: object;
  buttonContainer: object;
  gradientBorder: object;
  whiteContainer: object;
  buttonContent: object;
  buttonIcon: object;
  buttonTitle: object;
  infoButton: object;
}

// Animation Hook
const useNewActionsAnimations = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ] as const).current;

  useEffect(() => {
    const sequence = Animated.sequence([
      // Header animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 60,
          friction: 8,
        }),
      ]),
      // Buttons animations staggered
      Animated.delay(300),
      Animated.stagger(
        200,
        buttonAnimations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          })
        )
      ),
    ]);

    sequence.start();

    return () => {
      sequence.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, buttonAnimations]);

  return { fadeAnim, slideAnim, scaleAnim, buttonAnimations };
};

// Modern Info Modal Component
const DonationInfoModal: React.FC<{
  visible: boolean;
  onClose: () => void;
}> = ({ visible, onClose }) => {
  const { triggerHaptic } = useHapticFeedback();
  const modalAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(modalAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, modalAnim, backdropAnim]);

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    // GRADIENT CONTAINER PATTERN per modal (elemento importante)
    modalGradientBorder: {
      borderRadius: 24,
      padding: 3,
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
      maxWidth: screenWidth * 0.9,
      width: '100%',
    },
    modalWhiteContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: 21,
      overflow: 'hidden',
    },
    modalContent: {
      padding: Spacing[6],
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing[5],
    },
    modalTitle: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      flex: 1,
      letterSpacing: -0.5,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    closeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: Colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: Colors.neutral[400],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    modalText: {
      fontSize: Typography.sizes.base,
      fontWeight: Typography.weights.medium,
      color: Colors.neutral[700],
      lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
      marginBottom: Spacing[4],
    },
    highlightText: {
      fontSize: Typography.sizes.lg,
      fontWeight: Typography.weights.bold,
      color: '#DC2626',
      textAlign: 'center',
      marginTop: Spacing[3],
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      backgroundColor: 'rgba(220, 38, 38, 0.05)',
      borderRadius: 12,
      letterSpacing: -0.3,
      textShadowColor: 'rgba(220, 38, 38, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <View style={modalStyles.overlay}>
        <Animated.View
          style={[
            modalStyles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        />
        <Animated.View
          style={[
            {
              opacity: modalAnim,
              transform: [
                {
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
                {
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#991B1B']}
            style={modalStyles.modalGradientBorder}
          >
            <View style={modalStyles.modalWhiteContainer}>
              <View style={modalStyles.modalContent}>
                <View style={modalStyles.modalHeader}>
                  <Text style={modalStyles.modalTitle}>💝 Come Donare</Text>
                  <TouchableOpacity
                    style={modalStyles.closeButton}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color={Colors.neutral[600]}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={modalStyles.modalText}>
                  <Text style={{ fontWeight: Typography.weights.bold }}>
                    🕐 Dona il tuo tempo:{' '}
                  </Text>
                  Partecipa gratuitamente ai nostri eventi di impacchettamento
                  pasti. È un&apos;esperienza formativa e divertente che non
                  richiede alcun costo economico.
                </Text>

                <Text style={modalStyles.modalText}>
                  <Text style={{ fontWeight: Typography.weights.bold }}>
                    🛍️ Charity Shop:{' '}
                  </Text>
                  Fai i tuoi acquisti abituali tramite il nostro sito partner.
                  Non pagherai nulla in più, ma una percentuale
                  dell&apos;importo speso verrà automaticamente destinata ai
                  nostri progetti.
                </Text>

                <Text style={modalStyles.modalText}>
                  <Text style={{ fontWeight: Typography.weights.bold }}>
                    🎁 Charity Gift Card:{' '}
                  </Text>
                  Acquista gift card per te o da regalare. Anche qui una
                  percentuale dell&apos;importo speso viene destinata alla lotta
                  contro la fame mondiale.
                </Text>

                <Text style={modalStyles.highlightText}>
                  ✨ Il tuo contributo più prezioso è il TEMPO, non il denaro!
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Header Section con descrizione aggiunta
const NewActionsHeader: React.FC<{
  animations: ReturnType<typeof useNewActionsAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        headerContainer: {
          paddingTop: Spacing[3], // RIDOTTO drasticamente
          paddingHorizontal: Spacing[4],
          paddingBottom: Spacing[1], // MINIMO
          alignItems: 'center',
          position: 'relative',
        },

        backgroundPattern: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.05,
        },
        titleText: {
          fontSize: screenWidth > 375 ? 38 : 32, // LEGGERMENTE RIDOTTO
          fontWeight: Typography.weights.black,
          color: Colors.neutral[900], // NERO per neutralità e professionalità
          textAlign: 'center',
          letterSpacing: -1.0, // LEGGERMENTE RIDOTTO
          marginBottom: Spacing[2], // Leggermente più spazio
          // Text shadow neutro per eleganza
          textShadowColor: 'rgba(0, 0, 0, 0.15)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 10,
        },
        // Separatore decorativo per titolo principale
        titleSeparator: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 2, // MINIMO
          paddingHorizontal: Spacing[6], // RIDOTTO
        },
        separatorLine: {
          flex: 1,
          height: 2,
          backgroundColor: Colors.neutral[300],
          opacity: 0.6,
          borderRadius: 1,
        },
        separatorIcon: {
          fontSize: 16, // Ridotto da 20
          marginHorizontal: Spacing[3], // Ridotto da 4
          opacity: 0.7,
          color: Colors.neutral[600],
          fontWeight: Typography.weights.bold,
        },
        descriptionText: {
          fontSize: Typography.sizes.base, // INGRANDITO per migliore leggibilità
          fontWeight: Typography.weights.medium,
          color: Colors.neutral[600],
          textAlign: 'center',
          lineHeight: 22, // INGRANDITO per più respiro
          marginBottom: Spacing[4], // AGGIUNTO margine per stacco visivo
          fontStyle: 'italic',
          backgroundColor: 'rgba(59, 130, 246, 0.06)', // Leggermente più visibile
          paddingVertical: Spacing[3], // INGRANDITO per bilanciare font
          paddingHorizontal: Spacing[4], // INGRANDITO
          borderRadius: 14, // INGRANDITO
          borderWidth: 1,
          borderColor: 'rgba(59, 130, 246, 0.12)', // Più visibile
          // Ombra leggera
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08, // Leggermente più visibile
          shadowRadius: 6, // INGRANDITO
          elevation: 2, // Leggermente più elevata
        },
      }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={['rgba(220, 38, 38, 0.05)', 'transparent']}
        style={styles.backgroundPattern}
      />

      {/* TITOLO DIRETTO SENZA CONTAINER */}
      <Text style={styles.titleText}>Come Puoi{'\n'}Aiutare</Text>

      {/* Separatore decorativo */}
      <View style={styles.titleSeparator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorIcon}>◆</Text>
        <View style={styles.separatorLine} />
      </View>

      <Text style={styles.descriptionText}>
        Ogni azione conta nella lotta contro la fame
      </Text>
    </Animated.View>
  );
};

// Nuova sezione bottoni con categorie
const NewActionButtonsSection: React.FC<{
  animations: ReturnType<typeof useNewActionsAnimations>;
  navigation: ContributeTabScreenProps['navigation'];
}> = ({ animations, navigation }) => {
  const { triggerHaptic } = useHapticFeedback();
  const {
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
        id: 'calendario',
        title: 'Calendario',
        icon: 'calendar',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const,
        onPress: () => openEventsLink(),
      },
      {
        id: 'charity-shop',
        title: 'Charity Shop',
        icon: 'shopping',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const,
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: 'Charity Gift Card',
        icon: 'gift',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const,
        onPress: () => openGiftCardLink(),
      },
    ],
    [openEventsLink, openShopLink, openGiftCardLink]
  );

  const otherButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: 'Progetti',
        icon: 'charity',
        gradient: ['#1F2937', '#374151', '#111827'] as const,
        onPress: () => openProjectsLink(),
      },
      {
        id: 'seguici',
        title: 'Seguici',
        icon: 'share-variant',
        gradient: ['#1F2937', '#374151', '#111827'] as const,
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'tracciabilita',
        title: 'Tracciabilità',
        icon: 'map-marker-path',
        gradient: ['#1F2937', '#374151', '#111827'] as const,
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'chi-siamo',
        title: 'Chi Siamo',
        icon: 'information',
        gradient: ['#1F2937', '#374151', '#111827'] as const,
        onPress: () => navigation.navigate('ChiSiamo'),
      },
    ],
    [navigation, openProjectsLink, openTracciabilitaLink]
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

  const handleCloseModal = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  return (
    <>
      <ActionButtonsContent
        animations={animations}
        donateButtons={donateButtons}
        otherButtons={otherButtons}
        onButtonPress={handleButtonPress}
        onInfoPress={handleInfoPress}
      />
      <DonationInfoModal visible={showInfoModal} onClose={handleCloseModal} />
    </>
  );
};

// Componente separato per il contenuto dei bottoni
const ActionButtonsContent: React.FC<{
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  otherButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
}> = ({
  animations,
  donateButtons,
  otherButtons,
  onButtonPress,
  onInfoPress,
}) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          paddingHorizontal: Spacing[4],
          gap: Spacing[6],
          paddingTop: Spacing[8], // DRASTICAMENTE AUMENTATO per stacco visivo
          paddingBottom: Spacing[8],
        },
        categoryContainer: {
          marginBottom: Spacing[6],
        },
        categoryHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: Spacing[2],
          position: 'relative',
        },
        categoryTitle: {
          fontSize: Typography.sizes['3xl'], // INGRANDITO per maggiore presenza
          fontWeight: Typography.weights.black, // AUMENTATO per più impatto
          color: Colors.neutral[800], // MIGLIORATO: più scuro per presenza
          textAlign: 'center',
          letterSpacing: -0.8, // Più stretto per impatto
          marginBottom: Spacing[3], // Più spazio per respirazione
          // Text shadow migliorato per presenza
          textShadowColor: 'rgba(31, 41, 55, 0.15)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 8,
        },
        // NUOVO: Stile specifico per titolo "Dona Ora" - SEMPLICE ROSSO
        donateCategoryTitle: {
          fontSize: Typography.sizes['3xl'], // INGRANDITO come categoryTitle
          fontWeight: Typography.weights.black, // AUMENTATO come categoryTitle
          color: '#DC2626', // ROSSO per collegamento visivo con bottoni
          textAlign: 'center',
          letterSpacing: -0.8, // Come categoryTitle aggiornato
          marginBottom: Spacing[1], // RIDOTTO per avvicinare alla descrizione
          // Text shadow rosso coordinato con i bottoni
          textShadowColor: 'rgba(220, 38, 38, 0.2)',
          textShadowOffset: { width: 0, height: 3 },
          textShadowRadius: 10,
        },
        categorySubtitle: {
          fontSize: Typography.sizes.base,
          fontWeight: Typography.weights.medium,
          textAlign: 'center',
          letterSpacing: 0.3,
          lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
          marginBottom: Spacing[3],
          paddingHorizontal: Spacing[4],
          // Styling elegante per descrizione
          fontStyle: 'italic',
        },
        donateSubtitle: {
          color: '#B91C1C',
          backgroundColor: 'rgba(220, 38, 38, 0.08)',
          paddingVertical: Spacing[2],
          paddingHorizontal: Spacing[4],
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(220, 38, 38, 0.15)',
          // Ombra sottile per elevazione coordinata
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12, // Leggermente più prominente per collegamento
          shadowRadius: 6, // Più morbida
          elevation: 3, // Più elevata per coerenza
        },
        exploreSubtitle: {
          color: '#374151',
          backgroundColor: 'rgba(55, 65, 81, 0.06)',
          paddingVertical: Spacing[2],
          paddingHorizontal: Spacing[4],
          borderRadius: 12,
          borderWidth: 1,
          borderColor: 'rgba(55, 65, 81, 0.12)',
          // Ombra sottile per elevazione
          shadowColor: '#374151',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
        // Separatore decorativo tra titolo e descrizione
        titleSeparator: {
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: Spacing[1], // RIDOTTO per avvicinare "Dona Ora" alla descrizione
          paddingHorizontal: Spacing[6],
        },
        separatorLine: {
          flex: 1,
          height: 1,
          backgroundColor: Colors.neutral[300],
          opacity: 0.4,
        },
        separatorIcon: {
          fontSize: 16,
          marginHorizontal: Spacing[3],
          opacity: 0.5,
          color: Colors.neutral[500],
        },
        infoButton: {
          position: 'absolute',
          right: 55,
          top: 0,
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: '#DC2626',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#DC2626',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 4,
        },
        categoryDivider: {
          height: 1,
          backgroundColor: Colors.neutral[200],
          marginHorizontal: Spacing[8],
          marginBottom: Spacing[6],
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
        // GRADIENT CONTAINER PATTERN per bottoni (clickabili)
        gradientBorder: {
          borderRadius: 24,
          padding: 3, // Bordo gradient
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 8,
        },
        whiteContainer: {
          backgroundColor: Colors.neutral[0],
          borderRadius: 21, // 24-3 per effetto bordo
          overflow: 'hidden',
        },
        buttonContent: {
          paddingVertical: Spacing[6],
          paddingHorizontal: Spacing[4],
          alignItems: 'center',
          minHeight: 120,
          justifyContent: 'center',
        },
        buttonIcon: {
          marginBottom: Spacing[3],
        },
        buttonTitle: {
          fontSize: Typography.sizes.lg,
          fontWeight: Typography.weights.bold,
          color: Colors.neutral[900],
          textAlign: 'center',
          letterSpacing: -0.3,
          // Text shadow per profondità
          textShadowColor: 'rgba(0, 0, 0, 0.05)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        },
      }),
    []
  );

  return (
    <View style={styles.container}>
      {/* CATEGORIA DONA ORA con Info Button */}
      <DonateButtonsSection
        styles={styles}
        animations={animations}
        donateButtons={donateButtons}
        onButtonPress={onButtonPress}
        onInfoPress={onInfoPress}
      />

      {/* CATEGORIA ESPLORA */}
      <ExploreButtonsSection
        styles={styles}
        animations={animations}
        otherButtons={otherButtons}
        onButtonPress={onButtonPress}
      />
    </View>
  );
};

// Sezione bottoni Dona Ora con Info Button
const DonateButtonsSection: React.FC<{
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
}> = ({ styles, animations, donateButtons, onButtonPress, onInfoPress }) => {
  const handleFirstButtonPress = useCallback(() => {
    const button = donateButtons[0];
    if (button) onButtonPress(button);
  }, [onButtonPress, donateButtons]);

  const handleSecondButtonPress = useCallback(() => {
    const button = donateButtons[1];
    if (button) onButtonPress(button);
  }, [onButtonPress, donateButtons]);

  const handleGiftCardPress = useCallback(() => {
    const button = donateButtons[2];
    if (button) onButtonPress(button);
  }, [onButtonPress, donateButtons]);

  return (
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
        <Text style={styles.donateCategoryTitle}>❤️ Dona Ora</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={14} color="white" />
        </TouchableOpacity>
      </View>
      {/* Separatore decorativo */}
      <View style={styles.titleSeparator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorIcon}>•</Text>
        <View style={styles.separatorLine} />
      </View>
      <Text style={[styles.categorySubtitle, styles.donateSubtitle]}>
        Supporta la nostra missione
      </Text>
      <View style={styles.categoryDivider} />
      <View style={styles.buttonsGrid}>
        <View style={styles.buttonRow}>
          {donateButtons[0] && (
            <AnimatedButton
              key={donateButtons[0].id}
              button={donateButtons[0]}
              animationValue={
                animations.buttonAnimations[0] ?? new Animated.Value(0)
              }
              styles={styles}
              onPress={handleFirstButtonPress}
              iconColor="#DC2626"
            />
          )}
          {donateButtons[1] && (
            <AnimatedButton
              key={donateButtons[1].id}
              button={donateButtons[1]}
              animationValue={
                animations.buttonAnimations[1] ?? new Animated.Value(0)
              }
              styles={styles}
              onPress={handleSecondButtonPress}
              iconColor="#DC2626"
            />
          )}
        </View>
        {/* Gift Card a tutta larghezza */}
        {donateButtons[2] && (
          <AnimatedButton
            button={donateButtons[2]}
            animationValue={
              animations.buttonAnimations[2] ?? new Animated.Value(0)
            }
            styles={styles}
            onPress={handleGiftCardPress}
            iconColor="#DC2626"
            fullWidth
          />
        )}
      </View>
    </View>
  );
};

// Sezione bottoni Esplora (rimane uguale)
const ExploreButtonsSection: React.FC<{
  styles: ButtonStyles;
  animations: ReturnType<typeof useNewActionsAnimations>;
  otherButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
}> = ({ styles, animations, otherButtons, onButtonPress }) => {
  const handleFirstRowButtons = useMemo(
    () => [
      () => {
        const button = otherButtons[0];
        if (button) onButtonPress(button);
      },
      () => {
        const button = otherButtons[1];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, otherButtons]
  );

  const handleSecondRowButtons = useMemo(
    () => [
      () => {
        const button = otherButtons[2];
        if (button) onButtonPress(button);
      },
      () => {
        const button = otherButtons[3];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, otherButtons]
  );

  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>🔍 Scopri</Text>
      {/* Separatore decorativo */}
      <View style={styles.titleSeparator}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorIcon}>•</Text>
        <View style={styles.separatorLine} />
      </View>
      <Text style={[styles.categorySubtitle, styles.exploreSubtitle]}>
        Organizzazione e iniziative
      </Text>
      <View style={styles.categoryDivider} />
      <View style={styles.buttonsGrid}>
        {/* Prima riga: Progetti, Seguici */}
        <View style={styles.buttonRow}>
          {otherButtons.slice(0, 2).map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 3];
            const onPress = handleFirstRowButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor="#1F2937"
                />
              );
            }
            return null;
          })}
        </View>
        {/* Seconda riga: Tracciabilità, Chi Siamo */}
        <View style={styles.buttonRow}>
          {otherButtons.slice(2, 4).map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 5];
            const onPress = handleSecondRowButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor="#1F2937"
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

// Componente bottone animato riutilizzabile (rimane uguale)
const AnimatedButton: React.FC<{
  button: ButtonData;
  animationValue: Animated.Value;
  styles: ButtonStyles;
  onPress: () => void;
  iconColor: string;
  fullWidth?: boolean;
}> = ({
  button,
  animationValue,
  styles,
  onPress,
  iconColor,
  fullWidth = false,
}) => (
  <Animated.View
    style={[
      fullWidth ? {} : styles.buttonContainer,
      {
        opacity: animationValue,
        transform: [
          {
            translateY: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            }),
          },
          {
            scale: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      },
    ]}
  >
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <LinearGradient colors={button.gradient} style={styles.gradientBorder}>
        <View style={styles.whiteContainer}>
          <View style={styles.buttonContent}>
            <MaterialCommunityIcons
              name={
                button.icon as
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
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </Animated.View>
);

// NUOVO: Divisore elegante tra header e contenuto
const HeaderDivider: React.FC<{
  animations: ReturnType<typeof useNewActionsAnimations>;
}> = ({ animations }) => {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        dividerContainer: {
          paddingHorizontal: Spacing[4],
          paddingVertical: Spacing[1], // MINIMO
          alignItems: 'center',
        },
        mainDivider: {
          height: 1,
          backgroundColor: Colors.neutral[200], // Colore valido
          width: '40%', // Ancora più corto
          borderRadius: 1,
        },
      }),
    []
  );

  return (
    <Animated.View
      style={[
        styles.dividerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [{ translateY: animations.slideAnim }],
        },
      ]}
    >
      <View style={styles.mainDivider} />
    </Animated.View>
  );
};

// Main Component
export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: Colors.neutral[0],
        },
      }),
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing[8] }}
      >
        <NewActionsHeader animations={animations} />
        <HeaderDivider animations={animations} />
        <NewActionButtonsSection
          animations={animations}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
