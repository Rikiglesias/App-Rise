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
      <PerfectText size={15} lines={1} style={styles.title}>
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
    // Intestazione di categoria: MAIUSCOLETTO rosso brand spaziato + divider
    // sopra. Il rosso dà calore/identità; per non confonderlo con un elemento
    // cliccabile la regola è: SOLO i link sono SOTTOLINEATI (vedi il link privacy).
    // Quindi rosso non-sottolineato = etichetta, rosso sottolineato = link.
    title: {
      color: colors.primary[500],
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
