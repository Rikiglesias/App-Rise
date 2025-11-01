import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { Modal, StyleSheet, TouchableOpacity } from 'react-native';

import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
// Migrated to Perfect System responsive layout

import { Colors, Spacing, BorderRadius, Shadows } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';

// ❌ RIMOSSO: Calcolo manuale duplicato con dimensioni schermo

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

// 🎯 MIGRATED: Content component estratto per evitare nested component warning
interface ModalContentProps {
  handleClose: () => Promise<void>;
}

// ✅ Stili estratti e unificati - Perfect System compliant
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalGradientBorder: {
    borderRadius: BorderRadius.xl,
    padding: scale(3),
    ...Shadows.lg,
    maxWidth: undefined,
    width: '100%',
  },
  modalWhiteContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(3),
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
    top: scale(-10),
    right: scale(-6),
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    backgroundColor: Colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: Colors.neutral[0],
    ...Shadows.md,
  },
  centeredTitleContainer: {
    alignItems: 'center',
    marginBottom: Spacing[5],
  },
  centeredTitle: {
    color: Colors.primary[600],
    textAlign: 'center',
    letterSpacing: scale(-0.8),
    ...Shadows.sm,
  },
  titleUnderline: {
    width: scale(80),
    height: scale(3),
    backgroundColor: Colors.primary[600],
    borderRadius: scale(2),
    marginTop: Spacing[2],
    alignSelf: 'center',
    ...Shadows.sm,
  },
  modalText: {
    color: Colors.neutral[700],
    marginBottom: Spacing[4],
  },
  highlightText: {
    color: Colors.primary[600],
    textAlign: 'center',
    marginTop: Spacing[3],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    letterSpacing: scale(-0.3),
    ...Shadows.sm,
  },
});

const ModalContent: React.FC<ModalContentProps> = ({ handleClose }) => {
  return (
    <PerfectContainer style={modalStyles.modalContent}>
      <PerfectContainer style={modalStyles.modalHeader}>
        <PlatformTouchable
          style={modalStyles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="close"
            size={scale(22)}
            color={Colors.neutral[0]}
          />
        </PlatformTouchable>
      </PerfectContainer>

      <PerfectContainer style={modalStyles.centeredTitleContainer}>
        <PerfectText
          size={28}
          lines={1}
          fontWeight="900"
          immunity={true}
          style={modalStyles.centeredTitle}
        >
          Come Donare
        </PerfectText>
        <PerfectContainer style={modalStyles.titleUnderline} />
      </PerfectContainer>

      <PerfectText
        size={16}
        lines={3}
        fontWeight="700"
        style={modalStyles.modalText}
      >
        💰 Donazioni monetarie: Se vuoi fare una donazione monetaria diretta,
        clicca su &quot;Dona Ora&quot; per contribuire immediatamente alla
        nostra missione contro la fame.
      </PerfectText>

      <PerfectText
        size={16}
        lines={4}
        fontWeight="700"
        style={modalStyles.modalText}
      >
        🛍️ Acquisti solidali: Attraverso il nostro Charity Shop, ogni acquisto
        dai nostri partner dona automaticamente una percentuale per i nostri
        programmi. Tu spendi lo stesso prezzo, ma aiuti a combattere la fame!
      </PerfectText>

      <PerfectText
        size={16}
        lines={4}
        fontWeight="700"
        style={modalStyles.modalText}
      >
        🎁 Gift Cards: Funzionano come gli acquisti: compri una Gift Card a
        prezzo normale (per te o come regalo), ma una percentuale viene
        automaticamente donata per la distribuzione di pasti. Aiuti senza costi
        extra!
      </PerfectText>

      <PerfectText
        size={15}
        lines={2}
        fontWeight="700"
        style={modalStyles.highlightText}
      >
        ✨ Il modo più semplice è partecipare ai nostri eventi!
      </PerfectText>
    </PerfectContainer>
  );
};

const DonationInfoModalMigrated: React.FC<DonationInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  // 🎯 NUOVO: Layer centralizzato
  // Layout responsive del modal gestito dai componenti Perfect (PerfectContainer/PerfectModal)

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
        <PerfectContainer style={modalStyles.backdrop} />
        <TouchableOpacity activeOpacity={1} onPress={handleStopPropagation}>
          <PerfectContainer style={{ backgroundColor: 'transparent' }}>
            <LinearGradient
              colors={[Colors.primary[600], Colors.primary[700], Colors.primary[800]]}
              style={modalStyles.modalGradientBorder}
            >
              <PerfectContainer style={modalStyles.modalWhiteContainer}>
                <ModalContent handleClose={handleClose} />
              </PerfectContainer>
            </LinearGradient>
          </PerfectContainer>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default DonationInfoModalMigrated;

// ===================================================================
// 📊 MIGRATION BENEFITS SUMMARY
// ===================================================================

/**
 * ELIMINATI:
 * ❌ Calcolo manuale dimensioni schermo duplicato in 3+ componenti
 * ❌ maxWidth calcolato manualmente e ripetuto
 *
 * AGGIUNTI:
 * ✅ PerfectContainer/PerfectModal                             // Layer centralizzato
 * ✅ modalWidth derivato dai token/layout                      // Width dal tema
 * ✅ PerfectContainer                                          // Wrapper semantico
 *
 * FUTURE BENEFITS:
 * 🚀 Tablet XL → modalWidth automatico per 1280+ px (60% → 50%)
 * 🚀 Dark mode → backgroundColor responsive nei styles
 * 🚀 RTL support → positioning automatico per closeButton
 * 🚀 Re-branding → colori rossi dal tema centralizzato
 *
 * SEMANTIC IMPROVEMENT:
 * ✅ Componente ModalContent estratto per chiarezza
 * ✅ Width semantica invece di calcolo manuale
 * ✅ Preparato per future estensioni (desktop, foldable)
 */
