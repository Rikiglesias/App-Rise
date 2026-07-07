import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthDateField } from '../components/AuthDateField';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';
import {
  validateEmail,
  validatePhoneIT,
  validateAdult,
  validateRequired,
} from '@/shared/auth/validation';
import type { ProfileEditable } from '@/shared/auth/types';

type Errors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'city'
    | 'province'
    | 'country'
    | 'birthDate'
    | 'email',
    string
  >
>;

/** Rettifica dei dati personali in-app (GDPR Art.16): campi profilo + cambio email. */
export const ProfileEditScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { profile, session, updateProfile, updateEmail } = useAuth();

  const currentEmail = session?.user.email ?? '';
  // S8: secure email change → Supabase popola user.new_email finché il cambio non è
  // confermato su entrambe le caselle. Stato derivato dalla session (sopravvive a
  // re-render/ri-apertura), non da un flag locale transitorio.
  const pendingEmail = session?.user.new_email ?? null;
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const [email, setEmail] = useState(currentEmail);
  const [phone, setPhone] = useState(profile?.phone ?? '+39');
  const [city, setCity] = useState(profile?.city ?? '');
  const [province, setProvince] = useState(profile?.province ?? '');
  const [country, setCountry] = useState(profile?.country ?? 'IT');
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
    if (validateRequired(country)) e.country = 'required';
    if (validateRequired(city)) e.city = 'required';
    if (country === 'IT' && validateRequired(province)) e.province = 'required';
    const a = validateAdult(birthDate);
    if (a) e.birthDate = a;
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    // Solo i campi effettivamente cambiati (whitelist a valle in updateProfile).
    const changed: Partial<ProfileEditable> = {};
    if (firstName.trim() !== profile?.first_name)
      changed.first_name = firstName.trim();
    if (lastName.trim() !== profile?.last_name)
      changed.last_name = lastName.trim();
    if (phone.trim() !== profile?.phone) changed.phone = phone.trim();
    if (country.trim() !== (profile?.country ?? 'IT'))
      changed.country = country.trim();
    if (city.trim() !== profile?.city) changed.city = city.trim();
    // Provincia solo italiana: per i paesi esteri = null (coerente con signup e
    // useProfileForm; evita due rappresentazioni di "nessuna provincia" '' vs null).
    const nextProvince = country === 'IT' ? province.trim() : null;
    if (nextProvince !== (profile?.province ?? null))
      changed.province = nextProvince;
    if (birthDate.trim() !== profile?.birth_date)
      changed.birth_date = birthDate.trim();

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
    country,
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

  const handleSelectCountry = useCallback((code: string): void => {
    setCountry(code);
    if (code !== 'IT') setProvince('');
  }, []);
  const handleChangeCity = useCallback(
    (v: string): void => {
      setCity(v);
      if (country === 'IT') setProvince('');
    },
    [country]
  );
  const handleSelectComune = useCallback((c: string, sigla: string): void => {
    setCity(c);
    setProvince(sigla);
  }, []);

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
      <AuthCountryField
        label={t('auth.signup.country')}
        value={country}
        onSelect={handleSelectCountry}
        error={err(errors.country)}
      />
      <AuthCityField
        label={t('auth.signup.city')}
        value={city}
        country={country}
        onChangeCity={handleChangeCity}
        onSelectComune={handleSelectComune}
        error={err(errors.city)}
      />
      {country === 'IT' ? (
        <AuthInput
          label={t('auth.signup.province')}
          value={province}
          error={err(errors.province)}
          editable={false}
          placeholder={t('auth.signup.provincePlaceholder')}
        />
      ) : null}
      <AuthDateField
        label={t('auth.signup.birthDate')}
        value={birthDate}
        onChange={setBirthDate}
        error={err(errors.birthDate)}
        placeholder={t('auth.signup.birthDatePlaceholder')}
      />

      <FormError message={submitError} style={styles.error} />
      {pendingEmail ? (
        <PerfectText size={14} lines={3} style={styles.pending}>
          {t('auth.edit.emailPending', { email: pendingEmail })}
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
    pending: {
      color: colors.neutral[600],
      marginTop: PerfectSpacing.xs,
    },
  });
