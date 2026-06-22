import React, { useMemo } from 'react';
import { StyleSheet, KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlatformScrollView, PerfectText, PerfectImage } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { Colors } from '@/shared/constants/designTokens';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthScreenProps {
  title: string;
  subtitle?: string;
  /**
   * Occhiello (eyebrow) sopra il titolo: maiuscoletto rosso brand spaziato che
   * nomina la pagina (es. "AREA DONATORI"). Dà gerarchia all'header e fa capire
   * a colpo d'occhio dove ci si trova; il titolo sotto porta il tono.
   */
  eyebrow?: string;
  /** Dimensione dell'occhiello (default 20). LoginScreen lo vuole più grande. */
  eyebrowSize?: number;
  /** Mostra il marchio brand in testa (default sì, per identità coerente). */
  showLogo?: boolean;
  /**
   * Layout "welcome" della landing (default no): hero in alto + azioni spinte
   * verso il basso da uno spacer flessibile, senza vuoto sopra il logo. NON
   * usare sui form lunghi: lo spacer spingerebbe i campi fuori dal viewport.
   */
  centerContent?: boolean;
  /** Dimensione del titolo (default 32). LoginScreen lo vuole più grande. */
  titleSize?: number;
  /** Centra verticalmente il contenuto (schermate corte senza tab bar, es. login). */
  verticalCenter?: boolean;
  children: React.ReactNode;
}

/** Layout condiviso delle schermate auth: safe area + scroll + tastiera + hero brand. */
export const AuthScreen: React.FC<AuthScreenProps> = ({
  title,
  subtitle,
  eyebrow,
  eyebrowSize = 20,
  showLogo = true,
  centerContent = false,
  titleSize = 32,
  verticalCenter = false,
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
            verticalCenter && styles.contentCentered,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Landing: gruppo hero+azioni COESO nel terzo superiore (spacer
              sopra piccolo + sotto grande). Niente vuoto sopra il logo né gap
              centrale; lo spazio residuo resta in fondo come padding naturale
              sopra la tab bar. Sui form gli spacer non vengono inseriti. */}
          {centerContent ? <View style={styles.heroSpacerTop} /> : null}
          <View style={[styles.header, verticalCenter && styles.headerSpaced]}>
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
            {eyebrow ? (
              <PerfectText size={eyebrowSize} lines={1} style={styles.eyebrow}>
                {eyebrow}
              </PerfectText>
            ) : null}
            <PerfectText size={titleSize} lines={2} style={styles.title}>
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
      paddingTop: PerfectSpacing.lg,
      // Stacco dalla tab bar in basso: i social non restano incollati al fondo.
      paddingBottom: PerfectSpacing.xl,
    },
    // Centra verticalmente il blocco quando la schermata è corta e a tutto
    // schermo (login senza tab bar): niente grande vuoto in fondo.
    contentCentered: {
      justifyContent: 'center',
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
      // Logo + occhiello + titolo centrati: pattern standard delle schermate
      // auth. Allineati a sinistra apparivano sbilanciati rispetto ai bottoni
      // full-width (logo "laterale", titolo storto a capo).
      alignItems: 'center',
    },
    // Login (verticalCenter): più stacco titolo→primo campo; col contenuto
    // centrato verticalmente questo alza anche il titolo nel viewport.
    headerSpaced: {
      marginBottom: PerfectSpacing['3xl'],
    },
    logo: {
      marginBottom: PerfectSpacing.base,
    },
    // Occhiello: maiuscoletto rosso brand, spaziato. Stesso rosso primary[500]
    // del CTA/link (coerenza: non una tonalità diversa dal resto dell'app).
    eyebrow: {
      color: Colors.primary[500],
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: scale(1.5),
      marginBottom: PerfectSpacing.xs,
    },
    title: {
      // Titolo scuro (il colore va bene): il calore/identità lo porta
      // l'occhiello rosso sopra. Tracking stretto come i titoli Home.
      color: colors.neutral[900],
      fontWeight: '800',
      letterSpacing: scale(-0.8),
      textAlign: 'center',
    },
    subtitle: {
      // Secondary text: grigio più morbido (non "secco") + line-height arioso;
      // contrasto AA mantenuto (neutral[500] su sfondo chiaro). A-capo bilanciato
      // via containerWidth sul PerfectText (niente orfano "impatto").
      color: colors.neutral[500],
      marginTop: PerfectSpacing.md,
      textAlign: 'center',
      letterSpacing: scale(0.2),
      lineHeight: scale(21),
    },
  });
