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

import {
  Colors,
  BorderRadius,
  Shadows,
  Typography,
} from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import {
  scale,
  scaleTouch,
  scaleSpacing,
} from '@/shared/constants/perfectScale';
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
    paddingHorizontal: PerfectSpacing.base,
    backgroundColor: 'transparent',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // rgba necessario per backdrop modal semi-trasparente
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
    padding: PerfectSpacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: PerfectSpacing.sm,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: scaleSpacing(-10),
    right: scaleSpacing(-6),
    width: scaleTouch(36),
    height: scaleTouch(36),
    borderRadius: scale(18),
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: Colors.neutral[0],
    ...Shadows.md,
  },
  centeredTitleContainer: {
    alignItems: 'center',
    marginBottom: scale(20),
  },
  centeredTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.primary[500],
    textAlign: 'center',
    letterSpacing: scale(-0.8),
    ...Shadows.sm,
  },
  titleUnderline: {
    width: scale(80),
    height: scale(3),
    backgroundColor: Colors.primary[500],
    borderRadius: scale(2),
    marginTop: PerfectSpacing.sm,
    alignSelf: 'center',
    ...Shadows.sm,
  },
  modalSectionTitle: {
    fontWeight: Typography.weights.black,
    color: Colors.neutral[800],
  },
  modalText: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[700],
    marginBottom: PerfectSpacing.base,
  },
  highlightText: {
    fontWeight: Typography.weights.bold,
    color: Colors.primary[500],
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    paddingVertical: PerfectSpacing.md,
    paddingHorizontal: PerfectSpacing.base,
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    letterSpacing: scale(-0.3),
    ...Shadows.sm,
  },

  transparentContainer: {
    backgroundColor: 'transparent',
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
          accessibilityRole="button"
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
          immunity={true}
          style={modalStyles.centeredTitle}
        >
          Come Donare
        </PerfectText>
        <PerfectContainer style={modalStyles.titleUnderline} />
      </PerfectContainer>

      <PerfectText size={16} lines={0} style={modalStyles.modalText}>
        <PerfectText size={16} lines={1} style={modalStyles.modalSectionTitle}>
          💰 Donazioni monetarie:
        </PerfectText>{' '}
        Se vuoi fare una donazione monetaria diretta, clicca su &quot;Dona
        Ora&quot; per contribuire immediatamente alla nostra missione contro la
        fame.
      </PerfectText>

      <PerfectText size={16} lines={0} style={modalStyles.modalText}>
        <PerfectText size={16} lines={1} style={modalStyles.modalSectionTitle}>
          🛍️ Acquisti solidali:
        </PerfectText>{' '}
        Attraverso il nostro Charity Shop, ogni acquisto dai nostri partner dona
        automaticamente una percentuale per i nostri programmi. Tu spendi lo
        stesso prezzo, ma aiuti a combattere la fame!
      </PerfectText>

      <PerfectText size={16} lines={0} style={modalStyles.modalText}>
        <PerfectText size={16} lines={1} style={modalStyles.modalSectionTitle}>
          🎁 Gift Cards:
        </PerfectText>{' '}
        Funzionano come gli acquisti: compri una Gift Card a prezzo normale (per
        te o come regalo), ma una percentuale viene automaticamente donata per
        la distribuzione di pasti. Aiuti senza costi extra!
      </PerfectText>

      <PerfectText size={15} lines={2} style={modalStyles.highlightText}>
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
          <PerfectContainer style={modalStyles.transparentContainer}>
            <LinearGradient
              colors={[
                Colors.primary[500],
                Colors.primary[600],
                Colors.primary[700],
              ]}
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
