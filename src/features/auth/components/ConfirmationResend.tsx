import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { useAuthError } from '../hooks/useAuthError';
import { AuthButton } from './AuthButton';
import { PerfectText } from '@/components/ui';
import { useAuth } from '@/shared/auth/AuthContext';
import { useTranslation } from '@/shared/hooks/useTranslation';

/** Stesso rinvio dopo la registrazione e dopo un accesso non confermato. */
export const ConfirmationResend: React.FC<{ email: string }> = ({ email }) => {
  const { t } = useTranslation();
  const { resendConfirmation, confirmationRetryAt } = useAuth();
  const { error, setError, reportError, offline } = useAuthError();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [now, setNow] = useState(Date.now);
  const busy = useRef(false);
  const until = confirmationRetryAt[email.trim().toLowerCase()] ?? 0;
  const seconds = Math.max(0, Math.ceil((until - now) / 1000));

  useEffect(() => {
    if (!until) return;
    setNow(Date.now());
    const interval = setInterval(() => {
      const timestamp = Date.now();
      setNow(timestamp);
      if (timestamp >= until) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [until]);

  const handleResend = useCallback((): void => {
    if (busy.current || Date.now() < until) return;
    busy.current = true;
    setLoading(true);
    setSent(false);
    setError(null);
    void resendConfirmation(email)
      .then(result => {
        if (result.error) reportError(result.error);
        else setSent(true);
      })
      .catch(reportError)
      .finally(() => {
        busy.current = false;
        setLoading(false);
        setNow(Date.now());
      });
  }, [email, until, resendConfirmation, setError, reportError]);

  return (
    <>
      <AuthButton
        label={t(offline ? 'common.retry' : 'auth.resend.submit')}
        onPress={handleResend}
        loading={loading}
        disabled={seconds > 0}
      />
      {seconds > 0 ? (
        <PerfectText size={14} lines={2} immunity>
          {t('auth.resend.wait', { seconds })}
        </PerfectText>
      ) : null}
      {error || sent ? (
        <View accessibilityLiveRegion="polite">
          <PerfectText size={14} lines={3} immunity>
            {error ?? t('auth.resend.sent')}
          </PerfectText>
        </View>
      ) : null}
    </>
  );
};
