import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';

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
      justifyContent: 'flex-end',
      alignItems: 'center',
      marginBottom: Spacing[2],
      position: 'relative',
    },

    closeButton: {
      position: 'absolute',
      top: Spacing[2], // ABBASSATA: da -Spacing[2] a Spacing[2]
      right: -Spacing[4], // MOLTO PIÙ A SINISTRA: da -Spacing[2] a -Spacing[4]
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(220, 38, 38, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(220, 38, 38, 0.2)',
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    // TITOLO CENTRATO CARINO
    centeredTitleContainer: {
      alignItems: 'center',
      marginBottom: Spacing[5],
    },
    centeredTitle: {
      fontSize: Typography.sizes['2xl'],
      fontWeight: Typography.weights.black,
      color: '#DC2626',
      textAlign: 'center',
      letterSpacing: -0.8,
      textShadowColor: 'rgba(220, 38, 38, 0.15)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 6,
    },
    titleUnderline: {
      width: 60,
      height: 3,
      backgroundColor: '#DC2626',
      borderRadius: 2,
      marginTop: Spacing[2],
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    modalText: {
      fontSize: Typography.sizes.base,
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
      <TouchableOpacity
        style={modalStyles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            modalStyles.backdrop,
            {
              opacity: backdropAnim,
            },
          ]}
        />
        <TouchableOpacity activeOpacity={1} onPress={handleStopPropagation}>
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
                    <TouchableOpacity
                      style={modalStyles.closeButton}
                      onPress={handleClose}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={20}
                        color="#DC2626" // ROSSO COORDINATO per maggiore visibilità
                      />
                    </TouchableOpacity>
                  </View>

                  {/* TITOLO CENTRATO E CARINO */}
                  <View style={modalStyles.centeredTitleContainer}>
                    <Text style={modalStyles.centeredTitle}>
                      💝 Come Donare
                    </Text>
                    <View style={modalStyles.titleUnderline} />
                  </View>

                  <Text style={modalStyles.modalText}>
                    <Text style={{ fontWeight: Typography.weights.bold }}>
                      💰 Donazioni monetarie:{' '}
                    </Text>
                    Se vuoi fare una donazione monetaria diretta, clicca su
                    &quot;Dona Ora&quot; per contribuire immediatamente alla
                    nostra missione contro la fame.
                  </Text>

                  <Text style={modalStyles.modalText}>
                    <Text style={{ fontWeight: Typography.weights.bold }}>
                      💝 Donazioni materiali:{' '}
                    </Text>
                    Attraverso il nostro Charity Shop, ogni acquisto dei nostri
                    partner dona una percentuale per i nostri programmi.
                  </Text>

                  <Text style={modalStyles.modalText}>
                    <Text style={{ fontWeight: Typography.weights.bold }}>
                      🎁 Gift Card solidali:{' '}
                    </Text>
                    Regala una Gift Card che contribuisce direttamente alla
                    distribuzione di pasti nel mondo.
                  </Text>

                  <Text style={modalStyles.highlightText}>
                    ✨ Il modo più semplice è partecipare ai nostri eventi!
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DonationInfoModal;
