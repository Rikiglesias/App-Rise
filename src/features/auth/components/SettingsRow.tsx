import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText, PlatformTouchable, PerfectIcon } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

/**
 * Contenitore "card" della lista impostazioni (stile raggruppato iOS): sfondo
 * pieno, angoli arrotondati e bordo tenue attorno a un gruppo di `SettingsRow`.
 * Le righe portano il divisore interno; la card cura solo la cornice.
 */
export const SettingsGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.group}>{children}</View>;
};

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  /** Testo secondario sotto la label (es. stato corrente della voce). */
  subtitle?: string;
  /** Azione irreversibile (es. Elimina account): label in rosso semantico. */
  destructive?: boolean;
  /** Divisore inferiore inset: presente su tutte le righe tranne l'ultima del gruppo. */
  showDivider?: boolean;
  accessibilityHint?: string;
}

/**
 * Riga della lista impostazioni: label (+ sottotitolo) a sinistra, chevron a
 * destra, tap che apre la sotto-pagina dedicata. È il vocabolario di navigazione
 * del profilo — ogni riga porta a un dominio reale (Consensi, Privacy, Elimina),
 * non è decorazione.
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  onPress,
  subtitle,
  destructive = false,
  showDivider = false,
  accessibilityHint,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labelColor = destructive
    ? Colors.semantic.error.main
    : colors.neutral[900];

  return (
    <PlatformTouchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      activeOpacity={0.6}
    >
      <View style={styles.rowInner}>
        <View style={styles.texts}>
          <PerfectText
            size={16}
            lines={1}
            style={[styles.label, { color: labelColor }]}
          >
            {label}
          </PerfectText>
          {subtitle ? (
            <PerfectText size={13} lines={1} style={styles.subtitle}>
              {subtitle}
            </PerfectText>
          ) : null}
        </View>
        <PerfectIcon
          name="chevron-right"
          size={22}
          color={colors.neutral[400]}
        />
      </View>
      {showDivider ? <View style={styles.divider} /> : null}
    </PlatformTouchable>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    group: {
      backgroundColor: colors.neutral[0],
      borderRadius: scale(14),
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      overflow: 'hidden',
    },
    rowInner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: scale(52),
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.md,
    },
    texts: {
      flex: 1,
      marginRight: PerfectSpacing.base,
    },
    label: {
      fontWeight: '600',
    },
    subtitle: {
      color: colors.neutral[500],
      marginTop: scale(2),
    },
    // Divisore inset stile iOS: parte dopo il padding sinistro, non a tutta larghezza.
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.neutral[200],
      marginLeft: PerfectSpacing.base,
    },
  });
