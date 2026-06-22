import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthInput } from '../components/AuthInput';
import { AuthPhoneField } from '../components/AuthPhoneField';
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
          error={err(errors.phone)}
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
      </AuthSection>

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
