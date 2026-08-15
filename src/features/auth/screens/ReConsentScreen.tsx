import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { RISE_URLS } from '@/shared/constants/urls';

/**
 * Re-consenso al cambio materiale dell'informativa (GDPR Art.7, EDPB §110).
 * Mostrato inline come gate dell'area donatori quando `needsReConsent` è true.
 *
 * La schermata chiede «leggila e accetta»: il modo di leggerla deve esserci
 * davvero, altrimenti l'unica strada praticabile è accettare alla cieca — e un
 * consenso raccolto così non è informato, che è esattamente ciò che l'Art.7
 * pretende. Il link apre l'informativa con lo stesso `openLink` (allowlist di
 * domini + errore visibile) usato dagli altri consensi in fase di iscrizione.
 */
export const ReConsentScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { acceptCurrentPolicy } = useAuth();
  const { openLink, isLoading } = useLinkHandler();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleReadPolicy = useCallback((): void => {
    void openLink(RISE_URLS.privacyPolicy, 'reconsent-privacy');
  }, [openLink]);

  const handleAccept = useCallback((): void => {
    setError(undefined);
    setLoading(true);
    void acceptCurrentPolicy().then(r => {
      setLoading(false);
      if (r.error) setError(t('auth.consents.error'));
    });
  }, [acceptCurrentPolicy, t]);

  return (
    <AuthScreen title={t('auth.consents.reconsentTitle')}>
      <PerfectText size={16} lines={6} style={styles.body}>
        {t('auth.consents.reconsentBody')}
      </PerfectText>
      {/* Prima leggere, poi accettare: l'ordine dei due pulsanti è l'ordine dei
          due gesti che la schermata chiede. `isLoading` è collegato, così il
          tocco dà un riscontro invece di sembrare ignorato mentre il browser
          si apre. */}
      <AuthButton
        label={t('auth.consents.reconsentRead')}
        onPress={handleReadPolicy}
        variant="link"
        loading={isLoading === 'reconsent-privacy'}
      />
      <AuthButton
        label={t('auth.consents.reconsentAccept')}
        onPress={handleAccept}
        loading={loading}
      />
      {error ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    body: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.base,
    },
  });
