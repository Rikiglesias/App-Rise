import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Modal } from 'react-native';
import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import { scaleDimensionLinear } from '@/shared/constants/responsiveSystem';
import { Colors } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

import { modalStyles } from '../styles/modalStyles';
import type { StoriaModalProps } from '../types';

export const StoriaModal: React.FC<StoriaModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();

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
      <PerfectContainer style={modalStyles.overlay}>
        {/* Backdrop - cliccabile per chiudere */}
        <PlatformTouchable
          style={modalStyles.backdropTouchable}
          onPress={handleClose}
          activeOpacity={1}
        >
          <PerfectContainer style={modalStyles.backdrop} />
        </PlatformTouchable>

        {/* Modal Content */}
        <PerfectContainer style={modalStyles.modalContainer}>
          {/* GRADIENT BORDER */}
          <LinearGradient
            colors={[Colors.primary[600], Colors.primary[700], Colors.primary[800]]}
            style={modalStyles.modalGradientBorder}
          >
            <PerfectContainer style={modalStyles.modalWhiteContainer}>
              <PerfectContainer style={modalStyles.modalContent}>
                {/* Header */}
                <PerfectContainer style={modalStyles.modalHeader}>
                  <PerfectText
                    size={16}
                    lines={1}
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
                      size={scaleDimensionLinear(20)}
                      color={Colors.neutral[0]}
                    />
                  </PlatformTouchable>
                </PerfectContainer>

                {/* Story Content */}
                <PlatformScrollView
                  style={modalStyles.storyScroll}
                  contentContainerStyle={modalStyles.storyContainer}
                  showsVerticalScrollIndicator={true}
                >
                  <PerfectText
                    size={15}
                    lines={1}
                    style={modalStyles.introText}
                  >
                    Dal 1998, un movimento globale contro la fame
                  </PerfectText>

                  <PerfectText
                    size={15}
                    lines={10}
                    style={modalStyles.storyText}
                  >
                    <PerfectText
                      size={15}
                      lines={1}
                        style={modalStyles.highlightText}
                    >
                      Rise Against Hunger
                    </PerfectText>{' '}
                    nasce nel{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                        style={modalStyles.highlightText}
                    >
                      1998
                    </PerfectText>{' '}
                    negli Stati Uniti con una missione chiara: combattere la
                    fame nel mondo attraverso la distribuzione di pasti
                    nutrienti e lo sviluppo di programmi sostenibili.
                  </PerfectText>

                  <PerfectContainer style={modalStyles.sectionDivider} />

                  <PerfectText
                    size={15}
                    lines={1}
                    style={modalStyles.sectionTitle}
                  >
                    <PerfectText size={20} lines={1}>
                      🇮🇹
                    </PerfectText>{' '}
                    In Italia
                  </PerfectText>
                  <PerfectText
                    size={15}
                    lines={8}
                    style={modalStyles.storyText}
                  >
                    La organizzazione arriva in{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                        style={modalStyles.highlightText}
                    >
                      Italia
                    </PerfectText>{' '}
                    con lo obiettivo di coinvolgere le comunità locali nella
                    lotta contro la fame globale. La nostra sede di{' '}
                    <PerfectText
                      size={15}
                      lines={1}
                        style={modalStyles.highlightText}
                    >
                      Bologna
                    </PerfectText>{' '}
                    è il cuore operativo che coordina le attività su tutto il
                    territorio nazionale.
                  </PerfectText>

                  <PerfectContainer style={modalStyles.sectionDivider} />

                  <PerfectText
                    size={15}
                    lines={1}
                    style={modalStyles.sectionTitle}
                  >
                    <PerfectText size={20} lines={1}>
                      🌟
                    </PerfectText>{' '}
                    I Nostri Pilastri
                  </PerfectText>
                  <PerfectContainer style={modalStyles.pillarsContainer}>
                    <PerfectContainer style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                            style={modalStyles.pillarIcon}
                      >
                        🍽️
                      </PerfectText>
                      <PerfectContainer style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                                style={modalStyles.pillarTitle}
                        >
                          Distribuzione Pasti
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={3}
                                style={modalStyles.pillarText}
                        >
                          Organizziamo eventi di confezionamento pasti che
                          coinvolgono volontari di ogni età
                        </PerfectText>
                      </PerfectContainer>
                    </PerfectContainer>

                    <PerfectContainer style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                            style={modalStyles.pillarIcon}
                      >
                        🤝
                      </PerfectText>
                      <PerfectContainer style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                                style={modalStyles.pillarTitle}
                        >
                          Coinvolgimento Comunitario
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={2}
                                style={modalStyles.pillarText}
                        >
                          Uniamo scuole, aziende e organizzazioni in un impegno
                          condiviso
                        </PerfectText>
                      </PerfectContainer>
                    </PerfectContainer>

                    <PerfectContainer style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                            style={modalStyles.pillarIcon}
                      >
                        🌍
                      </PerfectText>
                      <PerfectContainer style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                                style={modalStyles.pillarTitle}
                        >
                          Impatto Globale
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={3}
                                style={modalStyles.pillarText}
                        >
                          I pasti confezionati raggiungono comunità vulnerabili
                          in tutto il mondo
                        </PerfectText>
                      </PerfectContainer>
                    </PerfectContainer>

                    <PerfectContainer style={modalStyles.pillarItem}>
                      <PerfectText
                        size={24}
                        lines={1}
                            style={modalStyles.pillarIcon}
                      >
                        📚
                      </PerfectText>
                      <PerfectContainer style={modalStyles.pillarContent}>
                        <PerfectText
                          size={15}
                          lines={1}
                                style={modalStyles.pillarTitle}
                        >
                          Educazione
                        </PerfectText>
                        <PerfectText
                          size={12}
                          lines={2}
                                style={modalStyles.pillarText}
                        >
                          Sensibilizziamo sul tema della fame e promuoviamo la
                          solidarietà
                        </PerfectText>
                      </PerfectContainer>
                    </PerfectContainer>
                  </PerfectContainer>

                  <PerfectContainer style={modalStyles.sectionDivider} />

                  <PerfectContainer style={modalStyles.finalMessageContainer}>
                    <PerfectText
                      size={12}
                      lines={6}
                      style={modalStyles.finalMessage}
                    >
                      Ogni pasto che confezioniamo insieme è un gesto di amore
                      che attraversa i confini e raggiunge chi ne ha più
                      bisogno.
                      {'\n\n'}
                      <PerfectText
                        size={12}
                        lines={1}
                        style={modalStyles.highlightText}
                      >
                        Unisciti a noi in questa missione di speranza.
                      </PerfectText>
                    </PerfectText>
                  </PerfectContainer>
                </PlatformScrollView>
              </PerfectContainer>
            </PerfectContainer>
          </LinearGradient>
        </PerfectContainer>
      </PerfectContainer>
    </Modal>
  );
};
