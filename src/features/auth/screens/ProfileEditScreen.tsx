import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthPhoneField } from '../components/AuthPhoneField';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthButton } from '../components/AuthButton';
import {
  useNicknameAvailability,
  useNicknameHint,
} from '../hooks/useNicknameAvailability';
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
  validateContactEmail,
  validateNickname,
} from '@/shared/auth/validation';
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';
import { isNicknameConflict } from '@/shared/auth/nickname';
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
    | 'email'
    | 'contactEmail'
    | 'nickname',
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
  // Nickname (migration 0017): `null` in colonna significa «non ne ho uno», e nel form
  // si rappresenta come stringa vuota. È l'unico campo che la persona può
  // legittimamente SVUOTARE — `updateProfile` riconverte `'' → null` prima di scrivere,
  // perché la stringa vuota violerebbe il CHECK e farebbe fallire l'INTERA rettifica.
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  // Disponibilità mentre si scrive (0018). L'hook non interroga il server finché il
  // valore resta quello con cui il campo si è aperto: qui il campo nasce PIENO, quindi
  // senza quella guardia partirebbe una richiesta a ogni apertura della schermata.
  // Lo stato NON va consumato al volo dentro `useNicknameHint`: serve anche al
  // salvataggio, sotto. Senza, chi ha appena letto «già di qualcun altro» potrebbe
  // salvare lo stesso e riceverebbe il messaggio della CORSA PERSA («un attimo prima di
  // te») — falso, perché l'app lo sapeva da secondi.
  const nicknameCheck = useNicknameAvailability(nickname);
  const nicknameHint = useNicknameHint(nicknameCheck);
  // La mail di contatto si mostra e si rettifica per TUTTI dal 2026-07-25 (era
  // solo per gli account Apple Private Relay, F1.10). `isRelay` sopravvive per
  // un solo scopo: scegliere il testo-guida del campo (:279), perché a chi
  // nasconde la mail va spiegato PERCHE' gliela chiediamo. Il flag deriva
  // dall'email dell'account (session), non dal campo `email` in editing: un
  // cambio email non-confermato non conta.
  // NB (2026-07-26): con il login Apple rimosso nessun account NUOVO può avere un
  // alias di relay — questo ramo (e il testo-guida che sceglie) resta raggiungibile
  // solo dagli account nati prima. Difesa residua, non un caso vivo.
  const isRelay = useMemo(
    () => isApplePrivateRelayEmail(currentEmail),
    [currentEmail]
  );
  // Qui NON si precompila con la mail dell'account, a differenza del completamento
  // profilo: in questa schermata il campo «Email» dell'account c'è già, e riempirne
  // un secondo con lo stesso indirizzo di nostra iniziativa aggiunge un valore che
  // la persona non ha scritto. Chi ha un profilo nato prima di questa regola la
  // scrive una volta.
  // NB (2026-07-25): per i profili nuovi la colonna arriva comunque piena dal
  // completamento profilo, quindi i due campi possono mostrare lo stesso indirizzo.
  // Non è il caso peggiore, ma la resa va rivista quando coincidono (F-EMAIL.23
  // decide la regola: per gli account con mail già reale `contact_email` resta un
  // recapito, mai la credenziale).
  const [contactEmail, setContactEmail] = useState(
    profile?.contact_email ?? ''
  );
  // Il valore iniziale non basta: dal 2026-07-26 la colonna può cambiare SOTTO la
  // schermata. Il trigger `on_auth_user_email_changed` (migration 0013) riallinea
  // `contact_email` quando la persona conferma il cambio della mail dell'account, e
  // `AuthContext` ricarica il profilo. Senza ri-sincronizzare, lo stato locale resta
  // all'indirizzo VECCHIO: al salvataggio successivo il confronto lo vede «cambiato»
  // e lo rispedisce, annullando il riallineo — cioè riportando la chiave dell'oblio
  // su un indirizzo abbandonato, senza nessun errore. Scenario reale: cambio mail →
  // resto sulla schermata → confermo dalle due caselle → torno e salvo il telefono.
  // Ci si ferma appena la persona scrive, per non sovrascriverle sotto le dita quello
  // che ha digitato: stesso pattern (e stessa ragione) di `useProfileForm.ts`.
  const contactEmailTouched = useRef(false);
  useEffect(() => {
    if (contactEmailTouched.current) return;
    setContactEmail(profile?.contact_email ?? '');
  }, [profile?.contact_email]);
  const onChangeContactEmail = useCallback((value: string): void => {
    contactEmailTouched.current = true;
    setContactEmail(value);
  }, []);
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
    // Mail di contatto: obbligatoria e reale per chi ce l'ha già, e per chi la sta
    // scrivendo ora. NON per chi non l'ha mai avuta.
    // Il motivo è un diritto, non una preferenza: un profilo nato prima che la
    // regola esistesse ha la colonna vuota, e pretenderla qui bloccherebbe la
    // rettifica di QUALSIASI dato — anche solo il telefono — finché la persona non
    // fornisce un'informazione che nessuno le aveva mai chiesto. L'Art.16 non si
    // subordina a un requisito nato dopo: il campo resta visibile e lo chiede il
    // sollecito del profilo (`missingProfileFields`), che non blocca nulla.
    // Chi invece la colonna ce l'ha non può SVUOTARLA: sarebbe perdere la chiave con
    // cui riconosciamo la persona nell'anagrafica importata dal partner.
    const hadContactEmail = Boolean(profile?.contact_email?.trim());
    const ce =
      hadContactEmail || contactEmail.trim()
        ? validateContactEmail(contactEmail)
        : null;
    if (ce) e.contactEmail = ce;
    // Nickname: vuoto è una risposta valida («non ne voglio uno»); se invece c'è deve
    // avere la forma del CHECK. Senza questo controllo la rettifica fallirebbe INTERA
    // per un campo facoltativo, con l'errore generico e nessuna indicazione di quale
    // campo l'ha causata.
    const nick = validateNickname(nickname);
    if (nick) e.nickname = nick;
    // E se sappiamo GIÀ che è di qualcun altro, ci si ferma qui — come fa la
    // registrazione (`useSignUpForm`). Senza, il salvataggio partirebbe, l'indice lo
    // respingerebbe e la persona leggerebbe il messaggio della corsa persa («un attimo
    // prima di te»): falso, perché lo sapevamo da secondi. `unknown` non ferma nessuno.
    else if (nicknameCheck === 'taken') e.nickname = 'nickname_taken';
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
    // Provincia solo italiana: per i paesi esteri si azzera.
    const nextProvince = country === 'IT' ? province.trim() : '';
    if (nextProvince !== (profile?.province ?? ''))
      changed.province = nextProvince;
    if (birthDate.trim() !== profile?.birth_date)
      changed.birth_date = birthDate.trim();
    // La mail di contatto entra nel patch se è cambiata, per QUALSIASI account:
    // condizionarla al relay (com'era) significherebbe validarla a tutti e salvarla
    // solo a qualcuno — la modifica passerebbe il controllo e non verrebbe scritta,
    // in silenzio.
    if (contactEmail.trim() !== (profile?.contact_email ?? ''))
      changed.contact_email = contactEmail.trim();
    // Il confronto è fra valori TRIMMATI da entrambi i lati: `updateProfile` scrive
    // `trim() || null`, quindi senza il trim qui un nickname a cui la persona ha solo
    // aggiunto uno spazio entrerebbe nel patch e produrrebbe una scrittura identica a
    // quella già in colonna.
    if (nickname.trim() !== (profile?.nickname ?? ''))
      changed.nickname = nickname.trim();

    if (Object.keys(changed).length > 0) {
      const { error } = await updateProfile(changed);
      if (error) {
        setLoading(false);
        // LA CORSA PERSA: fra il controllo di disponibilità e questo salvataggio,
        // qualcun altro ha preso lo stesso nickname. È raro, ma il modo peggiore di
        // gestirlo è l'errore generico «impossibile salvare»: manderebbe la persona a
        // ricontrollare nome, telefono e città, mentre il campo da cambiare è uno solo
        // e glielo possiamo dire. Il messaggio va SUL CAMPO, non in fondo alla pagina.
        if (isNicknameConflict(error)) {
          setErrors(prev => ({ ...prev, nickname: 'nickname_taken_race' }));
          // E si dice anche che NON È STATO SALVATO NIENTE: `updateProfile` fa un solo
          // `update` con tutti i campi cambiati, quindi il rifiuto dell'indice porta giù
          // anche il cognome corretto e il telefono nuovo. Col solo errore sotto il
          // campo nickname, la persona uscirebbe da qui convinta che il resto sia stato
          // scritto — e se ne accorgerebbe settimane dopo, o mai.
          setSubmitError(t('auth.edit.nothingSaved'));
          return;
        }
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
    nickname,
    // Senza questa dipendenza il salvataggio leggerebbe lo stato di disponibilità
    // CONGELATO alla creazione del callback: il blocco su «già preso» guarderebbe un
    // verdetto vecchio, cioè quasi sempre `idle`. Il linter l'ha preso, ed è il tipo di
    // difetto che nessun test coglie finché non capita la sequenza giusta.
    nicknameCheck,
    email,
    phone,
    city,
    province,
    country,
    birthDate,
    contactEmail,
    // `isRelay` fuori: la validazione e il patch della mail non lo consultano più
    // (resta solo per scegliere il placeholder).
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
      {/* Stesso campo del resto dell'app, con selettore del prefisso: qui era un
          input nudo in cui il '+39' andava digitato a mano, ed è proprio la
          schermata il cui scopo è correggere un numero esistente. Il valore
          arriva già scritto e, se in colonna non è in E.164 (spazi, prefisso
          assente — atteso dopo l'import delle anagrafiche), il campo lo
          normalizza invece di far fallire la validazione su un numero che a
          schermo sembra giusto. */}
      <AuthPhoneField
        label={t('auth.signup.phone')}
        value={phone}
        onChangeText={setPhone}
        country={country}
        onCountryChange={handleSelectCountry}
        error={err(errors.phone)}
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
          onChangeText={setProvince}
          error={err(errors.province)}
          autoCapitalize="characters"
        />
      ) : null}
      <AuthInput
        label={t('auth.signup.birthDate')}
        value={birthDate}
        onChangeText={setBirthDate}
        error={err(errors.birthDate)}
        placeholder="2000-01-31"
        autoCapitalize="none"
      />
      {/* Rettifica della mail di contatto. Sempre visibile: è obbligatoria per
          tutti, e un campo obbligatorio che non si vede blocca il salvataggio senza
          dire perché. Il placeholder cambia solo per gli alias Apple, dove serve
          dire che l'indirizzo nascosto non basta. */}
      <AuthInput
        label={t('auth.completeProfile.contactEmail')}
        value={contactEmail}
        onChangeText={onChangeContactEmail}
        error={err(errors.contactEmail)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        placeholder={t(
          isRelay
            ? 'auth.completeProfile.contactEmailPlaceholderRelay'
            : 'auth.completeProfile.contactEmailPlaceholder'
        )}
      />
      {/* Nickname: qui si può anche TOGLIERE, ed è l'unico campo per cui svuotare è
          una risposta e non un errore. Chi non l'ha mai scelto lo trova vuoto: è la
          seconda occasione per chi ha saltato il campo alla registrazione. */}
      <AuthInput
        label={t('auth.signup.nickname')}
        value={nickname}
        onChangeText={setNickname}
        error={err(errors.nickname)}
        {...nicknameHint}
        placeholder={t('auth.signup.nicknamePlaceholder')}
        autoCapitalize="none"
        autoComplete="off"
      />

      {submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {submitError}
        </PerfectText>
      ) : null}
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
