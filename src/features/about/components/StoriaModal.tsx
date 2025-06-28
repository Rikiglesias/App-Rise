import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Modal, Text, View } from 'react-native';
import { PlatformScrollView, PlatformTouchable } from '../../../components/ui';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { modalStyles } from '../styles';
import type { StoriaModalProps } from '../types';

export const StoriaModal: React.FC<StoriaModalProps> = ({
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

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
    >
      <View style={modalStyles.overlay}>
        {/* Backdrop - cliccabile per chiudere */}
        <PlatformTouchable
          style={modalStyles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        >
          <Animated.View
            style={[
              modalStyles.backdrop,
              {
                opacity: backdropAnim,
              },
            ]}
          />
        </PlatformTouchable>

        {/* Modal Content */}
        <Animated.View
          style={[
            modalStyles.modalContainer,
            {
              opacity: modalAnim,
              transform: [
                {
                  scale: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
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
          {/* GRADIENT CONTAINER PATTERN per modal */}
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#991B1B']}
            style={modalStyles.modalGradientBorder}
          >
            <View style={modalStyles.modalWhiteContainer}>
              <View style={modalStyles.modalContent}>
                {/* Header */}
                <View style={modalStyles.modalHeader}>
                  <Text style={modalStyles.modalTitle}>La Nostra Storia</Text>
                  <PlatformTouchable
                    onPress={handleClose}
                    style={modalStyles.closeButton}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20} // RIDOTTO: da 24 a 20 per coordinare con il pulsante più piccolo
                      color="#FFFFFF" // CAMBIATO: da rosso a bianco per contrasto con sfondo scuro
                    />
                  </PlatformTouchable>
                </View>

                {/* Story Content */}
                <PlatformScrollView
                  style={modalStyles.storyScroll}
                  contentContainerStyle={modalStyles.storyContainer}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={modalStyles.introText}>
                    Dal 1998, un movimento globale contro la fame
                  </Text>

                  <Text style={modalStyles.storyText}>
                    <Text style={modalStyles.highlightText}>
                      Rise Against Hunger
                    </Text>{' '}
                    nasce nel{' '}
                    <Text style={modalStyles.highlightText}>1998</Text> negli
                    Stati Uniti con una missione chiara: combattere la fame nel
                    mondo attraverso la distribuzione di pasti nutrienti e lo
                    sviluppo di programmi sostenibili.
                  </Text>

                  <View style={modalStyles.sectionDivider} />

                  <Text style={modalStyles.sectionTitle}>🇮🇹 In Italia</Text>
                  <Text style={modalStyles.storyText}>
                    La organizzazione arriva in{' '}
                    <Text style={modalStyles.highlightText}>Italia</Text> con lo
                    obiettivo di coinvolgere le comunità locali nella lotta
                    contro la fame globale. La nostra sede di{' '}
                    <Text style={modalStyles.highlightText}>Bologna</Text> è il
                    cuore operativo che coordina le attività su tutto il
                    territorio nazionale.
                  </Text>

                  <View style={modalStyles.sectionDivider} />

                  <Text style={modalStyles.sectionTitle}>
                    🌟 I Nostri Pilastri
                  </Text>
                  <View style={modalStyles.pillarsContainer}>
                    <View style={modalStyles.pillarItem}>
                      <Text style={modalStyles.pillarIcon}>🍽️</Text>
                      <View style={modalStyles.pillarContent}>
                        <Text style={modalStyles.pillarTitle}>
                          Distribuzione Pasti
                        </Text>
                        <Text style={modalStyles.pillarText}>
                          Organizziamo eventi di confezionamento pasti che
                          coinvolgono volontari di ogni età
                        </Text>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <Text style={modalStyles.pillarIcon}>🤝</Text>
                      <View style={modalStyles.pillarContent}>
                        <Text style={modalStyles.pillarTitle}>
                          Coinvolgimento Comunitario
                        </Text>
                        <Text style={modalStyles.pillarText}>
                          Uniamo scuole, aziende e organizzazioni in un impegno
                          condiviso
                        </Text>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <Text style={modalStyles.pillarIcon}>🌍</Text>
                      <View style={modalStyles.pillarContent}>
                        <Text style={modalStyles.pillarTitle}>
                          Impatto Globale
                        </Text>
                        <Text style={modalStyles.pillarText}>
                          I pasti confezionati raggiungono comunità vulnerabili
                          in tutto il mondo
                        </Text>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <Text style={modalStyles.pillarIcon}>📚</Text>
                      <View style={modalStyles.pillarContent}>
                        <Text style={modalStyles.pillarTitle}>Educazione</Text>
                        <Text style={modalStyles.pillarText}>
                          Sensibilizziamo sul tema della fame e promuoviamo la
                          solidarietà
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={modalStyles.sectionDivider} />

                  <View style={modalStyles.finalMessageContainer}>
                    <Text style={modalStyles.finalMessage}>
                      Ogni pasto che confezioniamo insieme è un gesto di amore
                      che attraversa i confini e raggiunge chi ne ha più
                      bisogno.
                      {'\n\n'}
                      <Text style={modalStyles.highlightText}>
                        Unisciti a noi in questa missione di speranza.
                      </Text>
                    </Text>
                  </View>
                </PlatformScrollView>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};
