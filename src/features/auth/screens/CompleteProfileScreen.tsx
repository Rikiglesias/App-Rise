import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthPhoneField } from '../components/AuthPhoneField';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { AuthSubmitError } from '../components/AuthSubmitError';
import { AuthRetry } from '../components/AuthRetry';
import { AuthSection } from '../components/AuthSection';
import { AuthConsentCheckbox } from '../components/AuthConsentCheckbox';
import { useProfileForm } from '../hooks/useProfileForm';
import { useAuthError } from '../hooks/useAuthError';
import { useNicknameHint } from '../hooks/useNicknameAvailability';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';
import { useAuth } from '@/shared/auth/AuthContext';
import { SegnalaProblema } from '@/shared/components/SegnalaProblema';
import {
  getProfileCompletion,
  isProfileGateBlocked,
} from '@/shared/auth/profileCompletion';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Schermata dei dati che mancano al profilo. Ha due vite:
 * - raggiunta dal profilo, è il completamento che la persona ha scelto di fare;
 * - montata dal cancello (`ProfileGateNavigator`), è il passaggio obbligato dopo
 *   l'accesso — e allora deve anche offrire una VIA D'USCITA, perché lì l'app non è
 *   raggiungibile: senza uscita, chi non può o non vuole completare disinstalla.
 * Quale delle due si sta vivendo lo dice lo STESSO predicato che governa il cancello,
 * non un parametro di rotta: un parametro può essere passato male da un chiamante, il
 * predicato no.
 */
