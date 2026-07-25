import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const { session, profile, profileLoaded, refreshProfile, recordConsent } =
    useAuth();

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

  // La mail su cui scriviamo alla persona è SEMPRE obbligatoria e sempre visibile
  // (decisione Riccardo 2026-07-25). Prima si chiedeva solo agli account Apple
  // Private Relay; il caso che ha cambiato la regola è l'import delle anagrafiche
  // dal partner: un alias `@privaterelay.appleid.com` non combacia con la mail
  // dell'anagrafica importata, quindi la stessa persona finisce in DUE record che
  // non si riconoscono — storico e consensi divisi in due, e una cancellazione su
  // uno lascia l'altro in piedi. L'alias inoltra, ma muore appena la persona revoca
  // l'inoltro e non serve a nulla fuori dal canale email.
  const accountEmail = session?.user.email;
  const isRelay = useMemo(
    () => isApplePrivateRelayEmail(accountEmail),
    [accountEmail]
  );

  // Se l'account ha già una mail REALE la proponiamo GIÀ SCRITTA: richiederla
  // sarebbe chiedere due volte la stessa cosa, nel punto in cui la gente abbandona.
  // Con l'alias Apple il campo parte VUOTO, perché l'alias non è la risposta.
  // La precompilazione avviene in un effetto e non nell'inizializzatore perché la
  // sessione (e il profilo) possono arrivare dopo il primo render; e si ferma appena
  // la persona scrive, per non sovrascriverle sotto le dita quello che ha digitato.
  const contactEmailTouched = useRef(false);
  const touchedForAccount = useRef<string | undefined>(undefined);
  useEffect(() => {
    // Il «l'ha digitato la persona» vale per QUELL'account. Se cambia l'utente
    // (logout+login: questa schermata è in uno stack unico, non separato per
    // sessione — verificato in AppNavigator), il flag va azzerato: altrimenti il
    // testo scritto dal precedente resterebbe nel form del nuovo e non verrebbe
    // ri-precompilato. È la classe di errore che qui ha già morso cinque volte —
    // un valore che sopravvive al cambio di utente.
    if (touchedForAccount.current !== accountEmail) {
      touchedForAccount.current = accountEmail;
      contactEmailTouched.current = false;
    }
    if (contactEmailTouched.current) return;
    const proposed =
      profile?.contact_email ?? (isRelay ? '' : (accountEmail ?? ''));
    setContactEmail(proposed);
  }, [accountEmail, isRelay, profile?.contact_email]);

  // I campi già noti arrivano GIÀ SCRITTI dal profilo esistente. Senza questa
  // proiezione la schermata riparte dai default anche per chi un profilo ce l'ha, e
  // il danno non è solo l'attrito di ridigitare: `country` parte da `'IT'` e passa la
  // validazione, quindi il salvataggio ITALIANIZZA in silenzio un profilo estero
  // (e con esso la provincia). Gli altri campi vuoti sono bloccati dalla validazione,
  // il paese no — un default che si spaccia per una risposta dell'utente.
  // Si idrata UNA volta per utente: da lì in poi il form è della persona, e un
  // re-render (token rinnovato, refresh del profilo) non deve riscriverle sotto le
  // dita quello che ha appena cambiato.
  // UN SOLO effetto per le due cose (svuotare al cambio utente, idratare dal
  // profilo): separarli li metterebbe in corsa fra loro — l'idratazione girerebbe
  // per prima e scriverebbe nel form del nuovo utente i dati del precedente,
  // marcandolo come «già idratato» e disinnescando lo svuotamento.
  const userId = session?.user.id ?? null;
  const formOwner = useRef<string | null | undefined>(undefined);
  const hydratedForUser = useRef<string | null>(null);
  useEffect(() => {
    if (formOwner.current !== userId) {
      formOwner.current = userId;
      hydratedForUser.current = null;
      setFirstName('');
      setLastName('');
      setPhone('+39');
      setCity('');
      setProvince('');
      setCountry('IT');
      setBirthDate('');
      setPrivacyConsent(false);
    }
    if (hydratedForUser.current === userId) return;
    // Il profilo nel contesto può essere ancora quello di prima (viene sostituito
    // quando la nuova lettura torna): si idrata solo con la riga DI questo utente.
    if (!profile || profile.id !== userId) return;
    hydratedForUser.current = userId;
    // `prev || valore`, non un set secco: la lettura del profilo può tornare MENTRE la
    // persona sta già scrivendo (arrivo diretto, rete lenta), e un set secco le
    // cancellerebbe sotto le dita quello che ha digitato. Si riempie solo ciò che è
    // ancora vuoto. È la stessa protezione che il campo della mail ha col suo flag
    // `contactEmailTouched`, estesa agli altri campi — che ne erano scoperti.
    const fill =
      (set: (u: (prev: string) => string) => void) =>
      (v: string | null): void => {
        if (v) set(prev => prev || v);
      };
    fill(setFirstName)(profile.first_name);
    fill(setLastName)(profile.last_name);
    // `phone` NON si idrata di proposito: `AuthPhoneField` non è controllato (il
    // numero vive nel suo stato interno e al form arriva solo quello che emette).
    // Scriverlo qui creerebbe un valore che il campo non mostra — e il suo effetto
    // di allineamento del prefisso lo azzererebbe al primo cambio di paese. Residuo
    // dichiarato: chi ha già il numero deve ridigitarlo (attrito, non perdita: la
    // validazione blocca il campo vuoto). Si chiude rendendo il campo controllato.
    fill(setCity)(profile.city);
    fill(setProvince)(profile.province);
    fill(setBirthDate)(profile.birth_date);
    // `country` parte da 'IT', quindi non è mai «vuoto» e `prev || v` non basterebbe:
    // qui il valore del profilo deve VINCERE sul default, ed è proprio il caso che
    // rendeva italiano un profilo francese. Si scrive solo se la persona non ha già
    // scelto un paese diverso da quello iniziale.
    if (profile.country)
      setCountry(prev => (prev === 'IT' ? profile.country : prev));
  }, [profile, userId]);

  // Il consenso privacy si chiede solo quando il profilo NASCE. Su un profilo che
  // esiste già fu raccolto alla nascita, e la ri-accettazione di una versione nuova
  // è di `ReConsentScreen`: mostrarlo qui significherebbe pretendere una spunta che
  // il salvataggio poi butta via (né `privacy_consent_at` né `consent_events`).
  // Finché non sappiamo se il profilo esiste (`profileLoaded` false) si chiede: in
  // dubbio si raccoglie un consenso in più, mai uno in meno.
  const requirePrivacyConsent = !profileLoaded || !profile;

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
        contactEmailTouched.current = true;
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
      requirePrivacyConsent,
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
    // Se il profilo non è ancora stato letto, lo si legge ORA: da questa risposta
    // dipende se `privacy_consent_at` viene (ri)scritta e se nel registro Art.7
    // finisce un «granted». Deciderlo su `profile === null` mentre la lettura è in
    // volo significa timbrare come nuovo un consenso vecchio.
    // Limite dichiarato: una lettura fallita per rete è indistinguibile da
    // «assente» (entrambe tornano null) → in quel caso si ricade sul ramo nascita,
    // ma con la rete giù anche l'upsert fallisce e non si scrive nulla.
    const current = profileLoaded ? profile : await refreshProfile();
    const isNewProfile = !current;
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
      // Scritta SEMPRE: è la mail reale con cui riconosciamo la persona (anche
      // nell'anagrafica importata dal partner) e con cui le scriviamo. Per gli
      // account con mail già reale coincide con quella dell'account, e va bene:
      // averla in colonna significa non dipendere dal provider di accesso.
      contact_email: contactEmail.trim(),
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
    // `isRelay` non è più fra le dipendenze: da quando la mail è obbligatoria per
    // tutti, il submit non lo consulta più (serve solo alla UI per il placeholder).
    session,
    profile,
    profileLoaded,
    requirePrivacyConsent,
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
    /** La schermata mostra la sezione consensi solo quando il profilo NASCE qui. */
    requirePrivacyConsent,
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
