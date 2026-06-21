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
}

/** Raggruppa campi correlati sotto un'etichetta-sezione (eyebrow), come nel resto dell'app. */
export const AuthSection: React.FC<AuthSectionProps> = ({
  title,
  children,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.section}>
      <PerfectText size={12} lines={1} style={styles.title}>
        {title}
      </PerfectText>
      {children}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    section: {
      marginTop: PerfectSpacing.lg,
    },
    title: {
      color: colors.neutral[500],
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: scale(0.5),
      marginBottom: PerfectSpacing.sm,
    },
  });
