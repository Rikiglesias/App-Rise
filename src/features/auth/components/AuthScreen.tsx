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
  /**
   * Centra verticalmente il contenuto (default no). Usare SOLO su schermate
   * corte (es. landing): centrare un form lungo lo taglierebbe in cima quando
   * supera il viewport.
   */
  centerContent?: boolean;
  children: React.ReactNode;
}

/** Layout condiviso delle schermate auth: safe area + scroll + tastiera + hero brand. */
export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  subtitle,
  showLogo = true,
  centerContent = false,
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
          contentContainerStyle={[
            styles.content,
            centerContent && styles.contentCentered,
          ]}
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
    contentCentered: {
      // Centra il blocco corto (landing) ed elimina il vuoto in fondo.
      // Su form lunghi NON va usato: taglierebbe il contenuto sopra il viewport.
      justifyContent: 'center',
    },
    header: {
      marginBottom: PerfectSpacing.xl,
      // Logo + titolo + sottotitolo centrati: pattern standard delle schermate
      // auth. Allineati a sinistra apparivano sbilanciati rispetto ai bottoni
      // full-width (logo "laterale", sottotitolo storto a capo).
      alignItems: 'center',
    },
    logo: {
      marginBottom: PerfectSpacing.base,
    },
    title: {
      color: colors.neutral[900],
      fontWeight: '800',
      letterSpacing: scale(-0.5),
      textAlign: 'center',
    },
    subtitle: {
      color: colors.neutral[600],
      marginTop: PerfectSpacing.sm,
      textAlign: 'center',
    },
  });
