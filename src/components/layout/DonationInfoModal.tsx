import React from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
      fontSize: 20,
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
      fontSize: 18,
      fontWeight: '800',
      color: '#6B7280',
    },

    modalContent: {
      marginBottom: Spacing[6],
    },

    modalText: {
      fontSize: 16,
      fontWeight: '400',
      color: '#374151',
      lineHeight: 24,
      marginBottom: Spacing[3],
    },

    modalSubtitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      marginTop: Spacing[2],
      marginBottom: Spacing[3],
    },

    modalBullets: {
      marginLeft: Spacing[2],
    },

    modalBullet: {
      fontSize: 16,
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
      fontSize: 16,
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
      fontSize: 16,
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
      <View style={styles.modalOverlay}>
        <Animated.View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Come Funziona la Donazione</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseIcon}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Attraverso la nostra piattaforma digitale innovativa puoi
              contribuire senza costi diretti.
            </Text>
            <Text style={styles.modalText}>
              Grazie agli accordi strategici con i nostri partner commerciali,
              una percentuale degli acquisti effettuati tramite i nostri canali
              viene automaticamente destinata ai progetti di Rise Against Hunger
              Italia.
            </Text>
            <Text style={styles.modalSubtitle}>
              Il tuo contributo si trasforma in:
            </Text>
            <View style={styles.modalBullets}>
              <Text style={styles.modalBullet}>
                • Pasti nutrienti per bambini
              </Text>
              <Text style={styles.modalBullet}>• Supporto educativo</Text>
              <Text style={styles.modalBullet}>• Sviluppo sostenibile</Text>
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalButtonSecondary}
            >
              <Text style={styles.modalButtonSecondaryText}>Ho Capito</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDonate}
              style={styles.modalButtonPrimary}
            >
              <Text style={styles.modalButtonPrimaryText}>Dona Subito</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
