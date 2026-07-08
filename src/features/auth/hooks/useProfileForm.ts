import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import { isApplePrivateRelayEmail } from '@/shared/auth/appleRelay';
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
  const { session, refreshProfile } = useAuth();

  // Utente entrato con Apple "Nascondi la mia email" → mail auth = relay: OFFRIAMO (non
  // imponiamo) una mail di contatto reale. Se non la dà, resta la relay (Apple inoltra).
  const isRelayEmail = isApplePrivateRelayEmail(session?.user.email);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+39');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('IT');
  const [birthDate, setBirthDate] = useState('');
  const [contactEmail, setContactEmail] = useState('');
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
      country: (code: string): void => {
        setCountry(code);
        if (code !== 'IT') {
          setProvince('');
          clearError('province');
        }
        clearError('country');
      },
      birthDate: (v: string): void => {
        setBirthDate(v);
        clearError('birthDate');
      },
      contactEmail: (v: string): void => {
        setContactEmail(v);
        clearError('contactEmail');
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
      country,
      birthDate,
      privacyConsent,
      contactEmail,
      isRelayEmail,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const userId = session?.user.id;
    if (!userId) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    setLoading(true);
    // Profilo + prova di consenso privacy (GDPR Art.7) in un'unica transazione server-side
    // (RPC atomica, finding 236/241): elimina lo stato parziale profilo-senza-ledger se un
    // round-trip falliva. NON si tocca marketing_consent: la verità è nel ledger, riscriverla
    // qui azzererebbe un consenso marketing già concesso. La versione policy la timbra il server.
    const { error } = await supabase.rpc('complete_social_profile', {
      p_first_name: firstName.trim(),
      p_last_name: lastName.trim(),
      p_phone: phone.trim(),
      p_city: city.trim(),
      // Provincia solo italiana: null per i paesi esteri (colonna nullable).
      p_province: country === 'IT' ? province.trim() : null,
      p_country: country.trim(),
      p_birth_date: birthDate.trim(),
      // Mail di contatto solo se un utente relay l'ha compilata; '' altrimenti (RPC → nullif → NULL).
      p_contact_email: isRelayEmail ? contactEmail.trim() : '',
    });
    setLoading(false);
    if (error) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    await refreshProfile();
    // Completamento profilo (social 1ª volta) concluso → Home, non indietro alla
    // schermata Profilo: l'utente entra nell'app (requisito nav post-login).
    navigation.navigate('Home');
  }, [
    firstName,
    lastName,
    phone,
    city,
    province,
    country,
    birthDate,
    privacyConsent,
    contactEmail,
    isRelayEmail,
    session,
    refreshProfile,
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
      country,
      birthDate,
      contactEmail,
      privacyConsent,
    },
    /** True se la mail auth è una relay Apple → il form OFFRE il campo mail di contatto (facoltativo). */
    isRelayEmail,
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
