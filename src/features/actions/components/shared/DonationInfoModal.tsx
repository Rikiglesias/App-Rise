import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Modal } from 'react-native';

import {
  PerfectIcon,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';
import {
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
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface DonationInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

interface ModalContentProps {
  handleClose: () => Promise<void>;
  t: (key: string) => string;
}

const createModalStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.neutral[0], // superficie modale (adattiva)
      borderRadius: BorderRadius.xl,
      borderWidth: scale(3),
      borderColor: colors.primary[500],
      overflow: 'hidden',
      padding: PerfectSpacing.lg,
      ...Shadows.lg,
      width: '99%',
      maxHeight: '98%',
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
      backgroundColor: colors.neutral[900],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: scale(2),
      borderColor: colors.neutral[0],
      ...Shadows.md,
    },
    centeredTitleContainer: {
      alignItems: 'center',
      marginBottom: scale(20),
    },
    centeredTitle: {
      fontWeight: Typography.weights.black,
      color: colors.neutral[900],
      textAlign: 'center',
      letterSpacing: scale(-0.8),
    },
    titleUnderline: {
      width: scale(80),
      height: scale(3),
      backgroundColor: colors.primary[500],
      borderRadius: scale(2),
      marginTop: PerfectSpacing.sm,
      alignSelf: 'center',
    },
    modalSectionTitle: {
      fontWeight: Typography.weights.black,
      color: colors.neutral[900],
    },
    modalText: {
      fontWeight: Typography.weights.medium,
      color: colors.neutral[900],
      marginBottom: PerfectSpacing.base,
    },
    highlightText: {
      fontWeight: Typography.weights.bold,
      color: colors.primary[500],
      textAlign: 'center',
      marginTop: PerfectSpacing.md,
      paddingVertical: PerfectSpacing.md,
      paddingHorizontal: PerfectSpacing.base,
      backgroundColor: colors.primary[50],
      borderRadius: BorderRadius.lg,
      letterSpacing: scale(-0.3),
    },
  });

const ModalContent: React.FC<ModalContentProps> = ({ handleClose, t }) => {
  const colors = useThemeColors();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
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
          <PerfectIcon name="close" size={22} color={colors.neutral[0]} />
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

      <PerfectText size={15} lines={5} style={modalStyles.modalText}>
        <PerfectText size={15} lines={1} style={modalStyles.modalSectionTitle}>
          {t('actions.donationMonetary')}
        </PerfectText>{' '}
        {t('actions.donationMonetaryText')}
      </PerfectText>

      <PerfectText size={15} lines={5} style={modalStyles.modalText}>
        <PerfectText size={15} lines={1} style={modalStyles.modalSectionTitle}>
          {t('actions.donationShopping')}
        </PerfectText>{' '}
        {t('actions.donationShoppingText')}
      </PerfectText>

      <PerfectText size={15} lines={5} style={modalStyles.modalText}>
        <PerfectText size={15} lines={1} style={modalStyles.modalSectionTitle}>
          {t('actions.donationGiftCard')}
        </PerfectText>{' '}
        {t('actions.donationGiftCardText')}
      </PerfectText>

      <PerfectText size={14} lines={3} style={modalStyles.highlightText}>
        {t('actions.donationEvents')}
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
  const colors = useThemeColors();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);

  const handleClose = useCallback(async () => {
    await triggerHaptic('light');
    onClose();
  }, [onClose, triggerHaptic]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <PlatformTouchable
        style={modalStyles.modalOverlay}
        onPress={handleClose}
        activeOpacity={1}
      >
        <PlatformTouchable activeOpacity={1}>
          <ModalContent handleClose={handleClose} t={t} />
        </PlatformTouchable>
      </PlatformTouchable>
    </Modal>
  );
};

export default DonationInfoModalMigrated;
export { DonationInfoModalMigrated };
