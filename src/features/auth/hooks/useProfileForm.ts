import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import {
  validateProfileForm,
  type ProfileErrors,
} from '@/shared/auth/validation';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Logica del completamento profilo post-social: stato, validazione condivisa
 * (validateProfileForm), ref per la navigazione campo→campo, upsert + consenso GDPR.
 */
export const useProfileForm = () => {
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
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const clearError = useCallback(
    (key: keyof ProfileErrors): void =>
      setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev)),
    []
  );

  const onChange = useMemo(
    () => ({
      firstName: (v: string): void => {
        setFirstName(v);
        clearError('firstName');
      },
      lastName: (v: string): void => {
        setLastName(v);
        clearError('lastName');
      },
      phone: (v: string): void => {
        setPhone(v);
        clearError('phone');
      },
      city: (v: string): void => {
        setCity(v);
        // Testo libero: la provincia derivata non è più garantita coerente → azzera.
        setProvince('');
        clearError('city');
        clearError('province');
      },
      birthDate: (v: string): void => {
        setBirthDate(v);
        clearError('birthDate');
      },
    }),
    [clearError]
  );

  const focusNext = useMemo(
    () => ({
      lastName: (): void => lastNameRef.current?.focus(),
      phone: (): void => phoneRef.current?.focus(),
    }),
    []
  );

  // Selezione di un comune dall'autocomplete: città + provincia (sigla) coerenti.
  const selectComune = useCallback(
    (cityName: string, provinceSigla: string): void => {
      setCity(cityName);
      setProvince(provinceSigla);
      clearError('city');
      clearError('province');
    },
    [clearError]
  );

  const togglePrivacy = useCallback((): void => {
    setPrivacyConsent(v => !v);
    clearError('privacyConsent');
  }, [clearError]);

  const submit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const found = validateProfileForm({
      firstName,
      lastName,
      phone,
      city,
      province,
      birthDate,
      privacyConsent,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const userId = session?.user.id;
    if (!userId) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    setLoading(true);
    // S10: upsert dei soli campi anagrafici + privacy_consent_at. NON ri-stampiamo
    // marketing_consent: la verità sta nel ledger consent_events; riscriverla a `false`
    // qui azzererebbe un eventuale consenso marketing già concesso.
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
    // GDPR Art.7: registra il consenso privacy nel ledger (sessione attiva → RLS ok).
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
    void submit();
  }, [submit]);

  return {
    values: {
      firstName,
      lastName,
      phone,
      city,
      province,
      birthDate,
      privacyConsent,
    },
    errors,
    refs: { lastNameRef, phoneRef },
    onChange,
    focusNext,
    selectComune,
    togglePrivacy,
    submitError,
    loading,
    handleSubmit,
  };
};
