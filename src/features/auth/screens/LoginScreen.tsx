import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, type TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { AuthSubmitError } from '../components/AuthSubmitError';
import { ConfirmationResend } from '../components/ConfirmationResend';
import { AuthRetry } from '../components/AuthRetry';
import { useAuthError } from '../hooks/useAuthError';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useAuth } from '@/shared/auth/AuthContext';
import { SegnalaProblema } from '@/shared/components/SegnalaProblema';
import { validateEmail, validateRequired } from '@/shared/auth/validation';
import type { RootStackNavigationProp } from '@/navigation/types';

export const LoginScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState<string | undefined>();
  const [pwdErr, setPwdErr] = useState<string | undefined>();
  const {
    error: submitError,
    setError: setSubmitError,
    showError,
    offline,
    errorKey,
  } = useAuthError();
  const [confirmationEmail, setConfirmationEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);
  const [submitAttempt, setSubmitAttempt] = useState(0);

  const passwordRef = useRef<TextInput>(null);

  const onChangeEmail = useCallback((v: string): void => {
    setEmail(v);
    setEmailErr(undefined);
  }, []);
  const onChangePassword = useCallback((v: string): void => {
    setPassword(v);
    setPwdErr(undefined);
  }, []);
  const focusPassword = useCallback(
    (): void => passwordRef.current?.focus(),
    []
  );

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitAttempt(attempt => attempt + 1);
    setSubmitError(null);
    const e = validateEmail(email);
    const p = validateRequired(password);
    setEmailErr(e ? t(`auth.errors.${e}`) : undefined);
    setPwdErr(p ? t(`auth.errors.${p}`) : undefined);
    if (e || p) return;

    setLoading(true);
    setConfirmationEmail(email.trim());
    try {
      const { error } = await signIn(email.trim(), password);
      // Post-login non si naviga: il cambio di status nell'AuthContext
      // ri-renderizza ProfileScreen verso il profilo da solo.
      if (error) showError(error);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  }, [email, password, signIn, t, setSubmitError, showError]);

  const handleSubmit = useCallback((): void => {
    if (submitting.current) return;
    submitting.current = true;
    void onSubmit().finally(() => {
      submitting.current = false;
    });
  }, [onSubmit]);
  const goToForgot = useCallback(
    (): void => navigation.navigate('ForgotPassword'),
    [navigation]
  );
  const goToSignUp = useCallback(
    (): void => navigation.navigate('SignUp'),
    [navigation]
  );
  return (
    <AuthScreen
      showLogo={false}
      eyebrow={t('auth.login.title')}
      eyebrowSize={22}
      title={t('auth.login.welcome')}
      titleSize={42}
      verticalCenter
    >
      <AuthInput
        label={t('auth.login.email')}
        value={email}
        onChangeText={onChangeEmail}
        error={emailErr}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        onSubmitEditing={focusPassword}
      />
      <AuthInput
        ref={passwordRef}
        label={t('auth.login.password')}
        value={password}
        onChangeText={onChangePassword}
        error={pwdErr}
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
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
        label={t('auth.login.submit')}
        onPress={handleSubmit}
        loading={loading}
      />
      <AuthRetry visible={offline} onPress={handleSubmit} loading={loading} />
      {errorKey === 'email_not_confirmed' &&
      confirmationEmail === email.trim() ? (
        <ConfirmationResend key={confirmationEmail} email={confirmationEmail} />
      ) : null}
      {/* "Password dimenticata?" = rimando minore (link grigio tenue). "Crea un
          account" = bottone outline (secondary): vuoto col bordo, così è un'azione
          chiara ma visibilmente diversa da "Accedi" (pieno), non un link minuscolo. */}
      <AuthButton
        label={t('auth.login.forgotPassword')}
        variant="linkMuted"
        onPress={goToForgot}
      />
      <AuthButton
        label={t('auth.login.createAccount')}
        variant="secondary"
        onPress={goToSignUp}
      />
      <SegnalaProblema />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    error: {
      color: colors.semantic.error.text,
      marginTop: PerfectSpacing.xs,
    },
  });
