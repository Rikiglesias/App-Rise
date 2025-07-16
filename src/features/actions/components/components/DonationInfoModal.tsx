import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import { PlatformTouchable } from '../../../../components/ui';
import { FormattedText } from '../../../../components/ui/FormattedText';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../../shared/constants/designTokens';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';

const { width: screenWidth } = Dimensions.get('window');

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

const DonationInfoModal: React.FC<DonationInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  const handleStopPropagation = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
    },
    []
  );

  const modalStyles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      backgroundColor: 'transparent', // ANDROID: Elimina il cazzo di container grigio
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    // DUAL PLATFORM CONTAINER - Android solido, iOS gradiente
    modalGradientBorder: {
      borderRadius: 24,
      padding: Platform.OS === 'android' ? 0 : 3, // ANDROID: Zero padding per eliminare spazi grigi
      // ANDROID: Background rosso solido - ZERO artefatti
      ...(Platform.OS === 'android' && {
        backgroundColor: '#DC2626',
        borderWidth: 2,
        borderColor: '#DC2626', // Bordo rosso matching per eliminare artefatti
      }),
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: Platform.OS === 'android' ? 0.2 : 0.3, // ANDROID: ombra più leggera
      shadowRadius: 20,
      elevation: Platform.OS === 'android' ? 8 : 12, // ANDROID: elevazione ridotta
      maxWidth: screenWidth * 0.9,
      width: '100%',
    },
    modalWhiteContainer: {
      backgroundColor: Colors.neutral[0],
      borderRadius: Platform.OS === 'android' ? 21 : 21, // ANDROID: Border radius ottimizzato per eliminare spazi grigi
      overflow: 'hidden',
    },
    modalContent: {
      padding: Spacing[6],
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing[2],
      position: 'relative',
    },

    closeButton: {
      position: 'absolute',
      top: -10, // ANCORA PIÙ IN ALTO: entrambe le piattaforme, esce ancora di più dal bordo superiore
      right: Platform.OS === 'android' ? -15 : -6, // Android: MOLTO più a destra / iOS: posizione normale
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#DC2626',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: Colors.neutral[0],
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 6,
    },
    // TITOLO CENTRATO CARINO
    centeredTitleContainer: {
      alignItems: 'center',
      marginBottom: Spacing[5],
    },
    centeredTitle: {
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      textAlign: 'center',
      letterSpacing: -0.8,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    titleUnderline: {
      width: 80, // Larghezza aumentata per essere proporzionata al titolo più grande
      height: 3,
      backgroundColor: '#DC2626',
      borderRadius: 2,
      marginTop: Spacing[2],
      alignSelf: 'center', // CENTRAMENTO PERFETTO: forza la linea al centro
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    modalText: {
      color: Colors.neutral[700],
      marginBottom: Spacing[4],
    },
    highlightText: {
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
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <View style={modalStyles.backdrop} />
        <TouchableOpacity activeOpacity={1} onPress={handleStopPropagation}>
          <View style={{ backgroundColor: 'transparent' }}>
            {Platform.OS === 'android' ? (
              // ANDROID: Container solido - ZERO artefatti grigi
              <View style={modalStyles.modalGradientBorder}>
                <View style={modalStyles.modalWhiteContainer}>
                  <View style={modalStyles.modalContent}>
                    <View style={modalStyles.modalHeader}>
                      <PlatformTouchable
                        style={modalStyles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name="close"
                          size={22}
                          color={Colors.neutral[0]}
                        />
                      </PlatformTouchable>
                    </View>

                    {/* TITOLO CENTRATO E CARINO */}
                    <View style={modalStyles.centeredTitleContainer}>
                      <FormattedText
                        fontSize={28}
                        lineBreakStrategyIOS="push-out"
                        breakStrategyAndroid="highQuality"
                        hyphenationFrequencyAndroid="full"
                        style={modalStyles.centeredTitle}
                      >
                        Come Donare
                      </FormattedText>
                      <View style={modalStyles.titleUnderline} />
                    </View>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      💰 Donazioni monetarie: Se vuoi fare una donazione
                      monetaria diretta, clicca su &quot;Dona Ora&quot; per
                      contribuire immediatamente alla nostra missione contro la
                      fame.
                    </Text>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      🛍️ Acquisti solidali: Attraverso il nostro Charity Shop,
                      ogni acquisto dai nostri partner dona automaticamente una
                      percentuale per i nostri programmi. Tu spendi lo stesso
                      prezzo, ma aiuti a combattere la fame!
                    </Text>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      🎁 Gift Cards: Funzionano come gli acquisti: compri una
                      Gift Card a prezzo normale (per te o come regalo), ma una
                      percentuale viene automaticamente donata per la
                      distribuzione di pasti. Aiuti senza costi extra!
                    </Text>

                    <Text style={modalStyles.highlightText}>
                      ✨ Il modo più semplice è partecipare ai nostri eventi!
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              // iOS: Gradiente normale
              <LinearGradient
                colors={['#DC2626', '#B91C1C', '#991B1B']}
                style={modalStyles.modalGradientBorder}
              >
                <View style={modalStyles.modalWhiteContainer}>
                  <View style={modalStyles.modalContent}>
                    <View style={modalStyles.modalHeader}>
                      <PlatformTouchable
                        style={modalStyles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.7}
                      >
                        <MaterialCommunityIcons
                          name="close"
                          size={22}
                          color={Colors.neutral[0]}
                        />
                      </PlatformTouchable>
                    </View>

                    {/* TITOLO CENTRATO E CARINO */}
                    <View style={modalStyles.centeredTitleContainer}>
                      <FormattedText
                        fontSize={28}
                        lineBreakStrategyIOS="push-out"
                        breakStrategyAndroid="highQuality"
                        hyphenationFrequencyAndroid="full"
                        style={modalStyles.centeredTitle}
                      >
                        Come Donare
                      </FormattedText>
                      <View style={modalStyles.titleUnderline} />
                    </View>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      💰 Donazioni monetarie: Se vuoi fare una donazione
                      monetaria diretta, clicca su &quot;Dona Ora&quot; per
                      contribuire immediatamente alla nostra missione contro la
                      fame.
                    </Text>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      🛍️ Acquisti solidali: Attraverso il nostro Charity Shop,
                      ogni acquisto dai nostri partner dona automaticamente una
                      percentuale per i nostri programmi. Tu spendi lo stesso
                      prezzo, ma aiuti a combattere la fame!
                    </Text>

                    <Text
                      style={[
                        modalStyles.modalText,
                        { fontWeight: Typography.weights.bold },
                      ]}
                    >
                      🎁 Gift Cards: Funzionano come gli acquisti: compri una
                      Gift Card a prezzo normale (per te o come regalo), ma una
                      percentuale viene automaticamente donata per la
                      distribuzione di pasti. Aiuti senza costi extra!
                    </Text>

                    <Text style={modalStyles.highlightText}>
                      ✨ Il modo più semplice è partecipare ai nostri eventi!
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DonationInfoModal;
