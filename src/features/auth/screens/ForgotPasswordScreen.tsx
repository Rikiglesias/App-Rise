import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const e = validateEmail(email);
    setEmailErr(e ? t(`auth.errors.${e}`) : undefined);
    if (e) return;
    setLoading(true);
    const { error } = await resetPassword(email.trim());
    setLoading(false);
    // NON mostrare "inviata" su errore reale (rate-limit/rete): false-positive fix.
    if (error) setSubmitError(t('auth.forgot.error'));
    else setSent(true);
  }, [email, resetPassword, t]);

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
          <FormError message={submitError} style={styles.error} />
          <AuthButton
            label={t('auth.forgot.submit')}
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
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
