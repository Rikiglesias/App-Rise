import React, { useCallback, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import Svg, { Path } from 'react-native-svg';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { useAuth } from '@/shared/auth/AuthContext';

interface SocialButtonsProps {
  onError?: (message: string) => void;
}

/** Logo "G" ufficiale Google a 4 colori — valori esatti del brand, non tokenizzabili. */
const GoogleGLogo: React.FC = () => (
  <Svg width={scale(20)} height={scale(20)} viewBox="0 0 48 48">
    <Path
      fill="#FFC107"
      d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
    />
    <Path
      fill="#FF3D00"
      d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
    />
    <Path
      fill="#4CAF50"
      d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
    />
    <Path
      fill="#1976D2"
      d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
    />
  </Svg>
);

/** Bottoni social: Apple nativo (iOS) + Google OAuth brandizzato. */
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
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <PerfectText size={13} lines={1} style={styles.dividerText}>
          {t('auth.social.or')}
        </PerfectText>
        <View style={styles.dividerLine} />
      </View>

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

      <PlatformTouchable
        onPress={onGoogle}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={t('auth.social.continueGoogle')}
        style={styles.googleBtn}
      >
        {/* Figlio singolo styled: su Android PlatformTouchable wrappa i figli
            multipli in una View unstyled, perdendo il row → logo+testo in
            colonna. Una sola View-row interna evita il wrapper e tiene il
            layout coerente iOS/Android (Codex P2). */}
        <View style={styles.googleRow}>
          <GoogleGLogo />
          <PerfectText size={18} lines={1} style={styles.googleText}>
            {t('auth.social.continueGoogle')}
          </PerfectText>
        </View>
      </PlatformTouchable>
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginTop: PerfectSpacing.lg,
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: PerfectSpacing.base,
    },
    dividerLine: {
      flex: 1,
      height: scale(1),
      backgroundColor: colors.neutral[200],
    },
    dividerText: {
      color: colors.neutral[500],
      marginHorizontal: PerfectSpacing.base,
    },
    appleBtn: {
      width: '100%',
      height: scale(48),
      marginBottom: PerfectSpacing.sm,
    },
    googleBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      height: scale(48),
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[300],
      borderRadius: scale(12),
    },
    googleRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    googleText: {
      color: colors.neutral[900],
      fontWeight: '500',
      marginLeft: PerfectSpacing.sm,
    },
  });
