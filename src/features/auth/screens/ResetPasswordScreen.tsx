import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthBackDisabledContext } from '../components/AuthBackButton';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthSubmitError } from '../components/AuthSubmitError';
import { AuthRetry } from '../components/AuthRetry';
import { useAuthError } from '../hooks/useAuthError';
import { announceBlockingMessage } from '../utils/announceFieldError';
import { PerfectText } from '@/components/ui';
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
  const inCancello = useContext(AuthBackDisabledContext);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwdErr, setPwdErr] = useState<string | undefined>();
  const [confirmErr, setConfirmErr] = useState<string | undefined>();
  const {
    error: submitError,
    setError: setSubmitError,
    showError,
    offline,
  } = useAuthError();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitAttempt(attempt => attempt + 1);
    setSubmitError(null);
    const p = validatePassword(password);
    const pwdMsg = p ? t(`auth.errors.${p}`) : undefined;
    const confirmMsg =
      password !== confirm ? t('auth.errors.password_mismatch') : undefined;
    setPwdErr(pwdMsg);
    setConfirmErr(confirmMsg);
    if (announceBlockingMessage([pwdMsg, confirmMsg])) return;

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) showError(error);
      else setDone(true);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [password, confirm, updatePassword, t, setSubmitError, showError]);

  const handleSubmit = useCallback((): void => {
    if (submitting.current) return;
    submitting.current = true;
    void onSubmit().finally(() => {
      submitting.current = false;
    });
  }, [onSubmit]);

  /**
   * Dove porta «Continua» dopo che la password è stata cambiata, e «Annulla» prima,
   * dentro il cancello (C88): lì indietro e tasto di sistema sono spenti (C31), e senza
   * «Annulla» chi apre il link e non vuole cambiare la password resta fermo qui.
   *
   * Questa schermata è montata in DUE alberi: `MainStackNavigator`, dove `Home`
   * esiste, e `ProfileGateNavigator`, che monta ReConsent oppure CompleteProfile,
   * oltre a DeleteAccount e ResetPassword. I due alberi sono alternativi e non hanno un
   * navigator padre (`AppNavigator` monta l'uno o l'altro), quindi da dentro il
   * cancello un `navigate('Home')` non veniva gestito da nessuno e il pulsante
   * restava inerte — proprio nel caso per cui la rotta è stata messa nel cancello:
   * il link di recupero che arriva da fuori. La persona aveva la password nuova e
   * restava ferma finché non chiudeva l'app a mano.
   *
   * Si interroga il navigator su quali rotte esistono davvero, invece di presumere
   * l'albero: così la schermata resta valida se un domani viene montata altrove. Vale
   * anche quando il link è di un altro account: il cancello si rimonta con le rotte
   * della sessione attiva, e `popTo` aggiunge la radice se non è nella cronologia.
   */
  const goAvanti = useCallback((): void => {
    const rotteDisponibili = navigation.getState()?.routeNames ?? [];

    if (rotteDisponibili.includes('Home')) {
      navigation.popTo('Home');
      return;
    }
    if (rotteDisponibili.includes('ReConsent')) {
      navigation.popTo('ReConsent');
      return;
    }
    if (rotteDisponibili.includes('CompleteProfile')) {
      navigation.popTo('CompleteProfile');
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
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <AuthInput
            label={t('auth.reset.confirmPassword')}
            value={confirm}
            onChangeText={setConfirm}
            error={confirmErr}
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
          {submitError ? (
            <AuthSubmitError
              message={submitError}
              attempt={submitAttempt}
              style={styles.error}
            />
          ) : null}
          <AuthButton
            label={t('auth.reset.submit')}
            onPress={handleSubmit}
            loading={loading}
          />
          <AuthRetry
            visible={offline}
            onPress={handleSubmit}
            loading={loading}
          />
          {inCancello ? (
            <AuthButton
              label={t('common.cancel')}
              onPress={goAvanti}
              variant="link"
            />
          ) : null}
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
