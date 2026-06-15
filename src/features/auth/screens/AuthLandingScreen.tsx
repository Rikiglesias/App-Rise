import React, { useCallback, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { RootStackNavigationProp } from '@/navigation/types';

export const AuthLandingScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();

  const goToLogin = useCallback(
    (): void => navigation.navigate('Login'),
    [navigation]
  );
  const goToSignUp = useCallback(
    (): void => navigation.navigate('SignUp'),
    [navigation]
  );

  return (
    <AuthScreen title={t('auth.landing.title')}>
      <PerfectText size={16} lines={3} style={styles.subtitle}>
        {t('auth.landing.subtitle')}
      </PerfectText>
      <AuthButton label={t('auth.landing.login')} onPress={goToLogin} />
      <AuthButton
        label={t('auth.landing.signup')}
        variant="link"
        onPress={goToSignUp}
      />
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    subtitle: {
      color: colors.neutral[600],
      marginBottom: PerfectSpacing.xl,
    },
  });
