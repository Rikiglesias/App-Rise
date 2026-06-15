import React, { useMemo } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformScrollView, PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthScreenProps {
  title: string;
  children: React.ReactNode;
}

/** Layout condiviso delle schermate auth: safe area + scroll + tastiera + titolo. */
export const AuthScreen: React.FC<AuthScreenProps> = ({ title, children }) => {
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
        >
          <PerfectText size={28} lines={2} style={styles.title}>
            {title}
          </PerfectText>
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
    title: {
      color: colors.neutral[900],
      fontWeight: '800',
      marginBottom: PerfectSpacing.lg,
      letterSpacing: scale(-0.5),
    },
  });
