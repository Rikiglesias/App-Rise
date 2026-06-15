import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

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
import {
  validateEmail,
  validatePhoneIT,
  validateAdult,
  validateRequired,
} from '@/shared/auth/validation';
import type { ProfileEditable } from '@/shared/auth/types';

type Errors = Partial<
  Record<
    'firstName' | 'lastName' | 'phone' | 'city' | 'province' | 'birthDate' | 'email',
    string
  >
>;

/** Rettifica dei dati personali in-app (GDPR Art.16): campi profilo + cambio email. */
export const ProfileEditScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { profile, session, updateProfile, updateEmail } = useAuth();

  const currentEmail = session?.user.email ?? '';
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(profile?.phone ?? '+39');
  const [city, setCity] = useState(profile?.city ?? '');
  const [province, setProvince] = useState(profile?.province ?? '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date ?? '');
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailChanged, setEmailChanged] = useState(false);
  const [loading, setLoading] = useState(false);

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    setSuccess(false);
    const e: Errors = {};
    if (validateRequired(firstName)) e.firstName = 'required';
    if (validateRequired(lastName)) e.lastName = 'required';
    const em = validateEmail(email);
    if (em) e.email = em;
    const p = validatePhoneIT(phone);
    if (p) e.phone = p;
    if (validateRequired(city)) e.city = 'required';
    if (validateRequired(province)) e.province = 'required';
    const a = validateAdult(birthDate);
    if (a) e.birthDate = a;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    // Solo i campi effettivamente cambiati (whitelist a valle in updateProfile).
    const changed: Partial<ProfileEditable> = {};
    if (firstName.trim() !== profile?.first_name) changed.first_name = firstName.trim();
    if (lastName.trim() !== profile?.last_name) changed.last_name = lastName.trim();
    if (phone.trim() !== profile?.phone) changed.phone = phone.trim();
    if (city.trim() !== profile?.city) changed.city = city.trim();
    if (province.trim() !== profile?.province) changed.province = province.trim();
    if (birthDate.trim() !== profile?.birth_date) changed.birth_date = birthDate.trim();

    if (Object.keys(changed).length > 0) {
      const { error } = await updateProfile(changed);
      if (error) {
        setLoading(false);
        setSubmitError(t('auth.edit.error'));
        return;
      }
    }

    const nextEmail = email.trim();
    let didChangeEmail = false;
    if (nextEmail !== currentEmail) {
      const { error } = await updateEmail(nextEmail);
      if (error) {
        setLoading(false);
        setSubmitError(t('auth.edit.error'));
        return;
      }
      didChangeEmail = true;
    }

    setLoading(false);
    setEmailChanged(didChangeEmail);
    setSuccess(true);
  }, [
    firstName,
    lastName,
    email,
    phone,
    city,
    province,
    birthDate,
    profile,
    currentEmail,
    updateProfile,
    updateEmail,
    t,
  ]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);

  return (
    <AuthScreen title={t('auth.edit.title')}>
      <PerfectText size={15} lines={2} style={styles.subtitle}>
        {t('auth.edit.subtitle')}
      </PerfectText>
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
        label={t('auth.edit.email')}
        value={email}
        onChangeText={setEmail}
        error={err(errors.email)}
        keyboardType="email-address"
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

      {submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {submitError}
        </PerfectText>
      ) : null}
      {success ? (
        <PerfectText size={14} lines={3} style={styles.success}>
          {emailChanged ? t('auth.edit.emailNotice') : t('auth.edit.success')}
        </PerfectText>
      ) : null}

      <AuthButton
        label={t('auth.edit.save')}
        onPress={handleSubmit}
        loading={loading}
      />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    subtitle: {
      color: colors.neutral[600],
      marginBottom: PerfectSpacing.lg,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
    success: {
      color: Colors.semantic.success.main,
      marginTop: PerfectSpacing.xs,
    },
  });
