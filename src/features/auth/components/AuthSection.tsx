import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthSectionProps {
  title: string;
  children: React.ReactNode;
  /**
   * Prima sezione della schermata: azzera il margine superiore. Il gap del titolo
   * (header `xl`) fa già da stacco; senza questo, header `xl` + sezione `lg` =
   * stacco doppio titolo→primo campo, incoerente con Login (solo `xl`).
   */
  first?: boolean;
}

/** Raggruppa campi correlati sotto un'etichetta-sezione (eyebrow), come nel resto dell'app. */
export const AuthSection: React.FC<AuthSectionProps> = ({
  title,
  children,
  first = false,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.section, first ? styles.sectionFirst : null]}>
      <PerfectText size={18} lines={1} style={styles.title}>
        {title}
      </PerfectText>
      {children}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginTop: PerfectSpacing.xl,
    },
    sectionFirst: {
      marginTop: 0,
    },
    // Intestazione di gruppo come vero sotto-titolo: più grande delle label dei
    // campi (18 > 16) e in rosso brand (primary[500], theme-aware come AuthInput
    // e AuthConsentCheckbox), così la gerarchia "gruppo > campo" è leggibile e i
    // gruppi sono riconoscibili a colpo d'occhio.
    title: {
      color: colors.primary[500],
      fontWeight: '700',
      letterSpacing: scale(-0.3),
      marginBottom: PerfectSpacing.base,
    },
  });
