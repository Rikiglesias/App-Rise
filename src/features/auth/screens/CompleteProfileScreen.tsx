import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthPhoneField } from '../components/AuthPhoneField';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { AuthSection } from '../components/AuthSection';
import { AuthConsentCheckbox } from '../components/AuthConsentCheckbox';
import { useProfileForm } from '../hooks/useProfileForm';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useRequireAuth } from '@/shared/auth/useRequireAuth';

/** Step post-social: i provider non danno telefono/città/provincia/data nascita. */
export const CompleteProfileScreen: React.FC = () => {
  useRequireAuth();
  const styles = useMemo(() => createStyles(), []);
  const { t } = useTranslation();
  const { values, errors, refs, onChange, focusNext, ...form } =
    useProfileForm();

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  return (
    <AuthScreen
      title={t('auth.completeProfile.title')}
      subtitle={t('auth.completeProfile.subtitle')}
    >
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
      </AuthSection>

      <AuthSection title={t('auth.signup.sections.contacts')}>
        <AuthPhoneField
          label={t('auth.signup.phone')}
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
          placeholder={t(
            form.isRelay
              ? 'auth.completeProfile.contactEmailPlaceholderRelay'
              : 'auth.completeProfile.contactEmailPlaceholder'
          )}
        />
      </AuthSection>

      {/* Consensi solo quando il profilo NASCE qui. Su un profilo che esiste già il
          consenso fu raccolto alla nascita e questa schermata serve solo ad
          aggiungere i campi mancanti: mostrare la casella significherebbe pretendere
          una spunta che il salvataggio poi scarta (né `privacy_consent_at` né un
          evento nel registro Art.7) — un consenso chiesto e buttato. La
          ri-accettazione di un'informativa cambiata è di `ReConsentScreen`. */}
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

      {form.submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {form.submitError}
        </PerfectText>
      ) : null}

      <AuthButton
        label={t('auth.completeProfile.submit')}
        onPress={form.handleSubmit}
        loading={form.loading}
      />
    </AuthScreen>
  );
};

const createStyles = () =>
  StyleSheet.create({
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
