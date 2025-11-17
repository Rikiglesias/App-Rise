import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectModal,
} from '@/components/ui';
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
import { useTranslation } from '@/shared/hooks/useTranslation';

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ModalContentProps {
  handleClose: () => Promise<void>;
}

const modalStyles = StyleSheet.create({
  modalGradientBorder: {
    borderRadius: BorderRadius.xl,
    padding: scale(3),
    ...Shadows.lg,
    width: '100%',
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(3),
    overflow: 'hidden',
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
    <PerfectContainer
      style={modalStyles.modalContent}
      testID="donation-modal-content"
    >
      <PerfectContainer style={modalStyles.modalHeader}>
        <PlatformTouchable
          style={modalStyles.closeButton}
          onPress={handleClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Chiudi informazioni donazioni"
          testID="donation-modal-close"
        >
          <PerfectIcon name="close" size={22} color={Colors.neutral[0]} />
        </PlatformTouchable>
      </PerfectContainer>

      <PerfectContainer style={modalStyles.centeredTitleContainer}>
        <PerfectText
          size={28}
          lines={1}
          immunity={true}
          style={modalStyles.centeredTitle}
        >
          {t('actions.donationInfoTitle')}
        </PerfectText>
        <PerfectContainer style={modalStyles.titleUnderline} />
      </PerfectContainer>

      <PerfectText size={16} lines={0} style={modalStyles.modalText}>
        <PerfectText size={16} lines={1} style={modalStyles.modalSectionTitle}>
          {t('actions.donationMonetary')}
        </PerfectText>{' '}
        {t('actions.donationMonetaryText')}
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
        Il modo più semplice è partecipare ai nostri eventi!
      </PerfectText>
    </PerfectContainer>
  );
};

const DonationInfoModalMigrated: React.FC<DonationInfoModalProps> = ({
  visible,
  onClose,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { t } = useTranslation();

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  return (
    <PerfectModal
      visible={visible}
      onRequestClose={handleClose}
      size="small"
      backgroundColor="transparent"
      padding={0}
    >
      <PerfectContainer style={modalStyles.transparentContainer}>
        <LinearGradient
          colors={[
            Colors.primary[500],
            Colors.primary[600],
            Colors.primary[700],
          ]}
          style={modalStyles.modalGradientBorder}
        >
          <ModalContent handleClose={handleClose} />
        </LinearGradient>
      </PerfectContainer>
    </PerfectModal>
  );
};

export default DonationInfoModalMigrated;
export { DonationInfoModalMigrated };
