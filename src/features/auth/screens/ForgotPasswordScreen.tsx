import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthRetry } from '../components/AuthRetry';
import { useAuthError } from '../hooks/useAuthError';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { validateEmail } from '@/shared/auth/validation';
import type { RootStackNavigationProp } from '@/navigation/types';

export const ForgotPasswordScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    error: submitError,
    setError: setSubmitError,
    showError,
    offline,
  } = useAuthError('auth.forgot.error');

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const e = validateEmail(email);
    setEmailErr(e ? t(`auth.errors.${e}`) : undefined);
    if (e) return;
    setLoading(true);
    try {
      const { error } = await resetPassword(email.trim());
      if (error) throw error;
      setSent(true);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [email, resetPassword, t, setSubmitError, showError]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);

  // Torna indietro alla schermata che ha aperto il recupero (LoginScreen,
  // contenuto della tab Profilo). Login non è più una Stack.Screen.
  const goToLogin = useCallback((): void => navigation.goBack(), [navigation]);

  return (
    <AuthScreen title={t('auth.forgot.title')}>
      {sent ? (
        <>
          <PerfectText size={16} lines={4} style={styles.sent}>
            {t('auth.forgot.sent')}
          </PerfectText>
          <AuthButton
            label={t('auth.forgot.backToLogin')}
            variant="link"
            onPress={goToLogin}
          />
        </>
      ) : (
        <>
          <AuthInput
            label={t('auth.forgot.email')}
            value={email}
            onChangeText={setEmail}
            error={emailErr}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />
          {submitError ? (
            <PerfectText size={14} lines={2} style={styles.error}>
              {submitError}
            </PerfectText>
          ) : null}
          <AuthButton
            label={t('auth.forgot.submit')}
            onPress={handleSubmit}
            loading={loading}
          />
          <AuthRetry
            visible={offline}
            onPress={handleSubmit}
            loading={loading}
          />
          <AuthButton
            label={t('auth.forgot.backToLogin')}
            variant="link"
            onPress={goToLogin}
          />
        </>
      )}
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    sent: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    error: {
      color: colors.semantic.error.text,
      marginTop: PerfectSpacing.xs,
    },
  });
