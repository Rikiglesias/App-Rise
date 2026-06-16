import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

import { AuthButton } from './AuthButton';
import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';

interface SocialButtonsProps {
  onError?: (message: string) => void;
}

/** Bottoni social (Apple su iOS + Google). Apple HIG: pulsante nativo. */
export const SocialButtons: React.FC<SocialButtonsProps> = ({ onError }) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { t } = useTranslation();
  const { signInWithApple, signInWithGoogle } = useAuth();

  const onApple = useCallback(() => {
    void (async (): Promise<void> => {
      const { error } = await signInWithApple();
      if (error && error !== 'apple_cancelled') onError?.(error);
    })();
  }, [signInWithApple, onError]);

  const onGoogle = useCallback(() => {
    void (async (): Promise<void> => {
      const { error } = await signInWithGoogle();
      if (error && error !== 'google_cancelled') onError?.(error);
    })();
  }, [signInWithGoogle, onError]);

  return (
    <View style={styles.wrap}>
      <PerfectText size={13} lines={1} style={styles.divider}>
        {t('auth.social.or')}
      </PerfectText>
      {Platform.OS === 'ios' ? (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={
            AppleAuthentication.AppleAuthenticationButtonType.CONTINUE
          }
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={scale(12)}
          style={styles.appleBtn}
          onPress={onApple}
        />
      ) : null}
      <AuthButton
        label={t('auth.social.continueGoogle')}
        variant="link"
        onPress={onGoogle}
      />
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginTop: PerfectSpacing.lg,
    },
    divider: {
      color: colors.neutral[500],
      textAlign: 'center',
      marginBottom: PerfectSpacing.base,
    },
    appleBtn: {
      width: '100%',
      height: scale(48),
      marginBottom: PerfectSpacing.sm,
    },
  });
