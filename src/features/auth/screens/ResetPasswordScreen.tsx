import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
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

  /**
   * Dove porta «Continua» dopo che la password è stata cambiata.
   *
   * Questa schermata è montata in DUE alberi: `MainStackNavigator`, dove `Home`
   * esiste, e `ProfileGateNavigator`, che monta soltanto CompleteProfile,
   * DeleteAccount e ResetPassword. I due alberi sono alternativi e non hanno un
   * navigator padre (`AppNavigator` monta l'uno o l'altro), quindi da dentro il
   * cancello un `navigate('Home')` non veniva gestito da nessuno e il pulsante
   * restava inerte — proprio nel caso per cui la rotta è stata messa nel cancello:
   * il link di recupero che arriva da fuori. La persona aveva la password nuova e
   * restava ferma finché non chiudeva l'app a mano.
   *
   * Si interroga il navigator su quali rotte esistono davvero, invece di presumere
   * l'albero: così la schermata resta valida se un domani viene montata altrove.
   */
  const goAvanti = useCallback((): void => {
    const rotteDisponibili = navigation.getState()?.routeNames ?? [];

    if (rotteDisponibili.includes('Home')) {
      navigation.navigate('Home');
      return;
    }
    if (rotteDisponibili.includes('CompleteProfile')) {
      navigation.navigate('CompleteProfile');
      return;
    }
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation]);

  return (
    <AuthScreen title={t('auth.reset.title')}>
      {done ? (
        <>
          <PerfectText size={16} lines={3} style={styles.sent}>
            {t('auth.reset.success')}
          </PerfectText>
          <AuthButton label={t('auth.reset.continue')} onPress={goAvanti} />
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
          {submitError ? (
            <PerfectText size={14} lines={2} style={styles.error}>
              {submitError}
            </PerfectText>
          ) : null}
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
