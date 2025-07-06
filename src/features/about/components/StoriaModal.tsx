import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef } from 'react';
import { Animated, Modal, View } from 'react-native';
import {
  PlatformScrollView,
  PlatformTouchable,
  FormattedText,
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
                  <FormattedText fontSize={16} style={modalStyles.modalTitle}>
                    La Nostra Storia
                  </FormattedText>
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
                  <FormattedText fontSize={15} style={modalStyles.introText}>
                    Dal 1998, un movimento globale contro la fame
                  </FormattedText>

                  <FormattedText fontSize={15} style={modalStyles.storyText}>
                    <FormattedText
                      fontSize={15}
                      style={modalStyles.highlightText}
                    >
                      Rise Against Hunger
                    </FormattedText>{' '}
                    nasce nel{' '}
                    <FormattedText
                      fontSize={15}
                      style={modalStyles.highlightText}
                    >
                      1998
                    </FormattedText>{' '}
                    negli Stati Uniti con una missione chiara: combattere la
                    fame nel mondo attraverso la distribuzione di pasti
                    nutrienti e lo sviluppo di programmi sostenibili.
                  </FormattedText>

                  <View style={modalStyles.sectionDivider} />

                  <FormattedText fontSize={15} style={modalStyles.sectionTitle}>
                    <FormattedText fontSize={20} fixedLines={1}>
                      🇮🇹
                    </FormattedText>{' '}
                    In Italia
                  </FormattedText>
                  <FormattedText fontSize={15} style={modalStyles.storyText}>
                    La organizzazione arriva in{' '}
                    <FormattedText
                      fontSize={15}
                      style={modalStyles.highlightText}
                    >
                      Italia
                    </FormattedText>{' '}
                    con lo obiettivo di coinvolgere le comunità locali nella
                    lotta contro la fame globale. La nostra sede di{' '}
                    <FormattedText
                      fontSize={15}
                      style={modalStyles.highlightText}
                    >
                      Bologna
                    </FormattedText>{' '}
                    è il cuore operativo che coordina le attività su tutto il
                    territorio nazionale.
                  </FormattedText>

                  <View style={modalStyles.sectionDivider} />

                  <FormattedText fontSize={15} style={modalStyles.sectionTitle}>
                    <FormattedText fontSize={20} fixedLines={1}>
                      🌟
                    </FormattedText>{' '}
                    I Nostri Pilastri
                  </FormattedText>
                  <View style={modalStyles.pillarsContainer}>
                    <View style={modalStyles.pillarItem}>
                      <FormattedText
                        fontSize={24}
                        fixedLines={1}
                        style={modalStyles.pillarIcon}
                      >
                        🍽️
                      </FormattedText>
                      <View style={modalStyles.pillarContent}>
                        <FormattedText
                          fontSize={15}
                          style={modalStyles.pillarTitle}
                        >
                          Distribuzione Pasti
                        </FormattedText>
                        <FormattedText
                          fontSize={12}
                          style={modalStyles.pillarText}
                        >
                          Organizziamo eventi di confezionamento pasti che
                          coinvolgono volontari di ogni età
                        </FormattedText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <FormattedText
                        fontSize={24}
                        fixedLines={1}
                        style={modalStyles.pillarIcon}
                      >
                        🤝
                      </FormattedText>
                      <View style={modalStyles.pillarContent}>
                        <FormattedText
                          fontSize={15}
                          style={modalStyles.pillarTitle}
                        >
                          Coinvolgimento Comunitario
                        </FormattedText>
                        <FormattedText
                          fontSize={12}
                          style={modalStyles.pillarText}
                        >
                          Uniamo scuole, aziende e organizzazioni in un impegno
                          condiviso
                        </FormattedText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <FormattedText
                        fontSize={24}
                        fixedLines={1}
                        style={modalStyles.pillarIcon}
                      >
                        🌍
                      </FormattedText>
                      <View style={modalStyles.pillarContent}>
                        <FormattedText
                          fontSize={15}
                          style={modalStyles.pillarTitle}
                        >
                          Impatto Globale
                        </FormattedText>
                        <FormattedText
                          fontSize={12}
                          style={modalStyles.pillarText}
                        >
                          I pasti confezionati raggiungono comunità vulnerabili
                          in tutto il mondo
                        </FormattedText>
                      </View>
                    </View>

                    <View style={modalStyles.pillarItem}>
                      <FormattedText
                        fontSize={24}
                        fixedLines={1}
                        style={modalStyles.pillarIcon}
                      >
                        📚
                      </FormattedText>
                      <View style={modalStyles.pillarContent}>
                        <FormattedText
                          fontSize={15}
                          style={modalStyles.pillarTitle}
                        >
                          Educazione
                        </FormattedText>
                        <FormattedText
                          fontSize={12}
                          style={modalStyles.pillarText}
                        >
                          Sensibilizziamo sul tema della fame e promuoviamo la
                          solidarietà
                        </FormattedText>
                      </View>
                    </View>
                  </View>

                  <View style={modalStyles.sectionDivider} />

                  <View style={modalStyles.finalMessageContainer}>
                    <FormattedText
                      fontSize={12}
                      style={modalStyles.finalMessage}
                    >
                      Ogni pasto che confezioniamo insieme è un gesto di amore
                      che attraversa i confini e raggiunge chi ne ha più
                      bisogno.
                      {'\n\n'}
                      <FormattedText
                        fontSize={12}
                        style={modalStyles.highlightText}
                      >
                        Unisciti a noi in questa missione di speranza.
                      </FormattedText>
                    </FormattedText>
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
