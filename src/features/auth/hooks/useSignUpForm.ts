import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useNicknameAvailability } from './useNicknameAvailability';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import {
  validateSignUpForm,
  type SignUpErrors,
} from '@/shared/auth/validation';
import { mapAuthError } from '@/shared/auth/authErrors';
import { isNicknameAvailable } from '@/shared/auth/nickname';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Logica del form di registrazione: stato, validazione, ref per la navigazione
 * campo→campo e handler stabili (no arrow inline nei prop JSX). La vista resta pura.
 */
export const useSignUpForm = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { signUp } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('+39');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('IT');
  const [birthDate, setBirthDate] = useState('');
  // Facoltativo (migration 0017): parte vuoto e vuoto può restare. Serve al modulo del
  // partner, non a noi — per questo non entra fra i campi che bloccano il submit.
  const [nickname, setNickname] = useState('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  // Disponibilità del nickname mentre si scrive (migration 0018). Vive QUI e non nella
  // vista perché il submit deve poterla consultare: è la stessa informazione che si
  // mostra sotto il campo e che decide se lasciar partire la registrazione.
  const nicknameCheck = useNicknameAvailability(nickname);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  // Pulisce l'errore di un campo mentre l'utente lo corregge.
  const clearError = useCallback(
    (key: keyof SignUpErrors): void =>
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
      email: (v: string): void => {
        setEmail(v);
        clearError('email');
      },
      password: (v: string): void => {
        setPassword(v);
        clearError('password');
      },
      confirmPassword: (v: string): void => {
        setConfirmPassword(v);
        clearError('confirmPassword');
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
        // La provincia è solo italiana: cambiando paese estero non è più applicabile.
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
      nickname: (v: string): void => {
        setNickname(v);
        clearError('nickname');
      },
    }),
    [clearError]
  );

  const focusNext = useMemo(
    () => ({
      lastName: (): void => lastNameRef.current?.focus(),
      email: (): void => emailRef.current?.focus(),
      password: (): void => passwordRef.current?.focus(),
      confirmPassword: (): void => confirmPasswordRef.current?.focus(),
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
  const toggleMarketing = useCallback(
    (): void => setMarketingConsent(v => !v),
    []
  );

  const submit = useCallback(async (): Promise<void> => {
    setSubmitError(null);
    const found = validateSignUpForm({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      city,
      province,
      country,
      birthDate,
      privacyConsent,
      nickname,
    });
    // NICKNAME GIÀ PRESO — non si prosegue, e non è in contraddizione con «il nickname
    // non deve mai impedire una registrazione» (0017): quella regola protegge il
    // DATABASE dal far cadere l'insert. Qui la persona resta libera di registrarsi in
    // ogni momento — il campo è facoltativo, basta svuotarlo o cambiarlo. Ciò che si
    // impedisce è solo di proseguire CREDENDO di aver preso un nome che invece verrebbe
    // scartato dal trigger, cioè il silenzio che questa fase esiste per togliere.
    // `unknown` NON blocca: se non siamo riusciti a chiedere, la persona va avanti.
    if (nicknameCheck === 'taken') {
      setErrors({ ...found, nickname: 'nickname_taken' });
      return;
    }
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Ricontrollo appena prima di inviare: fra l'ultima digitazione e il tocco sul
    // pulsante possono passare secondi, e in quei secondi il nome può essere stato
    // preso. Non azzera la corsa (fra questa riga e la scrittura resta una finestra di
    // millisecondi, che il trigger gestisce scartando il valore), ma la riduce da
    // «quanto ci mette una persona a compilare un modulo» a «quanto ci mette una
    // richiesta ad andare e tornare».
    // `setLoading` PRIMA del ricontrollo, non dopo: quella chiamata va e torna dalla
    // rete, e senza l'indicatore la persona resta a guardare un pulsante che sembra non
    // aver ricevuto il tocco — e lo preme di nuovo.
    setLoading(true);
    if (nickname.trim() !== '') {
      const libero = await isNicknameAvailable(nickname);
      if (libero === false) {
        setLoading(false);
        setErrors({ ...found, nickname: 'nickname_taken' });
        return;
      }
    }

    // confirmPassword NON viene inviato al backend: serve solo a validare in UI.
    const { error } = await signUp(email.trim(), password, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      province: province.trim(),
      country: country.trim(),
      birth_date: birthDate.trim(),
      privacy_consent: privacyConsent,
      marketing_consent: marketingConsent,
      // `signUp` omette del tutto la chiave se il valore è vuoto: il trigger e il
      // server auth trattano l'assenza come «nessun nickname», mentre una stringa
      // vuota sarebbe rumore nei metadata — che sono superficie visibile al partner.
      nickname: nickname.trim(),
    });
    setLoading(false);
    if (error) setSubmitError(t(`auth.errors.${mapAuthError(error)}`));
    else setDone(true);
  }, [
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    phone,
    city,
    province,
    country,
    birthDate,
    privacyConsent,
    marketingConsent,
    nickname,
    nicknameCheck,
    signUp,
    t,
  ]);

  const handleSubmit = useCallback((): void => {
    void submit();
  }, [submit]);
  // "Ho già un account" / post-signup: torna indietro alla tab Profilo (che
  // mostra LoginScreen come contenuto). Login non è più una Stack.Screen.
  const goToLogin = useCallback((): void => navigation.goBack(), [navigation]);

  return {
    values: {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      phone,
      city,
      province,
      country,
      birthDate,
      nickname,
      privacyConsent,
      marketingConsent,
    },
    errors,
    /** Stato della disponibilità del nickname: la vista lo traduce con `useNicknameHint`. */
    nicknameCheck,
    refs: {
      lastNameRef,
      emailRef,
      passwordRef,
      confirmPasswordRef,
      phoneRef,
    },
    onChange,
    focusNext,
    selectComune,
    togglePrivacy,
    toggleMarketing,
    submitError,
    loading,
    done,
    handleSubmit,
    goToLogin,
  };
};
