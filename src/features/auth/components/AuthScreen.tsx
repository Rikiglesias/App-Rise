import React, { useMemo } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformScrollView, PerfectText, PerfectImage } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  /** Mostra il marchio brand in testa (default sì, per identità coerente). */
  showLogo?: boolean;
  children: React.ReactNode;
}

/** Layout condiviso delle schermate auth: safe area + scroll + tastiera + hero brand. */
export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  subtitle,
  showLogo = true,
  children,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <PlatformScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            {showLogo ? (
              <PerfectImage
                width={72}
                aspectRatio={1}
                source={require('@assets/icons/app/logo.png')}
                imageStyle={{ resizeMode: 'contain' }}
                containerStyle={styles.logo}
                accessibilityRole="image"
                accessibilityLabel="Rise Against Hunger Italia"
              />
            ) : null}
            <PerfectText size={28} lines={2} style={styles.title}>
              {title}
            </PerfectText>
            {subtitle ? (
              <PerfectText size={16} lines={3} style={styles.subtitle}>
                {subtitle}
              </PerfectText>
            ) : null}
          </View>
          {children}
        </PlatformScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: PerfectSpacing.lg,
      paddingTop: PerfectSpacing.xl,
    },
    header: {
      marginBottom: PerfectSpacing.xl,
    },
    logo: {
      marginBottom: PerfectSpacing.base,
    },
    title: {
      color: colors.neutral[900],
      fontWeight: '800',
      letterSpacing: scale(-0.5),
    },
    subtitle: {
      color: colors.neutral[600],
      marginTop: PerfectSpacing.sm,
    },
  });
