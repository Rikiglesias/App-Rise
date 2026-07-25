import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Modal } from 'react-native';

import {
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
import { scale } from '@/shared/constants/perfectScale';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Schermata onesta pre-redirect verso Let's Donation (goal partner-identita, F1.7d).
 * Avverte che shop/gift card/eventi sono su una piattaforma partner dove serve un
 * account separato — trasparenza (Art.13/14), NON un consenso: mostrata UNA volta
 * per utente (il flag lo gestisce usePartnerExit). "Continua" prosegue l'uscita
 * (col rise_ref), "Annulla" la ferma.
 */

interface PartnerDisclosureModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: PerfectSpacing.lg,
    },
    content: {
      backgroundColor: colors.neutral[0],
      borderRadius: BorderRadius.xl,
      borderWidth: scale(3),
      borderColor: colors.primary[500],
      padding: PerfectSpacing.lg,
      ...Shadows.lg,
      width: '100%',
      maxWidth: scale(420),
    },
    title: {
      fontWeight: Typography.weights.black,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: PerfectSpacing.base,
      letterSpacing: scale(-0.6),
    },
    body: {
      fontWeight: Typography.weights.medium,
      color: colors.neutral[900],
      marginBottom: PerfectSpacing.lg,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    button: {
      flex: 1,
      paddingVertical: PerfectSpacing.base,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelButton: {
      backgroundColor: colors.neutral[100],
      marginRight: PerfectSpacing.sm,
    },
    confirmButton: {
      backgroundColor: colors.primary[500],
      marginLeft: PerfectSpacing.sm,
    },
    cancelText: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[900],
    },
    confirmText: {
      fontWeight: Typography.weights.bold,
      color: colors.neutral[0],
    },
  });

const PartnerDisclosureModal: React.FC<PartnerDisclosureModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleConfirm = useCallback(async () => {
    await triggerHaptic('medium');
    onConfirm();
  }, [onConfirm, triggerHaptic]);

  const handleCancel = useCallback(async () => {
    await triggerHaptic('light');
    onCancel();
  }, [onCancel, triggerHaptic]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
      statusBarTranslucent
    >
      <PlatformTouchable
        style={styles.overlay}
        onPress={handleCancel}
        activeOpacity={1}
      >
        <PlatformTouchable activeOpacity={1}>
          <PerfectContainer
            style={styles.content}
            testID="partner-disclosure-content"
          >
            <PerfectText size={22} lines={2} style={styles.title}>
              {t('partner.disclosureTitle')}
            </PerfectText>
            <PerfectText size={15} lines={12} style={styles.body}>
              {t('partner.disclosureBody')}
            </PerfectText>
            <PerfectContainer style={styles.buttonRow}>
              <PlatformTouchable
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={t('partner.disclosureCancel')}
                testID="partner-disclosure-cancel"
              >
                <PerfectText size={15} lines={1} style={styles.cancelText}>
                  {t('partner.disclosureCancel')}
                </PerfectText>
              </PlatformTouchable>
              <PlatformTouchable
                style={[styles.button, styles.confirmButton]}
                onPress={handleConfirm}
                accessibilityRole="button"
                accessibilityLabel={t('partner.disclosureContinue')}
                testID="partner-disclosure-confirm"
              >
                <PerfectText size={15} lines={1} style={styles.confirmText}>
                  {t('partner.disclosureContinue')}
                </PerfectText>
              </PlatformTouchable>
            </PerfectContainer>
          </PerfectContainer>
        </PlatformTouchable>
      </PlatformTouchable>
    </Modal>
  );
};

export default PartnerDisclosureModal;
export { PartnerDisclosureModal };
