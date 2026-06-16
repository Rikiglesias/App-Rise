import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { PerfectText, PlatformTouchable, PerfectIcon } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';
import { supabase } from '@/shared/auth/supabaseClient';
import {
  validatePhoneIT,
  validateAdult,
  validateRequired,
} from '@/shared/auth/validation';
import type { RootStackNavigationProp } from '@/navigation/types';

type Errors = Partial<
  Record<
    | 'firstName'
    | 'lastName'
    | 'phone'
    | 'city'
    | 'province'
    | 'birthDate'
    | 'privacy',
    string
  >
>;

/** Step post-social: i provider non danno telefono/città/provincia/data nascita. */
export const CompleteProfileScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { session, refreshProfile, recordConsent } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+39');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  const onSubmit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const e: Errors = {};
    if (validateRequired(firstName)) e.firstName = 'required';
    if (validateRequired(lastName)) e.lastName = 'required';
    const p = validatePhoneIT(phone);
    if (p) e.phone = p;
    if (validateRequired(city)) e.city = 'required';
    if (validateRequired(province)) e.province = 'required';
    const a = validateAdult(birthDate);
    if (a) e.birthDate = a;
    if (!privacyConsent) e.privacy = 'required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    const userId = session?.user.id;
    if (!userId) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    setLoading(true);
    // S10: upsert dei soli campi anagrafici + privacy_consent_at (prima registrazione del
    // consenso privacy per il profilo social). NON ri-stampiamo marketing_consent: la cache
    // è gestita esclusivamente da setMarketingConsent e la verità sta nel ledger consent_events;
    // riscriverla a `false` qui azzererebbe un eventuale consenso marketing già concesso.
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      province: province.trim(),
      birth_date: birthDate.trim(),
      privacy_consent_at: new Date().toISOString(),
    });
    if (error) {
      setLoading(false);
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    // GDPR Art.7: registra il consenso privacy nel ledger (path social, sessione attiva
    // → RLS soddisfatta). Per l'email il consenso lo semina il trigger handle_new_user.
    const { error: consentError } = await recordConsent(
      'privacy_notice',
      'granted'
    );
    setLoading(false);
    if (consentError) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    await refreshProfile();
    navigation.goBack();
  }, [
    firstName,
    lastName,
    phone,
    city,
    province,
    birthDate,
    privacyConsent,
    session,
    refreshProfile,
    recordConsent,
    navigation,
    t,
  ]);

  const handleSubmit = useCallback((): void => {
    void onSubmit();
  }, [onSubmit]);
  const togglePrivacy = useCallback((): void => setPrivacyConsent(v => !v), []);

  return (
    <AuthScreen title={t('auth.completeProfile.title')}>
      <PerfectText size={15} lines={3} style={styles.subtitle}>
        {t('auth.completeProfile.subtitle')}
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
      <AuthDateField
        label={t('auth.signup.birthDate')}
        value={birthDate}
        onChange={setBirthDate}
        error={err(errors.birthDate)}
        placeholder={t('auth.signup.birthDatePlaceholder')}
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
      {errors.privacy ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {err(errors.privacy)}
        </PerfectText>
      ) : null}

      {submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {submitError}
        </PerfectText>
      ) : null}

      <AuthButton
        label={t('auth.completeProfile.submit')}
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
  });
