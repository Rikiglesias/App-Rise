import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { PerfectText, PerfectIcon, PlatformTouchable } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  error?: string | undefined;
}

/** Checkbox di consenso condivisa (privacy/marketing) — usata da SignUp e CompleteProfile. */
export const AuthConsentCheckbox: React.FC<AuthConsentCheckboxProps> = ({
  checked,
  onToggle,
  label,
  error,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View>
      <PlatformTouchable
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={styles.row}
      >
        <PerfectIcon
          name={checked ? 'checkbox-marked' : 'checkbox-blank-outline'}
          size={24}
          color={checked ? colors.primary[500] : colors.neutral[400]}
        />
        <PerfectText size={14} lines={3} style={styles.label}>
          {label}
        </PerfectText>
      </PlatformTouchable>
      {error ? (
        <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
          <PerfectText size={13} lines={2} style={styles.error}>
            {error}
          </PerfectText>
        </View>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: PerfectSpacing.sm,
      marginTop: PerfectSpacing.sm,
    },
    label: {
      color: colors.neutral[700],
      flex: 1,
    },
    error: {
      color: colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
