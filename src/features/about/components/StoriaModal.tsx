import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Modal, View } from 'react-native';
import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectText,
} from '../../../components/ui';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { modalStyles } from '../styles';
import type { StoriaModalProps } from '../types';

export const StoriaModal: React.FC<StoriaModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  // ANIMAZIONI DISABILITATE - valori statici per evitare bordi grigi
  const modalAnim = useRef(new Animated.Value(1)).current; // Sempre visibile
  const backdropAnim = useRef(new Animated.Value(1)).current; // Sempre visibile

  useEffect(() => {
    // ANIMAZIONI DISABILITATE - nessuna animazione per evitare bordi grigi
    // Il modal si apre/chiude istantaneamente
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
          <View style={modalStyles.backdrop} />
        </PlatformTouchable>

        {/* Modal Content */}
        <View style={modalStyles.modalContainer}>
          {/* GRADIENT CONTAINER PATTERN per modal */}
          <LinearGradient
            colors={['#DC2626', '#B91C1C', '#991B1B']}
            style={modalStyles.modalGradientBorder}
          >
            <View style={modalStyles.modalWhiteContainer}>
              <View style={modalStyles.modalContent}>
                {/* Header */}
                <View style={modalStyles.modalHeader}>
                  <PerfectText
                    size={16}
                    lines={1}
                    fontWeight="400"
                    style={modalStyles.modalTitle}
                  >
                    La Nostra Storia
                  </PerfectText>
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
                  <PerfectText
                    size={15}
                    lines={1}
                    fontWeight="400"
                    style={modalStyles.introText}
                  >
                    Dal 1998, un movimento globale contro la fame
                  </PerfectText>

                  <PerfectText
                    size={15}
                    lines={10}
                    fontWeight="400"
                    style={modalStyles.storyText}
                  >
                    <PerfectText
                      size={15}
                      lines={1}
                      fontWeight="400"
                      style={modalStyles.highlightText}
                    >
                      Rise Against Hunger
                    </PerfectText>{' '}
                    nasce nel{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                      fontWeight="400"
                      style={modalStyles.highlightText}
                    >
                      1998
                    </PerfectText>{' '}
                    negli Stati Uniti con una missione chiara: combattere la
                    fame nel mondo attraverso la distribuzione di pasti
                    nutrienti e lo sviluppo di programmi sostenibili.
                  </PerfectText>

                  <View style={modalStyles.sectionDivider} />

                  <PerfectText
                    size={15}
                    lines={1}
                    fontWeight="400"
                    style={modalStyles.sectionTitle}
                  >
                    <PerfectText size={20} lines={1} fontWeight="400">
                      🇮🇹
                    </PerfectText>{' '}
                    In Italia
                  </PerfectText>
                  <PerfectText
                    size={15}
                    lines={8}
                    fontWeight="400"
                    style={modalStyles.storyText}
                  >
                    La organizzazione arriva in{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                      fontWeight="400"
                      style={modalStyles.highlightText}
                    >
                      Italia
                    </PerfectText>{' '}
                    con lo obiettivo di coinvolgere le comunità locali nella
                    lotta contro la fame globale. La nostra sede di{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                      fontWeight="400"
                      style={modalStyles.highlightText}
                    >
                      Bologna
                    </PerfectText>{' '}
                    è il cuore operativo che coordina le attività su tutto il
                    territorio nazionale.
                  </PerfectText>

                  <View style={modalStyles.sectionDivider} />

                  <PerfectText
                    size={15}
                    lines={1}
                    fontWeight="400"
                    style={modalStyles.sectionTitle}
                  >
                    <PerfectText size={20} lines={1} fontWeight="400">
                      🌟
                    </PerfectText>{' '}
                    I Nostri Pilastri
                  </PerfectText>
                  <View style={modalStyles.pillarsContainer}>
                    <View style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                        fontWeight="400"
                        style={modalStyles.pillarIcon}
                      >
                        🍽️
                      </PerfectText>
                      <View style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                          fontWeight="400"
                          style={modalStyles.pillarTitle}
                        >
                          Distribuzione Pasti
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={3}
                          fontWeight="400"
                          style={modalStyles.pillarText}
                        >
                          Organizziamo eventi di confezionamento pasti che
                          coinvolgono volontari di ogni età
                        </PerfectText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                        fontWeight="400"
                        style={modalStyles.pillarIcon}
                      >
                        🤝
                      </PerfectText>
                      <View style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                          fontWeight="400"
                          style={modalStyles.pillarTitle}
                        >
                          Coinvolgimento Comunitario
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={2}
                          fontWeight="400"
                          style={modalStyles.pillarText}
                        >
                          Uniamo scuole, aziende e organizzazioni in un impegno
                          condiviso
                        </PerfectText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                        fontWeight="400"
                        style={modalStyles.pillarIcon}
                      >
                        🌍
                      </PerfectText>
                      <View style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                          fontWeight="400"
                          style={modalStyles.pillarTitle}
                        >
                          Impatto Globale
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={3}
                          fontWeight="400"
                          style={modalStyles.pillarText}
                        >
                          I pasti confezionati raggiungono comunità vulnerabili
                          in tutto il mondo
                        </PerfectText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                        fontWeight="400"
                        style={modalStyles.pillarIcon}
                      >
                        📚
                      </PerfectText>
                      <View style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                          fontWeight="400"
                          style={modalStyles.pillarTitle}
                        >
                          Educazione
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={2}
                          fontWeight="400"
                          style={modalStyles.pillarText}
                        >
                          Sensibilizziamo sul tema della fame e promuoviamo la
                          solidarietà
                        </PerfectText>
                      </View>
                    </View>
                  </View>

                  <View style={modalStyles.sectionDivider} />

                  <View style={modalStyles.finalMessageContainer}>
                    <PerfectText
                      size={12}
                      lines={6}
                      fontWeight="400"
                      style={modalStyles.finalMessage}
                    >
                      Ogni pasto che confezioniamo insieme è un gesto di amore
                      che attraversa i confini e raggiunge chi ne ha più
                      bisogno.
                      {'\n\n'}
                      <PerfectText
                        size={12}
                        lines={1}
                        fontWeight="400"
                        style={modalStyles.highlightText}
                      >
                        Unisciti a noi in questa missione di speranza.
                      </PerfectText>
                    </PerfectText>
                  </View>
                </PlatformScrollView>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};
