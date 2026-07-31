import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useNicknameAvailability } from './useNicknameAvailability';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { supabase } from '@/shared/auth/supabaseClient';
import {
  validateProfileForm,
  type ProfileErrors,
} from '@/shared/auth/validation';
import {
  missingProfileFields,
  PROFILE_FIELD_LABELS,
} from '@/shared/auth/profileCompletion';
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';
import { syncDisplayNameClaim } from '@/shared/auth/displayName';
import { isNicknameConflict, syncNicknameClaim } from '@/shared/auth/nickname';
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
  // Nickname (0017): facoltativo, e `null` in colonna significa «non ne ho uno» — nel
  // form si rappresenta come stringa vuota, riconvertita in `null` prima di scrivere
  // (la stringa vuota violerebbe il CHECK `nickname_forma` e farebbe fallire l'INTERO
  // salvataggio, cioè anche i campi obbligatori appena compilati).
  // Il campo vive QUI e non solo nella registrazione email/password perché questa è
  // l'altra schermata in cui un profilo NASCE: senza, chi entra con un accesso social
  // non se lo vedrebbe proporre mai.
  const [nickname, setNickname] = useState('');
  // «Toccato» è un FLAG esplicito, come per il telefono e la mail di contatto: qui il
  // campo si riempie DA SOLO col nickname del profilo, e senza il flag quella scrittura
  // verrebbe scambiata per una digitazione — con una domanda al server su un nickname
  // che è già suo, la risposta «occupato» e il salvataggio bloccato addosso a chi non ha
  // toccato niente. Il caso era previsto per iscritto nell'hook prima che esistesse
  // questo campo, ed è coperto da un test che lo riproduce.
  const nicknameTouched = useRef(false);
  // Disponibilità mentre si scrive (0018). Lo stato NON si consuma al volo nella vista:
  // serve anche al salvataggio, che si ferma su «già preso» — altrimenti chi ha appena
  // letto quell'avviso salverebbe lo stesso e riceverebbe il messaggio della CORSA PERSA
  // («un attimo prima di te»), falso perché l'app lo sapeva da secondi.
  const nicknameCheck = useNicknameAvailability(
    nickname,
    nicknameTouched.current
  );
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
  // NB (2026-07-26): rimosso il login Apple, un alias di relay non può più entrare
  // da nessuna parte — `isRelay` è oggi una difesa RESIDUA, non un caso vivo. Si
  // tiene perché costa una riga e copre gli account nati prima della rimozione,
  // esattamente come la guardia conservata nel trigger della migration 0011.
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
  // Come `contactEmailTouched`, ma per il telefono: si azzera al cambio di utente,
  // altrimenti quello che ha digitato il precedente bloccherebbe l'idratazione del
  // successivo (la classe di errore che qui ha già morso più volte).
  const phoneTouched = useRef(false);
  useEffect(() => {
    if (formOwner.current !== userId) {
      formOwner.current = userId;
      hydratedForUser.current = null;
      phoneTouched.current = false;
      // Stessa ragione del telefono: se il flag sopravvivesse al cambio di utente, il
      // nickname del nuovo non verrebbe idratato (verrebbe scambiato per una scelta del
      // precedente) — la classe di errore che qui ha già morso più volte.
      nicknameTouched.current = false;
      setFirstName('');
      setLastName('');
      setPhone('+39');
      setCity('');
      setProvince('');
      setCountry('IT');
      setBirthDate('');
      setPrivacyConsent(false);
      setNickname('');
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
    fill(setCity)(profile.city);
    fill(setProvince)(profile.province);
    fill(setBirthDate)(profile.birth_date);
    // Chi arriva qui col profilo già nato (completamento di campi mancanti) può avere
    // un nickname: si ritrova scritto quello che è suo, invece di un campo vuoto che
    // sembra un invito a sceglierne uno nuovo. `fill` non sovrascrive ciò che la
    // persona ha già digitato, e sul nickname importa il doppio: qui l'unico modo di
    // dire «non ne voglio» è lasciarlo vuoto.
    fill(setNickname)(profile.nickname);
    // `phone` parte da '+39', quindi come `country` non è mai «vuoto» e `prev || v`
    // restituirebbe sempre il default. Si scrive solo se il campo è ancora al valore
    // iniziale, cioè se la persona non ha già digitato un numero suo.
    // (Prima non si idratava affatto, perché il campo non mostrava il valore ricevuto:
    // ora `AuthPhoneField` accetta `value`, quindi chi ha già il numero se lo ritrova
    // scritto invece di ridigitarlo.)
    // «Toccato» è un FLAG esplicito, non si deduce dal valore: il campo telefono
    // notifica una stringa vuota anche al montaggio, e dedurre da `''` che la
    // persona non ha scritto nulla ha due facce sbagliate — o si rinuncia a
    // idratare (numero salvato mai mostrato), o si riscrive sopra a chi ha appena
    // svuotato il campo per correggerlo. Stessa protezione che ha la mail di
    // contatto con `contactEmailTouched`.
    if (profile.phone && !phoneTouched.current)
      setPhone(profile.phone as string);
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
        // Solo un cambio NON vuoto conta come «l'ha scritto la persona»: il campo
        // notifica una stringa vuota anche al montaggio, e prenderla per una
        // digitazione bloccherebbe l'idratazione del numero salvato.
        if (v) phoneTouched.current = true;
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
      nickname: (v: string): void => {
        // Da qui in poi il campo è della persona: il controllo di disponibilità può
        // partire. Anche svuotarlo è una sua scelta, quindi il flag si alza comunque —
        // a differenza del telefono, dove la stringa vuota arriva anche dal montaggio.
        nicknameTouched.current = true;
        setNickname(v);
        clearError('nickname');
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
      nickname,
      requirePrivacyConsent,
    });
    // Se sappiamo GIÀ che il nickname è di qualcun altro ci si ferma qui, come fa la
    // registrazione (`useSignUpForm`): senza, il salvataggio partirebbe, l'indice unico
    // lo respingerebbe e la persona leggerebbe il messaggio della corsa persa — falso.
    // `unknown` (rete assente) non ferma nessuno: il controllo è una cortesia, non la
    // difesa, che resta l'indice unico della 0017.
    if (!found.nickname && nicknameCheck === 'taken') {
      found.nickname = 'nickname_taken';
    }
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
    const nextProfile = {
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
      // `'' → null`: la colonna ha il CHECK `nickname_forma` (2-30 caratteri), che una
      // stringa vuota violerebbe — e il rifiuto porterebbe giù l'INTERO upsert, cioè
      // anche i campi obbligatori. `null` è il modo in cui la colonna dice «non ne ho
      // uno», ed è la risposta normale per chi il campo lo salta.
      nickname: nickname.trim() || null,
    };
    // Il cancello del profilo e questo salvataggio giudicano con lo STESSO predicato,
    // e qui lo si applica a ciò che si sta per SCRIVERE, non a ciò che c'è già. È la
    // difesa contro il difetto che Riccardo ha nominato per primo — «che ricompaia ogni
    // volta anche a chi l'aveva già fatto»: se un domani il cancello pretendesse un
    // campo che questo form non raccoglie, senza questo controllo il salvataggio
    // riuscirebbe e la persona si ritroverebbe di nuovo davanti al cancello, per
    // sempre, senza sapere cosa manca. Meglio un errore leggibile PRIMA di scrivere:
    // il dato non è ancora partito e la schermata resta quella giusta per aggiungerlo.
    // La validazione del form NON basta a garantirlo: sono due elenchi di campi con due
    // scopi (forma dei valori vs completezza del profilo), ed è la loro divergenza
    // silenziosa il bug — per questo il controllo è qui e non solo nei test.
    const stillMissing = missingProfileFields(nextProfile);
    if (stillMissing.length > 0) {
      setLoading(false);
      // I campi vanno NOMINATI, non riassunti in «compila tutto»: questo errore compare
      // solo quando la validazione del form non ha segnalato niente — cioè la persona
      // non vede nessun campo in rosso e, senza l'elenco, resterebbe davanti a una
      // richiesta che non sa come soddisfare. È lo stesso principio delle vie d'uscita
      // dal cancello: mai lasciare qualcuno bloccato senza dirgli cosa fare.
      setSubmitError(
        t('auth.errors.profileStillIncomplete', {
          fields: stillMissing
            .map(field => t(PROFILE_FIELD_LABELS[field]))
            .join(', '),
        })
      );
      return;
    }
    const { error } = await supabase.from('profiles').upsert(nextProfile);
    if (error) {
      setLoading(false);
      // LA CORSA PERSA: fra il controllo di disponibilità e questo salvataggio qualcun
      // altro ha preso lo stesso nickname. È raro, ma l'errore generico manderebbe la
      // persona a ricontrollare nome, telefono e città mentre il campo da cambiare è
      // uno solo — e glielo possiamo dire. Il messaggio va SUL CAMPO.
      if (isNicknameConflict(error.message)) {
        setErrors(prev => ({ ...prev, nickname: 'nickname_taken_race' }));
        // E si dice anche che NON È STATO SALVATO NIENTE: l'upsert è uno solo, quindi
        // il rifiuto dell'indice porta giù tutto il resto del modulo. Senza, la persona
        // uscirebbe da qui convinta che i suoi dati siano stati scritti.
        setSubmitError(t('auth.edit.nothingSaved'));
        return;
      }
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
    // Stessa proiezione per il nickname → `user_metadata.preferred_username`, da cui il
    // server auth costruisce il claim omonimo. Non solleva e non blocca: se fallisce, il
    // profilo È salvato e si perde solo l'allineamento del claim.
    // NB: **dalla 0020, viva in produzione dal 2026-07-31**, questa chiamata è una
    // comodità e non la difesa — il claim lo derivano da `profiles` due trigger nel
    // database, che riallineano subito dopo. Resta perché non fa danno e perché toglierla
    // renderebbe il claim dipendente da un meccanismo solo invece che da due.
    await syncNicknameClaim(nickname);
    await refreshProfile();
    // Dietro il cancello questa è l'unica schermata dello stack: non c'è un «indietro»
    // dove tornare, e l'app riappare da sé appena il profilo risulta completo (le rotte
    // normali rientrano nell'albero). Chiamare `goBack` a vuoto non romperebbe nulla, ma
    // dichiarare la condizione dice quale dei due percorsi si sta chiudendo.
    if (navigation.canGoBack()) navigation.goBack();
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
    nickname,
    // Senza questa dipendenza il salvataggio leggerebbe lo stato di disponibilità
    // CONGELATO alla creazione del callback (quasi sempre `idle`), e il blocco su «già
    // preso» guarderebbe un verdetto vecchio. È il difetto che nel gemello
    // `ProfileEditScreen` ha preso il linter, non un test.
    nicknameCheck,
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
      nickname,
    },
    /** Stato della disponibilità del nickname: la vista lo traduce con `useNicknameHint`. */
    nicknameCheck,
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
