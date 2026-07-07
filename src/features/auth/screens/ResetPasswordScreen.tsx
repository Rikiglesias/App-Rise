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
import { validatePassword } from '@/shared/auth/validation';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Schermata "Imposta nuova password": raggiunta via deep link di recovery
 * (la sessione è già stata stabilita da useAuthDeepLink). Salva la nuova
 * password con `updatePassword`; l'utente resta loggato e torna all'app.
 */
export const ResetPasswordScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwdErr, setPwdErr] = useState<string | undefined>();
  const [confirmErr, setConfirmErr] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const p = validatePassword(password);
    setPwdErr(p ? t(`auth.errors.${p}`) : undefined);
    const mismatch = password !== confirm;
    setConfirmErr(mismatch ? t('auth.errors.password_mismatch') : undefined);
    if (p || mismatch) return;

    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) setSubmitError(t('auth.errors.generic'));
    else setDone(true);
  }, [password, confirm, updatePassword, t]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);

  const goHome = useCallback(
    (): void => navigation.navigate('Home'),
    [navigation]
  );

  return (
    <AuthScreen title={t('auth.reset.title')}>
      {done ? (
        <>
          <PerfectText size={16} lines={3} style={styles.sent}>
            {t('auth.reset.success')}
          </PerfectText>
          <AuthButton label={t('auth.reset.continue')} onPress={goHome} />
        </>
      ) : (
        <>
          <AuthInput
            label={t('auth.reset.newPassword')}
            value={password}
            onChangeText={setPassword}
            error={pwdErr}
            secureTextEntry
            autoCapitalize="none"
          />
          <AuthInput
            label={t('auth.reset.confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            error={confirmErr}
            secureTextEntry
            autoCapitalize="none"
          />
          <FormError message={submitError} style={styles.error} />
          <AuthButton
            label={t('auth.reset.submit')}
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
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
