import React, { useCallback } from 'react';

import { EmailResendControl } from './EmailResendControl';
import { useAuth } from '@/shared/auth/AuthContext';
import { useTranslation } from '@/shared/hooks/useTranslation';

/** Stesso rinvio dopo la registrazione e dopo un accesso non confermato. */
export const ConfirmationResend: React.FC<{ email: string }> = ({ email }) => {
  const { t } = useTranslation();
  const { resendConfirmation, confirmationRetryAt } = useAuth();
  const until = confirmationRetryAt[email.trim().toLowerCase()] ?? 0;
  const resend = useCallback(
    () => resendConfirmation(email),
    [email, resendConfirmation]
  );

  return (
    <EmailResendControl
      until={until}
      resend={resend}
      submitLabel={t('auth.resend.submit')}
      sentText={t('auth.resend.sent')}
    />
  );
};
