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
      {first ? null : <View style={styles.divider} />}
      <PerfectText size={13} lines={1} style={styles.title}>
        {title}
      </PerfectText>
      {children}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginTop: PerfectSpacing.base,
    },
    sectionFirst: {
      marginTop: 0,
    },
    // Intestazione di gruppo = etichetta di categoria: MAIUSCOLETTO scuro e
    // spaziato, distinto dalle label dei campi (title-case). NIENTE rosso: nel
    // resto dell'app il rosso brand marca gli elementi interattivi (CTA/link),
    // quindi un titolo rosso non-cliccabile confonde. La separazione tra gruppi
    // la dà il divider sopra, non il colore.
    title: {
      color: colors.neutral[900],
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: scale(1),
      marginBottom: PerfectSpacing.sm,
    },
    // Linea sottile che apre ogni gruppo (tranne il primo): separa le categorie
    // in modo strutturale, senza ricorrere al colore.
    divider: {
      height: scale(1),
      backgroundColor: colors.neutral[200],
      marginBottom: PerfectSpacing.base,
    },
  });
