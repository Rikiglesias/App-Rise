import React, { useCallback } from 'react';
import { PerfectModal } from '@/components/ui/PerfectModal';
import { modalStyles } from '../styles/modalStyles';
import type { StoriaModalProps } from '../types';
import {
  PlatformScrollView,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';
import { Colors } from '@/shared/constants';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

export const StoriaModal: React.FC<StoriaModalProps> = ({ visible, onClose }) => {
  const { triggerHaptic } = useHapticFeedback();

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  return (
    <PerfectModal
      visible={visible}
      onRequestClose={handleClose}
      size="large"
      padding={0}
      // Lasciamo l'overlay del PerfectModal attivo (transparent interno gestito da PerfectModal)
      // Usiamo il container del PerfectModal come card per evitare glitch di layout
      containerStyle={{
        ...modalStyles.modalContainer,
        ...modalStyles.modalCard,
      }}
      statusBarTranslucent
      animationType="fade"
    >
      {/* Contenuto modal */}
      <PerfectContainer style={modalStyles.modalContent}>
              {/* Header */}
              <PerfectContainer style={modalStyles.modalHeader}>
                <PerfectText size={24} lines={1} style={modalStyles.modalTitle}>
                  La Nostra Storia
                </PerfectText>
                <PlatformTouchable onPress={handleClose} style={modalStyles.closeButton} activeOpacity={0.8}>
                  <PerfectIcon name="close" size={24} color={Colors.neutral[0]} />
                </PlatformTouchable>
              </PerfectContainer>

              {/* Story Content */}
              <PlatformScrollView
                style={modalStyles.storyScroll}
                contentContainerStyle={modalStyles.storyContainer}
                showsVerticalScrollIndicator
              >
                <PerfectContainer style={modalStyles.introCard}>
                  <PerfectText size={14} lines={2} style={modalStyles.introText}>
                    Dal 1998, un movimento globale contro la fame
                  </PerfectText>
                </PerfectContainer>

                <PerfectText size={16} lines={8} style={modalStyles.storyText}>
                  Rise Against Hunger nasce nel 1998 negli Stati Uniti con una missione chiara: combattere la fame
                  nel mondo attraverso la distribuzione di pasti nutrienti e lo sviluppo di programmi sostenibili.
                </PerfectText>

                <PerfectContainer style={modalStyles.sectionDivider} />

                <PerfectContainer style={modalStyles.italyCard}>
                  <PerfectText size={18} lines={1} style={modalStyles.sectionTitle}>
                    🇮🇹 In Italia
                  </PerfectText>
                  <PerfectText size={15} lines={6} style={modalStyles.cardText}>
                    L'organizzazione arriva in Italia con l'obiettivo di coinvolgere le comunità locali nella lotta
                    contro la fame globale. La nostra sede di Bologna è il cuore operativo che coordina le attività su
                    tutto il territorio nazionale.
                  </PerfectText>
                </PerfectContainer>

                <PerfectContainer style={modalStyles.sectionDivider} />

                <PerfectText size={20} lines={1} style={modalStyles.mainSectionTitle}>
                  I Nostri Pilastri
                </PerfectText>

                <PerfectContainer style={modalStyles.pillarsContainer}>
                  <PerfectContainer style={modalStyles.pillarCard}>
                    <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                      🍽️
                    </PerfectText>
                    <PerfectText size={16} lines={2} style={modalStyles.pillarTitle}>
                      Distribuzione Pasti
                    </PerfectText>
                    <PerfectText size={14} lines={3} style={modalStyles.pillarText}>
                      Organizziamo eventi di confezionamento pasti che coinvolgono volontari di ogni età
                    </PerfectText>
                  </PerfectContainer>

                  <PerfectContainer style={modalStyles.pillarCard}>
                    <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                      🤝
                    </PerfectText>
                    <PerfectText size={16} lines={2} style={modalStyles.pillarTitle}>
                      Coinvolgimento Comunitario
                    </PerfectText>
                    <PerfectText size={14} lines={2} style={modalStyles.pillarText}>
                      Uniamo scuole, aziende e organizzazioni in un impegno condiviso
                    </PerfectText>
                  </PerfectContainer>

                  <PerfectContainer style={modalStyles.pillarCard}>
                    <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                      🌍
                    </PerfectText>
                    <PerfectText size={16} lines={1} style={modalStyles.pillarTitle}>
                      Impatto Globale
                    </PerfectText>
                    <PerfectText size={14} lines={3} style={modalStyles.pillarText}>
                      I pasti confezionati raggiungono comunità vulnerabili in tutto il mondo
                    </PerfectText>
                  </PerfectContainer>

                  <PerfectContainer style={modalStyles.pillarCard}>
                    <PerfectText size={32} lines={1} style={modalStyles.pillarIcon}>
                      🎓
                    </PerfectText>
                    <PerfectText size={16} lines={1} style={modalStyles.pillarTitle}>
                      Educazione
                    </PerfectText>
                    <PerfectText size={14} lines={2} style={modalStyles.pillarText}>
                      Sensibilizziamo sul tema della fame e promuoviamo la solidarietà
                    </PerfectText>
                  </PerfectContainer>
                </PerfectContainer>

                <PerfectContainer style={modalStyles.sectionDivider} />

                <PerfectContainer style={modalStyles.finalCard}>
                  <PerfectText size={15} lines={4} style={modalStyles.finalMessage}>
                    Ogni pasto che confezioniamo insieme è un gesto di amore che attraversa i confini e raggiunge chi
                    ne ha più bisogno.
                  </PerfectText>
                  <PerfectText size={16} lines={2} style={modalStyles.finalHighlight}>
                    Unisciti a noi in questa missione di speranza.
                  </PerfectText>
                </PerfectContainer>
              </PlatformScrollView>
      </PerfectContainer>
    </PerfectModal>
  );
};

export default StoriaModal;
