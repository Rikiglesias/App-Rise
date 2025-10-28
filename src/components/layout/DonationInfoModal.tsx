import React, { useCallback } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { PlatformTouchable, PerfectText } from '../ui';

import { BorderRadius, Spacing } from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onDonate: () => void;
}

export const DonationInfoModal: React.FC<DonationInfoModalProps> = ({
  visible,
  onClose,
  onDonate,
}) => {
  const { colors } = useTheme();

  const handleStopPropagation = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
    },
    []
  );

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },

    modalContainer: {
      backgroundColor: 'white',
      padding: Spacing[6],
      borderRadius: BorderRadius.lg,
      width: '85%',
      maxHeight: '80%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 10,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing[4],
    },

    modalTitle: {
      fontWeight: '700',
      color: '#1F2937',
      flex: 1,
    },

    modalCloseButton: {
      padding: Spacing[2],
      borderRadius: BorderRadius.sm,
      backgroundColor: '#F3F4F6',
    },

    modalCloseIcon: {
      fontWeight: '800',
      color: '#6B7280',
    },

    modalContent: {
      marginBottom: Spacing[6],
    },

    modalText: {
      fontWeight: '400',
      color: '#374151',
      lineHeight: 24,
      marginBottom: Spacing[3],
    },

    modalSubtitle: {
      fontWeight: '600',
      color: '#1F2937',
      marginTop: Spacing[2],
      marginBottom: Spacing[3],
    },

    modalBullets: {
      marginLeft: Spacing[2],
    },

    modalBullet: {
      fontWeight: '400',
      color: '#374151',
      lineHeight: 24,
      marginBottom: Spacing[1],
    },

    modalActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing[3],
    },

    modalButtonSecondary: {
      flex: 1,
      backgroundColor: '#F3F4F6',
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },

    modalButtonSecondaryText: {
      fontWeight: '600',
      color: '#374151',
    },

    modalButtonPrimary: {
      flex: 1,
      backgroundColor: colors.primary[600],
      paddingVertical: Spacing[3],
      paddingHorizontal: Spacing[4],
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    },

    modalButtonPrimaryText: {
      fontWeight: '600',
      color: 'white',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <PlatformTouchable
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <PlatformTouchable activeOpacity={1} onPress={handleStopPropagation}>
          <Animated.View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <PerfectText size={22} lines={2} style={styles.modalTitle}>
                Come Funziona la Donazione
              </PerfectText>
              <PlatformTouchable
                onPress={onClose}
                style={styles.modalCloseButton}
              >
                <PerfectText size={18} lines={1} style={styles.modalCloseIcon}>
                  ×
                </PerfectText>
              </PlatformTouchable>
            </View>

            <View style={styles.modalContent}>
              <PerfectText size={16} lines={6} style={styles.modalText}>
                Puoi contribuire alla nostra missione in diversi modi:
                attraverso acquisti solidali oppure con donazioni monetarie
                dirette.
              </PerfectText>
              <PerfectText size={16} lines={6} style={styles.modalText}>
                Grazie agli accordi strategici con i nostri partner commerciali,
                una percentuale degli acquisti effettuati tramite i nostri
                canali viene automaticamente destinata ai progetti di Rise
                Against Hunger Italia. Tu spendi lo stesso prezzo, ma aiuti a
                combattere la fame!
              </PerfectText>
              <PerfectText size={17} lines={2} style={styles.modalSubtitle}>
                Se vuoi fare una donazione monetaria:
              </PerfectText>
              <View style={styles.modalBullets}>
                <PerfectText size={16} lines={2} style={styles.modalBullet}>
                  • Clicca su &quot;Dona Ora&quot; per donazioni dirette
                </PerfectText>
                <PerfectText size={16} lines={2} style={styles.modalBullet}>
                  • Ogni euro dona pasti nutritivi ai bambini
                </PerfectText>
                <PerfectText size={16} lines={2} style={styles.modalBullet}>
                  • Sostieni progetti educativi e sviluppo sostenibile
                </PerfectText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <PlatformTouchable
                onPress={onClose}
                style={styles.modalButtonSecondary}
              >
                <PerfectText
                  size={16}
                  lines={1}
                  style={styles.modalButtonSecondaryText}
                >
                  Ho Capito
                </PerfectText>
              </PlatformTouchable>
              <PlatformTouchable
                onPress={onDonate}
                style={styles.modalButtonPrimary}
              >
                <PerfectText
                  size={16}
                  lines={1}
                  style={styles.modalButtonPrimaryText}
                >
                  Dona Subito
                </PerfectText>
              </PlatformTouchable>
            </View>
          </Animated.View>
        </PlatformTouchable>
      </PlatformTouchable>
    </Modal>
  );
};
