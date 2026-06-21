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
   * Layout "welcome" della landing (default no): hero in alto + azioni spinte
   * verso il basso da uno spacer flessibile, senza vuoto sopra il logo. NON
   * usare sui form lunghi: lo spacer spingerebbe i campi fuori dal viewport.
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
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Landing: gruppo hero+azioni COESO nel terzo superiore (spacer
              sopra piccolo + sotto grande). Niente vuoto sopra il logo né gap
              centrale; lo spazio residuo resta in fondo come padding naturale
              sopra la tab bar. Sui form gli spacer non vengono inseriti. */}
          {centerContent ? <View style={styles.heroSpacerTop} /> : null}
          <View style={styles.header}>
            {showLogo ? (
              <PerfectImage
                width={centerContent ? 96 : 72}
                aspectRatio={1}
                source={require('@assets/icons/app/logo.png')}
                imageStyle={{ resizeMode: 'contain' }}
                containerStyle={styles.logo}
                accessibilityRole="image"
                accessibilityLabel="Rise Against Hunger Italia"
              />
            ) : null}
            <PerfectText size={30} lines={2} style={styles.title}>
              {title}
            </PerfectText>
            {subtitle ? (
              <PerfectText
                size={15}
                lines={3}
                style={styles.subtitle}
                containerWidth={240}
              >
                {subtitle}
              </PerfectText>
            ) : null}
          </View>
          {children}
          {centerContent ? <View style={styles.heroSpacerEnd} /> : null}
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
    // Landing: posiziona il gruppo hero+azioni nel terzo superiore (spacer
    // sopra piccolo + sotto grande), coeso, senza vuoto sopra né gap centrale.
    heroSpacerTop: {
      flex: 0.55,
    },
    heroSpacerEnd: {
      flex: 1.45,
    },
    header: {
      marginBottom: PerfectSpacing.xl,
      // Logo + titolo + sottotitolo centrati: pattern standard delle schermate
      // auth. Allineati a sinistra apparivano sbilanciati rispetto ai bottoni
      // full-width (logo "laterale", sottotitolo storto a capo).
      alignItems: 'center',
    },
    logo: {
      marginBottom: PerfectSpacing.md,
    },
    title: {
      color: colors.neutral[900],
      fontWeight: '800',
      // Tracking stretto come i titoli Home (HomeHeaderStyles) → più curato.
      letterSpacing: scale(-0.8),
      textAlign: 'center',
    },
    subtitle: {
      color: colors.neutral[600],
      // Più aria sotto il titolo + tracking leggero per leggibilità.
      marginTop: PerfectSpacing.md,
      textAlign: 'center',
      letterSpacing: scale(0.2),
      // L'a-capo bilanciato è gestito da containerWidth sul PerfectText
      // (evita l'orfano "impatto" su riga isolata).
    },
  });
