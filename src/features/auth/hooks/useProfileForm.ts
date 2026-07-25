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
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';
import { syncDisplayNameClaim } from '@/shared/auth/displayName';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Logica del completamento profilo post-social: stato, validazione condivisa
 * (validateProfileForm), ref per la navigazione campo→campo, upsert + consenso GDPR.
 */
export const useProfileForm = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { session, profile, refreshProfile, recordConsent } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+39');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('IT');
  const [birthDate, setBirthDate] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // F1.10: se l'account è un Apple Private Relay, l'email vera è nascosta →
  // chiediamo una mail di contatto reale per le comunicazioni. Fuori da quel
  // caso il campo non compare e `contact_email` resta invariato.
  const isRelay = useMemo(
    () => isApplePrivateRelayEmail(session?.user.email),
    [session]
  );

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
      requireContactEmail: isRelay,
    });
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const userId = session?.user.id;
    if (!userId) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    setLoading(true);
    // Due percorsi in una schermata: la NASCITA del profilo (post-social) e il
    // COMPLETAMENTO di un profilo che esiste già ma ha campi mancanti (P2, profilo
    // minimo). La differenza non è cosmetica: alla nascita il consenso privacy si
    // raccoglie e si registra, al completamento **era già stato dato** — riscrivere
    // `privacy_consent_at` a `now()` sposterebbe la data di un consenso vecchio e
    // aggiungerebbe al ledger Art.7 un «granted» che non è mai avvenuto in quel
    // momento. Il registro dei consensi è una prova: non si riscrive per comodità.
    const isNewProfile = !profile;
    // S10: upsert dei soli campi anagrafici. NON ri-stampiamo marketing_consent: la
    // verità sta nel ledger consent_events; riscriverla a `false` qui azzererebbe un
    // eventuale consenso marketing già concesso.
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      // Provincia solo italiana: null per i paesi esteri (colonna nullable).
      province: country === 'IT' ? province.trim() : null,
      country: country.trim(),
      birth_date: birthDate.trim(),
      ...(isNewProfile ? { privacy_consent_at: new Date().toISOString() } : {}),
      // F1.10: scriviamo contact_email SOLO per gli account Apple relay (che
      // l'hanno appena inserita); per gli altri non tocchiamo la colonna.
      ...(isRelay ? { contact_email: contactEmail.trim() } : {}),
    });
    if (error) {
      setLoading(false);
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    // GDPR Art.7: il consenso si registra alla NASCITA del profilo (sessione attiva
    // → RLS ok). Sul completamento no: c'è già, e un secondo «granted» falserebbe il
    // registro.
    const { error: consentError } = isNewProfile
      ? await recordConsent('privacy_notice', 'granted')
      : { error: null };
    setLoading(false);
    if (consentError) {
      setSubmitError(t('auth.errors.generic'));
      return;
    }
    // P1: proietta il nome su user_metadata.name, da cui il server auth costruisce il
    // claim OIDC `name` per i partner. DOPO il consenso (Art.7 ha la priorità: non gli
    // mettiamo davanti una chiamata di rete in più) e con i valori appena scritti.
    await syncDisplayNameClaim(firstName, lastName);
    await refreshProfile();
    navigation.goBack();
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
    isRelay,
    session,
    profile,
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
      country,
      birthDate,
      privacyConsent,
      contactEmail,
    },
    isRelay,
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
