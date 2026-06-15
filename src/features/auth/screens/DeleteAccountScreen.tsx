import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { AuthScreen } from '../components/AuthScreen';
import { AuthButton } from '../components/AuthButton';
import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';
import { getAppleAuthCodeForDeletion } from '@/shared/auth/socialAuth';
import type { RootStackNavigationProp } from '@/navigation/types';

/**
 * Eliminazione account (GDPR Art.17 + App Store 5.1.1(v)).
 * Doppia conferma (azione + Alert nativo). Due modelli a scelta dell'utente:
 * immediato o programmato a +30gg (grace period recuperabile).
 */
export const DeleteAccountScreen: React.FC = () => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { session, deleteAccountNow, scheduleDeletion } = useAuth();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const isApple =
    session?.user.identities?.some((i) => i.provider === 'apple') ?? false;

  const runDeleteNow = useCallback(async (): Promise<void> => {
    setError(undefined);
    setLoading(true);
    let appleAuthCode: string | undefined;
    if (isApple) {
      const code = await getAppleAuthCodeForDeletion();
      appleAuthCode = code ?? undefined;
    }
    const { error: err } = await deleteAccountNow(appleAuthCode);
    setLoading(false);
    if (err) setError(t('auth.delete.error'));
    // Su successo l'AuthContext porta lo stato a unauthenticated (signOut).
  }, [isApple, deleteAccountNow, t]);

  const runSchedule = useCallback(async (): Promise<void> => {
    setError(undefined);
    setLoading(true);
    const { error: err } = await scheduleDeletion();
    setLoading(false);
    if (err) setError(t('auth.delete.error'));
    else navigation.goBack();
  }, [scheduleDeletion, navigation, t]);

  const confirmNow = useCallback((): void => {
    Alert.alert(t('auth.delete.title'), t('auth.delete.confirmNow'), [
      { text: t('auth.delete.cancel'), style: 'cancel' },
      {
        text: t('auth.delete.confirm'),
        style: 'destructive',
        onPress: () => void runDeleteNow(),
      },
    ]);
  }, [t, runDeleteNow]);

  const confirmSchedule = useCallback((): void => {
    Alert.alert(t('auth.delete.title'), t('auth.delete.confirmScheduled'), [
      { text: t('auth.delete.cancel'), style: 'cancel' },
      { text: t('auth.delete.confirm'), onPress: () => void runSchedule() },
    ]);
  }, [t, runSchedule]);

  return (
    <AuthScreen title={t('auth.delete.title')}>
      <PerfectText size={16} lines={6} style={styles.warning}>
        {t('auth.delete.warning')}
      </PerfectText>

      <AuthButton
        label={t('auth.delete.now')}
        onPress={confirmNow}
        loading={loading}
      />

      <PerfectText size={13} lines={3} style={styles.hint}>
        {t('auth.delete.scheduledHint')}
      </PerfectText>
      <AuthButton
        label={t('auth.delete.scheduled')}
        onPress={confirmSchedule}
        variant="link"
        disabled={loading}
      />

      {error ? (
        <PerfectText size={14} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
    </AuthScreen>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    warning: {
      color: colors.neutral[700],
      marginBottom: PerfectSpacing.lg,
    },
    hint: {
      color: colors.neutral[500],
      marginTop: PerfectSpacing.lg,
      marginBottom: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.base,
    },
  });
