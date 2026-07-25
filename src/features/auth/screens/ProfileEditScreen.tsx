import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthButton } from '../components/AuthButton';
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
} from '@/shared/auth/validation';
import { isApplePrivateRelayEmail } from '@/shared/partner/partnerEmail';
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
    | 'contactEmail',
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
  // F1.10: solo per gli account Apple Private Relay mostriamo e rettifichiamo
  // la mail di contatto. Il flag deriva dall'email dell'account (session), non
  // dal campo `email` in editing: un cambio email non-confermato non conta.
  const isRelay = useMemo(
    () => isApplePrivateRelayEmail(currentEmail),
    [currentEmail]
  );
  // Qui NON si precompila con la mail dell'account, a differenza del completamento
  // profilo: in questa schermata il campo «Email» dell'account c'è già, e riempire
  // anche «Email di contatto» con lo stesso indirizzo mostrerebbe due campi identici
  // uno sopra l'altro — confusione, non aiuto. Chi ha un profilo nato prima di questa
  // regola la scrive una volta; per i nuovi la colonna arriva già piena dal
  // completamento profilo.
  const [contactEmail, setContactEmail] = useState(
    profile?.contact_email ?? ''
  );
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
    // Mail di contatto obbligatoria e reale per TUTTI, come al completamento del
    // profilo: è la mail con cui riconosciamo la persona anche nell'anagrafica
    // importata dal partner. Gemello del completa-profilo: se qui restasse
    // condizionata al relay, si potrebbe SVUOTARE in rettifica ciò che alla nascita
    // è obbligatorio, e il record tornerebbe non agganciabile. Helper condiviso.
    const ce = validateContactEmail(contactEmail);
    if (ce) e.contactEmail = ce;
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
      {/* F1.10: rettifica della mail di contatto, solo per account Apple relay. */}
      {/* Sempre visibile: è obbligatoria per tutti, e un campo obbligatorio che non
          si vede blocca il salvataggio senza dire perché. Il placeholder cambia solo
          per gli alias Apple, dove serve dire che l'indirizzo nascosto non basta. */}
      <AuthInput
        label={t('auth.completeProfile.contactEmail')}
        value={contactEmail}
        onChangeText={setContactEmail}
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
