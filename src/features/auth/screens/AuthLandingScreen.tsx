import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { SocialButtons } from '../components/SocialButtons';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { mapAuthError } from '@/shared/auth/authErrors';
import type { RootStackNavigationProp } from '@/navigation/types';

export const AuthLandingScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [socialError, setSocialError] = useState<string | null>(null);

  const handleSocialError = useCallback(
    (message: string): void =>
      setSocialError(t(`auth.errors.${mapAuthError(message)}`)),
    [t]
  );

  const goToLogin = useCallback(
    (): void => navigation.navigate('Login'),
    [navigation]
  );
  const goToSignUp = useCallback(
    (): void => navigation.navigate('SignUp'),
    [navigation]
  );

  return (
    <AuthScreen
      title={t('auth.landing.title')}
      subtitle={t('auth.landing.subtitle')}
      centerContent
    >
      <AuthButton label={t('auth.landing.login')} onPress={goToLogin} />
      <AuthButton
        label={t('auth.landing.signup')}
        variant="link"
        onPress={goToSignUp}
      />
      <SocialButtons onError={handleSocialError} />
      {socialError ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {socialError}
        </PerfectText>
      ) : null}
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    error: {
      color: colors.semantic.error.main,
      marginTop: PerfectSpacing.base,
      textAlign: 'center',
    },
  });
