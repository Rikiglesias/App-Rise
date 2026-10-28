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
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { EmailChangePending } from '../components/EmailChangePending';
import { AuthSubmitError } from '../components/AuthSubmitError';
import { AuthRetry } from '../components/AuthRetry';
import { useAccountEmailField } from '../hooks/useAccountEmailField';
import { useEmailChangeResend } from '../hooks/useEmailChangeResend';
import { useProfileEditSubmit } from '../hooks/useProfileEditSubmit';
import {
  useNicknameAvailability,
  useNicknameHint,
} from '../hooks/useNicknameAvailability';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';
import { useLegataAllUtente } from '@/shared/auth/useLegataAllUtente';
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';

/** Rettifica dei dati personali in-app (GDPR Art.16): campi profilo + cambio email. */
export const ProfileEditScreen: React.FC = () => {
  useRequireAuth();
  const legata = useLegataAllUtente();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { profile, session } = useAuth();

  const currentEmail = session?.user.email ?? '';
  // S8: secure email change → Supabase popola user.new_email finché il cambio non è
  // confermato su entrambe le caselle. Stato derivato dalla session (sopravvive a
  // re-render/ri-apertura), non da un flag locale transitorio.
  const pendingEmail = session?.user.new_email ?? null;
  const [firstName, setFirstName] = useState(profile?.first_name ?? '');
  const [lastName, setLastName] = useState(profile?.last_name ?? '');
  const { email, onChangeEmail, emailDaCambiare, segnaSalvato } =
    useAccountEmailField(currentEmail, pendingEmail);
  // Qui e non nel banner: l'attesa parte anche dal «Salva» che chiede il cambio (C87).
  const {
    until: attesaRinvio,
    resend: rimandaLink,
    avviaAttesa,
  } = useEmailChangeResend(currentEmail);
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
  const nicknameCheck = useNicknameAvailability(
    nickname,
    nickname.trim() !== (profile?.nickname ?? '')
  );
  const nicknameHint = useNicknameHint(nicknameCheck);
  // La mail di contatto si mostra e si rettifica per TUTTI dal 2026-07-25 (era
  // solo per gli account Apple Private Relay, F1.10). `isRelay` sopravvive per
  // un solo scopo: scegliere il testo-guida del campo (il placeholder, sotto), perché a chi
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
  const {
    handleSubmit,
    errors,
    submitError,
    submitErrorKey,
    offline,
    success,
    emailChanged,
    loading,
    submitAttempt,
    profileSaved,
  } = useProfileEditSubmit({
    values: {
      firstName,
      lastName,
      email,
      phone,
      city,
      province,
      country,
      birthDate,
      contactEmail,
      nickname,
    },
    nicknameCheck,
    emailDaCambiare,
    segnaSalvato,
    avviaAttesa,
    legata,
  });

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

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
        onChangeText={onChangeEmail}
        error={err(errors.email)}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
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
      {/* Selettore come in registrazione e in Completa profilo (C95): col testo libero
          `01/02/2000` diventava il 2 gennaio. */}
      <AuthDateField
        label={t('auth.signup.birthDate')}
        value={birthDate}
        onChange={setBirthDate}
        error={err(errors.birthDate)}
        placeholder={t('auth.signup.birthDatePlaceholder')}
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
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      {submitError ? (
        <AuthSubmitError
          message={
            // Profilo salvato, email no (C70): col motivo dell'email quando è specifico
            // (già registrata, troppi tentativi, rete), altrimenti l'invito a riprovare.
            profileSaved
              ? submitErrorKey && submitErrorKey !== 'generic'
                ? t('auth.edit.partialSaveReason', { reason: submitError })
                : t('auth.edit.partialSave')
              : submitError
          }
          attempt={submitAttempt}
          style={styles.error}
        />
      ) : null}
      {pendingEmail ? (
        <EmailChangePending
          pendingEmail={pendingEmail}
          until={attesaRinvio}
          resend={rimandaLink}
        />
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
      <AuthRetry visible={offline} onPress={handleSubmit} loading={loading} />
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
      color: colors.semantic.error.text,
      marginTop: PerfectSpacing.xs,
    },
    success: {
      color: colors.semantic.success.text,
      marginTop: PerfectSpacing.xs,
    },
  });
