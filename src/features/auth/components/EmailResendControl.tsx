import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';

import { useAuthError } from '../hooks/useAuthError';
import { AuthButton } from './AuthButton';
import { AuthSubmitError } from './AuthSubmitError';
import { PerfectText } from '@/components/ui';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface EmailResendControlProps {
  /** Istante (ms) prima del quale un nuovo invio non parte; 0 = nessuna attesa. */
  until: number;
  resend: () => Promise<{ error: unknown }>;
  submitLabel: string;
  /** Mostrato solo dopo una risposta senza errore. */
  sentText: string;
}

/**
 * Pulsante di rinvio di una mail dell'account con l'attesa a schermo: lo stesso per la
 * conferma della registrazione e per il link del cambio email. L'errore passa da
 * `AuthSubmitError` (C65), annunciato a ogni invio fallito.
 */
export const EmailResendControl: React.FC<EmailResendControlProps> = ({
  until,
  resend,
  submitLabel,
  sentText,
}) => {
  const { t } = useTranslation();
  const { error, setError, showError, offline } = useAuthError();
  const [loading, setLoading] = useState(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [sent, setSent] = useState(false);
  const [now, setNow] = useState(Date.now);
  const busy = useRef(false);
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
    setSubmitAttempt(attempt => attempt + 1);
    setLoading(true);
    setSent(false);
    setError(null);
    void resend()
      .then(result => {
        if (result.error) {
          showError(result.error);
          return;
        }
        setSent(true);
        // Su Android lo legge la live region del messaggio, che su iOS non esiste.
        if (Platform.OS === 'ios')
          AccessibilityInfo.announceForAccessibility(sentText);
      })
      .catch(showError)
      .finally(() => {
        busy.current = false;
        setLoading(false);
        setNow(Date.now());
      });
  }, [until, resend, sentText, setError, showError]);

  return (
    <>
      <AuthButton
        label={offline ? t('common.retry') : submitLabel}
        onPress={handleResend}
        loading={loading}
        disabled={seconds > 0}
      />
      {seconds > 0 ? (
        <PerfectText size={14} lines={2} immunity>
          {t('auth.resend.wait', { seconds })}
        </PerfectText>
      ) : null}
      {error ? (
        <AuthSubmitError message={error} attempt={submitAttempt} />
      ) : sent ? (
        <View accessibilityLiveRegion="polite">
          <PerfectText size={14} lines={0} immunity>
            {sentText}
          </PerfectText>
        </View>
      ) : null}
    </>
  );
};
