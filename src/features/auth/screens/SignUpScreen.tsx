import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthDateField } from '../components/AuthDateField';
import { AuthButton } from '../components/AuthButton';
import { AuthSection } from '../components/AuthSection';
import { AuthConsentCheckbox } from '../components/AuthConsentCheckbox';
import { useSignUpForm } from '../hooks/useSignUpForm';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';

export const SignUpScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { values, errors, refs, onChange, focusNext, ...form } =
    useSignUpForm();

  const err = (key?: string): string | undefined =>
    key ? t(`auth.errors.${key}`) : undefined;

  if (form.done) {
    return (
      <AuthScreen title={t('auth.signup.title')}>
        <PerfectText size={16} lines={4} style={styles.doneText}>
          {t('auth.signup.checkEmail')}
        </PerfectText>
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
        <AuthInput
          ref={refs.phoneRef}
          label={t('auth.signup.phone')}
          value={values.phone}
          onChangeText={onChange.phone}
          error={err(errors.phone)}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          returnKeyType="next"
          onSubmitEditing={focusNext.city}
        />
        <AuthInput
          ref={refs.cityRef}
          label={t('auth.signup.city')}
          value={values.city}
          onChangeText={onChange.city}
          error={err(errors.city)}
          autoCapitalize="words"
          autoComplete="postal-address-locality"
          textContentType="addressCity"
          returnKeyType="next"
          onSubmitEditing={focusNext.province}
        />
        <AuthInput
          ref={refs.provinceRef}
          label={t('auth.signup.province')}
          value={values.province}
          onChangeText={onChange.province}
          error={err(errors.province)}
          autoCapitalize="characters"
          autoComplete="postal-address-region"
          textContentType="addressState"
          returnKeyType="done"
        />
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

      {form.submitError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {form.submitError}
        </PerfectText>
      ) : null}

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

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
    doneText: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
  });
