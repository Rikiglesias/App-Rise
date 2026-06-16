import React, { useMemo, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  type KeyboardTypeOptions,
} from 'react-native';

import { PerfectText, PerfectIcon, PlatformTouchable } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';

interface AuthInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string | undefined;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  placeholder,
}) => {
  const colors = useThemeColors();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // Per i campi password: nasconde di default, l'occhio rivela/ri-nasconde.
  const [revealed, setRevealed] = useState(false);
  const toggleReveal = (): void => setRevealed(v => !v);

  return (
    <View style={styles.wrap}>
      <PerfectText size={14} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !revealed}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[400]}
          accessibilityLabel={label}
        />
        {secureTextEntry ? (
          <PlatformTouchable
            onPress={toggleReveal}
            accessibilityRole="button"
            accessibilityLabel={t(
              revealed ? 'auth.a11y.hidePassword' : 'auth.a11y.showPassword'
            )}
            style={styles.toggle}
          >
            <PerfectIcon
              name={revealed ? 'eye-off' : 'eye'}
              size={22}
              color={colors.neutral[500]}
            />
          </PlatformTouchable>
        ) : null}
      </View>
      {error ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
    </View>
  );
};

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginBottom: PerfectSpacing.base,
    },
    label: {
      color: colors.neutral[700],
      fontWeight: '600',
      marginBottom: PerfectSpacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      paddingHorizontal: PerfectSpacing.base,
    },
    inputRowError: {
      borderColor: Colors.semantic.error.main,
    },
    input: {
      flex: 1,
      paddingVertical: PerfectSpacing.sm,
      color: colors.neutral[900],
      fontSize: scale(16),
    },
    toggle: {
      paddingLeft: PerfectSpacing.sm,
      paddingVertical: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
