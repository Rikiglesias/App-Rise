import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { validateEmail } from '@/shared/auth/validation';

export const ForgotPasswordScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState<string | undefined>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (): Promise<void> => {
    const e = validateEmail(email);
    setEmailErr(e ? t(`auth.errors.${e}`) : undefined);
    if (e) return;
    setLoading(true);
    await resetPassword(email.trim());
    setLoading(false);
    setSent(true);
  }, [email, resetPassword, t]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);

  return (
    <AuthScreen title={t('auth.forgot.title')}>
      {sent ? (
        <PerfectText size={16} lines={4} style={styles.sent}>
          {t('auth.forgot.sent')}
        </PerfectText>
      ) : (
        <>
          <AuthInput
            label={t('auth.forgot.email')}
            value={email}
            onChangeText={setEmail}
            error={emailErr}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AuthButton
            label={t('auth.forgot.submit')}
            onPress={handleSubmit}
            loading={loading}
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
  });
