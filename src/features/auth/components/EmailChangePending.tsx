import React from 'react';
import { StyleSheet, View } from 'react-native';

import { EmailResendControl } from './EmailResendControl';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface EmailChangePendingProps {
  /** Indirizzo nuovo in attesa di conferma (`session.user.new_email`, S8). */
  pendingEmail: string;
  /** Da `useEmailChangeResend` della schermata, che fa partire l'attesa anche al salvataggio. */
  until: number;
  resend: () => Promise<{ error: unknown }>;
}

/** Banner del cambio email in attesa con «Rimanda il link» (S8, C87). */
export const EmailChangePending: React.FC<EmailChangePendingProps> = ({
  pendingEmail,
  until,
  resend,
}) => {
  const { t } = useTranslation();
  const colors = useThemeColors();
  return (
    <View style={styles.wrap}>
      <PerfectText size={14} lines={3} style={{ color: colors.neutral[600] }}>
        {t('auth.edit.emailPending', { email: pendingEmail })}
      </PerfectText>
      <EmailResendControl
        until={until}
        resend={resend}
        submitLabel={t('auth.edit.resendLink')}
        sentText={t('auth.edit.resendSent')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginTop: PerfectSpacing.xs,
  },
});
