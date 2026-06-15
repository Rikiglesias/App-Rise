import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthButton } from '../components/AuthButton';
import { PerfectText, PlatformTouchable, PerfectIcon } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import {
  validateSignUpForm,
  type SignUpErrors,
} from '@/shared/auth/validation';
import { mapAuthError } from '@/shared/auth/authErrors';
import type { RootStackNavigationProp } from '@/navigation/types';

export const SignUpScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('+39');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const found = validateSignUpForm({
      firstName,
      lastName,
      email,
      password,
      phone,
      city,
      province,
      birthDate,
      privacyConsent,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const { error } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      province: province.trim(),
      birth_date: birthDate.trim(),
      privacy_consent: privacyConsent,
      marketing_consent: marketingConsent,
    });
    setLoading(false);
    if (error) setSubmitError(t(`auth.errors.${mapAuthError(error)}`));
    else setDone(true);
  }, [
    firstName,
    lastName,
    email,
    password,
    phone,
    city,
    province,
    birthDate,
    privacyConsent,
    marketingConsent,
    signUp,
    t,
  ]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);
  const goToLogin = useCallback(
    (): void => navigation.navigate('Login'),
    [navigation]
  );
  const togglePrivacy = useCallback((): void => setPrivacyConsent(v => !v), []);
  const toggleMarketing = useCallback(
    (): void => setMarketingConsent(v => !v),
    []
  );

  if (done) {
    return (
      <AuthScreen title={t('auth.signup.title')}>
        <PerfectText size={16} lines={4} style={styles.doneText}>
          {t('auth.signup.checkEmail')}
        </PerfectText>
        <AuthButton
          label={t('auth.login.submit')}
          variant="link"
          onPress={goToLogin}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t('auth.signup.title')}>
      <AuthInput
        label={t('auth.signup.firstName')}
        value={firstName}
        onChangeText={setFirstName}
        error={err(errors.firstName)}
        autoCapitalize="words"
      />
      <AuthInput
        label={t('auth.signup.lastName')}
        value={lastName}
        onChangeText={setLastName}
        error={err(errors.lastName)}
        autoCapitalize="words"
      />
      <AuthInput
        label={t('auth.signup.email')}
        value={email}
        onChangeText={setEmail}
        error={err(errors.email)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <AuthInput
        label={t('auth.signup.password')}
        value={password}
        onChangeText={setPassword}
        error={err(errors.password)}
        secureTextEntry
        autoCapitalize="none"
      />
      <AuthInput
        label={t('auth.signup.phone')}
        value={phone}
        onChangeText={setPhone}
        error={err(errors.phone)}
        keyboardType="phone-pad"
      />
      <AuthInput
        label={t('auth.signup.city')}
        value={city}
        onChangeText={setCity}
        error={err(errors.city)}
        autoCapitalize="words"
      />
      <AuthInput
        label={t('auth.signup.province')}
        value={province}
        onChangeText={setProvince}
        error={err(errors.province)}
        autoCapitalize="characters"
      />
      <AuthInput
        label={t('auth.signup.birthDate')}
        value={birthDate}
        onChangeText={setBirthDate}
        error={err(errors.birthDate)}
        placeholder="2000-01-31"
        autoCapitalize="none"
      />

      <PlatformTouchable
        onPress={togglePrivacy}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: privacyConsent }}
        style={styles.consentRow}
      >
        <PerfectIcon
          name={privacyConsent ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={privacyConsent ? Colors.primary[600] : colors.neutral[400]}
        />
        <PerfectText size={14} lines={2} style={styles.consentText}>
          {t('auth.signup.privacyConsent')}
        </PerfectText>
      </PlatformTouchable>
      {errors.privacyConsent ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {err(errors.privacyConsent)}
        </PerfectText>
      ) : null}

      <PlatformTouchable
        onPress={toggleMarketing}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: marketingConsent }}
        style={styles.consentRow}
      >
        <PerfectIcon
          name={marketingConsent ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={marketingConsent ? Colors.primary[600] : colors.neutral[400]}
        />
        <PerfectText size={14} lines={2} style={styles.consentText}>
          {t('auth.signup.marketingConsent')}
        </PerfectText>
      </PlatformTouchable>

      {submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {submitError}
        </PerfectText>
      ) : null}

      <AuthButton
        label={t('auth.signup.submit')}
        onPress={handleSubmit}
        loading={loading}
      />
      <AuthButton
        label={t('auth.signup.hasAccount')}
        variant="link"
        onPress={goToLogin}
      />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    consentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: PerfectSpacing.sm,
      marginTop: PerfectSpacing.sm,
    },
    consentText: {
      color: colors.neutral[700],
      flex: 1,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
    doneText: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
  });