export const CompleteProfileScreen: React.FC = () => {
  useRequireAuth();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const { profile, profileLoaded, profileError, refreshProfile, signOut } =
    useAuth();
  const { values, errors, refs, onChange, focusNext, ...form } =
    useProfileForm();
  const [submitAttempt, setSubmitAttempt] = useState(0);
  const [logoutAttempt, setLogoutAttempt] = useState(0);
  const { handleSubmit: submit } = form;
  const handleSubmit = useCallback((): void => {
    setSubmitAttempt(attempt => attempt + 1);
    submit();
  }, [submit]);
  // Disponibilità del nickname mentre si scrive (0018): senza, chi ne sceglie uno già
  // preso salverebbe e lo troverebbe vuoto, senza che nessuno glielo abbia detto. Lo
  // stato arriva dal form, che è anche quello che lo consulta prima di salvare.
  const nicknameHint = useNicknameHint(form.nicknameCheck);

  const gated = isProfileGateBlocked(
    getProfileCompletion(profile, profileLoaded)
  );

  const {
    error: logoutError,
    setError: setLogoutError,
    reportError: reportLogoutError,
    offline: logoutOffline,
  } = useAuthError('auth.profile.logoutError');
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const {
    error: profileReadError,
    setError: setProfileReadError,
    showError: showProfileReadError,
  } = useAuthError();
  const { clearSubmitError } = form;

  const handleProfileRetry = useCallback((): void => {
    clearSubmitError();
    setProfileReadError(null);
    setProfileLoading(true);
    void refreshProfile({ throwOnError: true })
      .catch(showProfileReadError)
      .finally(() => setProfileLoading(false));
  }, [
    clearSubmitError,
    refreshProfile,
    showProfileReadError,
    setProfileReadError,
  ]);

  // Qui «Esci» è una delle DUE sole vie d'uscita dal passaggio obbligato: se fallisce
  // in silenzio la persona resta chiusa dentro senza sapere perché, e l'unico gesto che
  // le resta è disinstallare l'app. L'errore va detto.
  // Il `.catch` non è ridondante: la sessione vive in SecureStore spezzata in blocchi
  // e un errore di quello storage fa RIGETTARE la promessa invece di tornare `{error}`.
  // Qui pesa il doppio: senza messaggio la persona resta chiusa nel passaggio
  // obbligato senza sapere perché.
  const handleLogout = useCallback((): void => {
    setLogoutAttempt(attempt => attempt + 1);
    setLogoutError(undefined);
    setLogoutLoading(true);
    void signOut()
      .then(({ error }) => {
        if (error) reportLogoutError(error);
      })
      .catch(reportLogoutError)
      .finally(() => setLogoutLoading(false));
  }, [signOut, reportLogoutError, setLogoutError]);

  const handleDeleteAccount = useCallback((): void => {
    navigation.navigate('DeleteAccount');
  }, [navigation]);

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  return (
    <AuthScreen
      title={t('auth.completeProfile.title')}
      subtitle={t('auth.completeProfile.subtitle')}
    >
      {gated ? (
        <View style={styles.notice}>
          <PerfectText size={14} lines={4} style={styles.noticeText}>
            {t('auth.completeProfile.gateNotice')}
          </PerfectText>
        </View>
      ) : null}

      {profileError || profileReadError ? (
        <>
          <PerfectText size={14} lines={2} style={styles.error}>
            {profileReadError ?? t(`auth.errors.${profileError}`)}
          </PerfectText>
          <AuthRetry
            visible
            onPress={handleProfileRetry}
            loading={profileLoading}
            disabled={logoutLoading || form.loading}
          />
        </>
      ) : null}

      <AuthSection title={t('auth.signup.sections.personal')}>
        <AuthInput
          label={t('auth.signup.firstName')}
          value={values.firstName}
          onChangeText={onChange.firstName}
          error={err(errors.firstName)}
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          onSubmitEditing={focusNext.lastName}
        />
        <AuthInput
          ref={refs.lastNameRef}
          label={t('auth.signup.lastName')}
          value={values.lastName}
          onChangeText={onChange.lastName}
          error={err(errors.lastName)}
          autoCapitalize="words"
          autoComplete="family-name"
          textContentType="familyName"
          returnKeyType="next"
          onSubmitEditing={focusNext.phone}
        />
        <AuthDateField
          label={t('auth.signup.birthDate')}
          value={values.birthDate}
          onChange={onChange.birthDate}
          error={err(errors.birthDate)}
          placeholder={t('auth.signup.birthDatePlaceholder')}
        />
        {/*
          Nickname: stessa posizione e stesse regole del modulo di registrazione — è
          l'altra schermata in cui un profilo NASCE, e chiedere cose diverse a seconda
          di come si è entrati (email o accesso social) è una differenza che nessuno
          saprebbe spiegare a chi la subisce. Facoltativo, e la label lo dice; il
          placeholder spiega a cosa serve, perché «nickname» in mezzo all'anagrafica è
          altrimenti un campo misterioso.
          Fuori dalla catena di focus, come la data di nascita: chi non lo vuole non
          deve passarci sopra andando avanti col tasto della tastiera.
        */}
        <AuthInput
          label={t('auth.signup.nickname')}
          value={values.nickname}
          onChangeText={onChange.nickname}
          error={err(errors.nickname)}
          {...nicknameHint}
          placeholder={t('auth.signup.nicknamePlaceholder')}
          autoCapitalize="none"
          autoComplete="off"
        />
      </AuthSection>

      <AuthSection title={t('auth.signup.sections.contacts')}>
        <AuthPhoneField
          label={t('auth.signup.phone')}
          // Qui il numero può esistere già (profilo incompleto che si sta finendo):
          // passarlo lo fa VEDERE. In `SignUpScreen` la prop resta assente di
          // proposito — chi si registra non ha ancora nessun numero da mostrare.
          value={values.phone}
          onChangeText={onChange.phone}
          country={values.country}
          onCountryChange={onChange.country}
          error={err(errors.phone)}
        />
        <AuthCountryField
          label={t('auth.signup.country')}
          value={values.country}
          onSelect={onChange.country}
          error={err(errors.country)}
        />
        <AuthCityField
          label={t('auth.signup.city')}
          value={values.city}
          country={values.country}
          onChangeCity={onChange.city}
          onSelectComune={form.selectComune}
          error={err(errors.city)}
          placeholder={
            values.country === 'IT'
              ? t('auth.signup.cityPlaceholder')
              : t('auth.signup.cityForeignPlaceholder')
          }
        />
        {values.country === 'IT' ? (
          <AuthInput
            label={t('auth.signup.province')}
            value={values.province}
            error={err(errors.province)}
            editable={false}
            placeholder={t('auth.signup.provincePlaceholder')}
          />
        ) : null}
        {/* Mail di contatto SEMPRE richiesta (decisione 2026-07-25): è la mail reale
            con cui riconosciamo la persona — anche nell'anagrafica importata dal
            partner, dove un alias Apple non combacerebbe e creerebbe un secondo
            record — e con cui le scriviamo. Per chi ha già una mail reale arriva
            precompilata: si vede quale indirizzo useremo, senza doverlo ridigitare.
            Con un alias il campo parte vuoto e il placeholder dice perché. */}
        <AuthInput
          label={t('auth.completeProfile.contactEmail')}
          value={values.contactEmail}
          onChangeText={onChange.contactEmail}
          error={err(errors.contactEmail)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          placeholder={t(
            form.isRelay
              ? 'auth.completeProfile.contactEmailPlaceholderRelay'
              : 'auth.completeProfile.contactEmailPlaceholder'
          )}
        />
      </AuthSection>

      {/* Il form richiede il consenso se il profilo manca o non è ancora caricato.
          Per un profilo esistente già letto, qui si completano solo i campi:
          la ri-accettazione di un'informativa cambiata è di ReConsentScreen. */}
      {form.requirePrivacyConsent ? (
        <AuthSection title={t('auth.signup.sections.consents')}>
          <AuthConsentCheckbox
            checked={values.privacyConsent}
            onToggle={form.togglePrivacy}
            label={t('auth.signup.privacyConsent')}
            linkText={t('auth.signup.privacyConsentLink')}
            linkUrl={RISE_URLS.privacyPolicy}
            error={err(errors.privacyConsent)}
          />
        </AuthSection>
      ) : null}

      {form.submitError && !profileError ? (
        <AuthSubmitError
          message={form.submitError}
          attempt={submitAttempt}
          style={styles.error}
        />
      ) : null}

      <AuthButton
        label={t('auth.completeProfile.submit')}
        onPress={handleSubmit}
        loading={form.loading}
        disabled={logoutLoading || profileLoading || Boolean(profileError)}
      />
      <AuthRetry
        visible={form.offline && !profileError}
        onPress={handleSubmit}
        loading={form.loading}
        disabled={logoutLoading || profileLoading}
      />

      {/* Le vie d'uscita esistono SOLO nel passaggio obbligato: raggiunta dal profilo,
          questa schermata sta nello stack e se ne esce col tasto o il gesto indietro.
          «Esci» rimette la persona nell'app come ospite (da ospite si può ancora
          donare); «Elimina account» è per chi scopre di non poter avere un profilo
          valido — il caso vero è la data di nascita che non passa. Senza queste due, il
          passaggio obbligato diventa una stanza chiusa. */}
      {gated ? (
        <View style={styles.exits}>
          <PerfectText size={13} lines={2} style={styles.exitHint}>
            {t('auth.completeProfile.gateExitHint')}
          </PerfectText>
          <AuthButton
            label={t('auth.profile.logout')}
            onPress={handleLogout}
            variant="link"
            loading={logoutLoading}
            disabled={form.loading || profileLoading || logoutLoading}
          />
          {logoutError ? (
            <AuthSubmitError
              message={logoutError}
              attempt={logoutAttempt}
              size={13}
              style={styles.error}
            />
          ) : null}
          <AuthRetry
            visible={logoutOffline}
            onPress={handleLogout}
            loading={logoutLoading}
            disabled={form.loading || profileLoading || logoutLoading}
          />
          <AuthButton
            label={t('auth.delete.title')}
            onPress={handleDeleteAccount}
            variant="link"
          />
        </View>
      ) : null}
      <SegnalaProblema />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    error: {
      color: colors.semantic.error.text,
      marginTop: PerfectSpacing.xs,
    },
    notice: {
      backgroundColor: Colors.primary[50],
      borderRadius: PerfectSpacing.sm,
      padding: PerfectSpacing.md,
      marginBottom: PerfectSpacing.md,
    },
    noticeText: {
      color: Colors.primary[700],
    },
    exits: {
      marginTop: PerfectSpacing.lg,
    },
    exitHint: {
      color: colors.neutral[600],
      marginBottom: PerfectSpacing.xs,
    },
  });
