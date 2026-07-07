import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';

/**
 * Re-consenso al cambio materiale dell'informativa (GDPR Art.7, EDPB §110).
 * Mostrato inline come gate dell'area donatori quando `needsReConsent` è true.
 */
export const ReConsentScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { acceptCurrentPolicy } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
      <AuthButton
        label={t('auth.consents.reconsentAccept')}
        onPress={handleAccept}
        loading={loading}
      />
      <FormError message={error} style={styles.error} />
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
