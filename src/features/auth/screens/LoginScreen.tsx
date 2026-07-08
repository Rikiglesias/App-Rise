import React, { useCallback, useMemo, useRef, useState } from 'react';
import { StyleSheet, type TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { SocialButtons } from '../components/SocialButtons';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { validateEmail, validateRequired } from '@/shared/auth/validation';
import { mapAuthError } from '@/shared/auth/authErrors';
import type { RootStackNavigationProp } from '@/navigation/types';

export const LoginScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailErr, setEmailErr] = useState<string | undefined>();
  const [pwdErr, setPwdErr] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    setSubmitError(null);
    const e = validateEmail(email);
    const p = validateRequired(password);
    setEmailErr(e ? t(`auth.errors.${e}`) : undefined);
    setPwdErr(p ? t(`auth.errors.${p}`) : undefined);
    if (e || p) return;

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);
    // Post-login non si naviga: il cambio di status nell'AuthContext
    // ri-renderizza ProfileScreen verso il profilo da solo.
    if (error) setSubmitError(t(`auth.errors.${mapAuthError(error)}`));
  }, [email, password, signIn, t]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);
  const goToForgot = useCallback(
    (): void => navigation.navigate('ForgotPassword'),
    [navigation]
  );
  const goToSignUp = useCallback(
    (): void => navigation.navigate('SignUp'),
    [navigation]
  );
  const handleSocialError = useCallback(
    (message: string): void =>
      setSocialError(t(`auth.errors.${mapAuthError(message)}`)),
    [t]
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
      <FormError message={submitError} style={styles.error} />
      <AuthButton
        label={t('auth.login.submit')}
        onPress={handleSubmit}
        loading={loading}
      />
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
      <SocialButtons onError={handleSocialError} />
      <FormError message={socialError} style={styles.error} />
    </AuthScreen>
  );
};

const createStyles = () =>
  StyleSheet.create({
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
