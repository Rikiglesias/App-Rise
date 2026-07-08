import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthPhoneField } from '../components/AuthPhoneField';
import { AuthCountryField } from '../components/AuthCountryField';
import { AuthCityField } from '../components/AuthCityField';
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { FormError } from '../components/FormError';
import { FormSuccess } from '../components/FormSuccess';
import { AuthSection } from '../components/AuthSection';
import { AuthConsentCheckbox } from '../components/AuthConsentCheckbox';
import { useSignUpForm } from '../hooks/useSignUpForm';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useTranslation } from '@/shared/hooks/useTranslation';

export const SignUpScreen: React.FC = () => {
  const styles = useMemo(() => createStyles(), []);
  const { t } = useTranslation();
  const { values, errors, refs, onChange, focusNext, ...form } =
    useSignUpForm();

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  if (form.done) {
    return (
      <AuthScreen title={t('auth.signup.title')}>
        <FormSuccess
          message={t('auth.signup.checkEmail')}
          lines={4}
          style={styles.doneText}
        />
        <AuthButton
          label={t('auth.login.submit')}
          variant="link"
          onPress={form.goToLogin}
        />
      </AuthScreen>
    );
  }

  return (
    <AuthScreen title={t('auth.signup.title')}>
      <AuthSection title={t('auth.signup.sections.personal')} first>
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
          onSubmitEditing={focusNext.email}
        />
        <AuthDateField
          label={t('auth.signup.birthDate')}
          value={values.birthDate}
          onChange={onChange.birthDate}
          error={err(errors.birthDate)}
          placeholder={t('auth.signup.birthDatePlaceholder')}
        />
      </AuthSection>

      <AuthSection title={t('auth.signup.sections.account')}>
        <AuthInput
          ref={refs.emailRef}
          label={t('auth.signup.email')}
          value={values.email}
          onChangeText={onChange.email}
          error={err(errors.email)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={focusNext.password}
        />
        <AuthInput
          ref={refs.passwordRef}
          label={t('auth.signup.password')}
          value={values.password}
          onChangeText={onChange.password}
          error={err(errors.password)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={focusNext.confirmPassword}
        />
        <AuthInput
          ref={refs.confirmPasswordRef}
          label={t('auth.signup.confirmPassword')}
          value={values.confirmPassword}
          onChangeText={onChange.confirmPassword}
          error={err(errors.confirmPassword)}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          onSubmitEditing={focusNext.phone}
        />
      </AuthSection>

      <AuthSection title={t('auth.signup.sections.contacts')}>
        <AuthPhoneField
          ref={refs.phoneRef}
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
      </AuthSection>

      <AuthSection title={t('auth.signup.sections.consents')}>
        <AuthConsentCheckbox
          checked={values.privacyConsent}
          onToggle={form.togglePrivacy}
          label={t('auth.signup.privacyConsent')}
          linkText={t('auth.signup.privacyConsentLink')}
          linkUrl={RISE_URLS.privacyPolicy}
          error={err(errors.privacyConsent)}
        />
        <AuthConsentCheckbox
          checked={values.marketingConsent}
          onToggle={form.toggleMarketing}
          label={t('auth.signup.marketingConsent')}
        />
      </AuthSection>

      {/* Stacco i consensi dal CTA "Registrati": senza, i due check risultano
          appiccicati al bottone. */}
      <View style={styles.submitGap} />

      <FormError message={form.submitError} style={styles.error} />

      <AuthButton
        label={t('auth.signup.submit')}
        onPress={form.handleSubmit}
        loading={form.loading}
      />
      <AuthButton
        label={t('auth.signup.hasAccount')}
        variant="link"
        onPress={form.goToLogin}
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
    // Stacco tra l'ultimo consenso e il CTA "Registrati".
    submitGap: {
      height: PerfectSpacing.lg,
    },
    doneText: {
      marginBottom: PerfectSpacing.lg,
    },
  });
