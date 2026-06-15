import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { AuthLandingScreen } from './AuthLandingScreen';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';

export const ProfileScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { status, session, profile, signOut } = useAuth();
  const handleLogout = useCallback((): void => {
    void signOut();
  }, [signOut]);

  if (status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.primary[600]} />
      </View>
    );
  }

  if (status === 'unauthenticated') {
    return <AuthLandingScreen />;
  }

  const fullName = profile
    ? `${profile.first_name} ${profile.last_name}`
    : '';

  return (
    <AuthScreen title={t('auth.profile.title')}>
      {fullName ? (
        <PerfectText size={20} lines={1} style={styles.name}>
          {fullName}
        </PerfectText>
      ) : null}

      <Row label={t('auth.login.email')} value={session?.user.email ?? ''} styles={styles} />
      {profile ? (
        <>
          <Row label={t('auth.profile.phone')} value={profile.phone} styles={styles} />
          <Row
            label={t('auth.profile.location')}
            value={`${profile.city} (${profile.province})`}
            styles={styles}
          />
          <Row
            label={t('auth.profile.birthDate')}
            value={profile.birth_date}
            styles={styles}
          />
        </>
      ) : null}

      <AuthButton label={t('auth.profile.logout')} onPress={handleLogout} />
    </AuthScreen>
  );
};

const Row: React.FC<{
  label: string;
  value: string;
  styles: ReturnType<typeof createStyles>;
}> = ({ label, value, styles }) => (
  <View style={styles.row}>
    <PerfectText size={13} lines={1} style={styles.rowLabel}>
      {label}
    </PerfectText>
    <PerfectText size={16} lines={2} style={styles.rowValue}>
      {value}
    </PerfectText>
  </View>
);

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.neutral[50],
    },
    name: {
      color: colors.neutral[900],
      fontWeight: '700',
      marginBottom: PerfectSpacing.lg,
    },
    row: {
      marginBottom: PerfectSpacing.base,
    },
    rowLabel: {
      color: colors.neutral[500],
      marginBottom: PerfectSpacing.xs,
    },
    rowValue: {
      color: colors.neutral[900],
      fontWeight: '600',
    },
  });
