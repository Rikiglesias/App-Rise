import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { validateEmail, validateRequired } from '@/shared/auth/validation';
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
  const [loading, setLoading] = useState(false);

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
    if (error) setSubmitError(t('auth.errors.generic'));
    else navigation.goBack();
  }, [email, password, signIn, t, navigation]);

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

  return (
    <AuthScreen title={t('auth.login.title')}>
      <AuthInput
        label={t('auth.login.email')}
        value={email}
        onChangeText={setEmail}
        error={emailErr}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        label={t('auth.login.password')}
        value={password}
        onChangeText={setPassword}
        error={pwdErr}
        secureTextEntry
        autoCapitalize="none"
      />
      {submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {submitError}
        </PerfectText>
      ) : null}
      <AuthButton
        label={t('auth.login.submit')}
        onPress={handleSubmit}
        loading={loading}
      />
      <AuthButton
        label={t('auth.login.forgotPassword')}
        variant="link"
        onPress={goToForgot}
      />
      <AuthButton
        label={t('auth.login.noAccount')}
        variant="link"
        onPress={goToSignUp}
      />
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
