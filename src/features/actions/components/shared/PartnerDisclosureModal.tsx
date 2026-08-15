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
 * Schermata onesta pre-redirect verso un partner (goal partner-identita, F1.7d).
 * Trasparenza (Art.13/14), NON un consenso: mostrata UNA volta per utente (il flag
 * lo gestisce usePartnerExit). "Continua" prosegue l'uscita, "Annulla" la ferma.
 *
 * Due varianti, perché i due canali non trasmettono le stesse cose:
 * - `letsdonation` — esce col solo `rise_ref`, un codice che non dice chi sei.
 *   L'avviso parla dell'account separato da creare sulla piattaforma partner.
 * - `donorbox` — l'indirizzo porta NOME, COGNOME ed EMAIL come parametri, e un
 *   indirizzo finisce nella cronologia del browser e nei log di chi lo riceve.
 *   Qui l'avviso deve dire *quali* dati partono, e offrire di proseguire senza:
 *   la precompilazione è una comodità, non un pedaggio per poter donare.
 *   Era il canale SENZA avviso, mentre l'altro — che manda meno — ce l'aveva.
 */

interface PartnerDisclosureModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Default `letsdonation`: la variante storica, per non cambiarne il comportamento. */
  variant?: 'letsdonation' | 'donorbox';
  /**
   * Prosegue SENZA i dati personali nell'indirizzo. Lo passa la variante
   * `donorbox`; che ci siano davvero dati da omettere lo garantisce la
   * VISIBILITÀ del riquadro, perché `donorboxDisclosureVisible` si alza solo
   * quando il prefill non è vuoto (`usePartnerExit`). Se il prop manca, la terza
   * scelta non compare — ed è così che resta fuori dalla variante Let's Donation.
   */
  onConfirmWithoutData?: () => void;
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
    withoutDataButton: {
      marginTop: PerfectSpacing.base,
      alignItems: 'center',
    },
    withoutDataText: {
      fontWeight: Typography.weights.medium,
      color: colors.primary[600],
      textAlign: 'center',
      textDecorationLine: 'underline',
    },
  });

const PartnerDisclosureModal: React.FC<PartnerDisclosureModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  variant = 'letsdonation',
  onConfirmWithoutData,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const isDonorbox = variant === 'donorbox';
  const titleKey = isDonorbox
    ? 'partner.donorboxDisclosureTitle'
    : 'partner.disclosureTitle';
  const bodyKey = isDonorbox
    ? 'partner.donorboxDisclosureBody'
    : 'partner.disclosureBody';

  const handleConfirm = useCallback(async () => {
    await triggerHaptic('medium');
    onConfirm();
  }, [onConfirm, triggerHaptic]);

  const handleCancel = useCallback(async () => {
    await triggerHaptic('light');
    onCancel();
  }, [onCancel, triggerHaptic]);

  const handleConfirmWithoutData = useCallback(async () => {
    await triggerHaptic('light');
    onConfirmWithoutData?.();
  }, [onConfirmWithoutData, triggerHaptic]);

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
              {t(titleKey)}
            </PerfectText>
            <PerfectText size={15} lines={12} style={styles.body}>
              {t(bodyKey)}
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
            {/* Sotto la riga dei due pulsanti e non dentro: tre bersagli affiancati
                in un riquadro stretto diventano tutti piccoli, e questo è il testo
                più lungo dei tre. Compare solo se c'è davvero qualcosa da omettere. */}
            {onConfirmWithoutData ? (
              <PlatformTouchable
                style={styles.withoutDataButton}
                onPress={handleConfirmWithoutData}
                accessibilityRole="button"
                accessibilityLabel={t('partner.donorboxContinueWithoutData')}
                testID="partner-disclosure-without-data"
              >
                <PerfectText size={14} lines={2} style={styles.withoutDataText}>
                  {t('partner.donorboxContinueWithoutData')}
                </PerfectText>
              </PlatformTouchable>
            ) : null}
          </PerfectContainer>
        </PlatformTouchable>
      </PlatformTouchable>
    </Modal>
  );
};

export default PartnerDisclosureModal;
export { PartnerDisclosureModal };
