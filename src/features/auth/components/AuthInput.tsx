import React, { forwardRef, useEffect, useMemo, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  AccessibilityInfo,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
  type TextInputProps,
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
  /** Opzionale: un campo non modificabile (editable=false) non ne ha bisogno. */
  onChangeText?: (v: string) => void;
  error?: string | undefined;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  placeholder?: string;
  /** Campo non modificabile (es. Provincia auto-compilata dalla città). */
  editable?: boolean;
  /** Abilita l'autofill dei password manager (iOS/Android). */
  autoComplete?: TextInputProps['autoComplete'];
  textContentType?: TextInputProps['textContentType'];
  /** 'next' per saltare al campo seguente, 'done'/'go' sull'ultimo. */
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
}

/**
 * Input auth condiviso: label + campo + toggle password + errore.
 * `forwardRef` espone il TextInput per la navigazione campo→campo (focus chaining).
 */
const AuthInputImpl = forwardRef<TextInput, AuthInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      secureTextEntry = false,
      keyboardType = 'default',
      autoCapitalize = 'sentences',
      placeholder,
      editable = true,
      autoComplete,
      textContentType,
      returnKeyType,
      onSubmitEditing,
    },
    ref
  ) => {
    const colors = useThemeColors();
    const { t } = useTranslation();
    const styles = useMemo(() => createStyles(colors), [colors]);
    // Per i campi password: nasconde di default, l'occhio rivela/ri-nasconde.
    const [revealed, setRevealed] = useState(false);
    const [focused, setFocused] = useState(false);
    const toggleReveal = (): void => setRevealed(v => !v);

    // Annuncia l'errore allo screen reader quando compare (iOS + Android).
    useEffect(() => {
      if (error) AccessibilityInfo.announceForAccessibility(error);
    }, [error]);

    return (
      <View style={styles.wrap}>
        <PerfectText size={16} lines={1} style={styles.label}>
          {label}
        </PerfectText>
        <View
          style={[
            styles.inputRow,
            !editable ? styles.inputRowReadonly : null,
            focused ? styles.inputRowFocused : null,
            error ? styles.inputRowError : null,
          ]}
        >
          <TextInput
            ref={ref}
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            onFocus={(): void => setFocused(true)}
            onBlur={(): void => setFocused(false)}
            secureTextEntry={secureTextEntry && !revealed}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoComplete={autoComplete}
            textContentType={textContentType}
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
            blurOnSubmit={returnKeyType !== 'next'}
            placeholder={placeholder}
            placeholderTextColor={colors.neutral[500]}
            accessibilityLabel={label}
          />
          {secureTextEntry ? (
            <PlatformTouchable
              onPress={toggleReveal}
              accessibilityRole="button"
              accessibilityLabel={t(
                revealed ? 'auth.a11y.hidePassword' : 'auth.a11y.showPassword'
              )}
              hitSlop={{
                top: scale(8),
                bottom: scale(8),
                left: scale(8),
                right: scale(8),
              }}
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
          <View accessibilityLiveRegion="assertive" accessibilityRole="alert">
            <PerfectText size={13} lines={2} style={styles.error}>
              {error}
            </PerfectText>
          </View>
        ) : null}
      </View>
    );
  }
);

AuthInputImpl.displayName = 'AuthInput';

// React.memo: props stabili → digitare in un campo non ri-renderizza i fratelli (finding 131).
export const AuthInput = React.memo(AuthInputImpl);

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
      // Altezza uniforme per TUTTI i campi della pagina (input/date/città/paese/tel).
      minHeight: scale(48),
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      paddingHorizontal: PerfectSpacing.base,
    },
    // Campo non modificabile (Provincia auto-compilata): sfondo attenuato che
    // comunica "sola lettura", senza il focus/caret di un campo editabile.
    inputRowReadonly: {
      backgroundColor: colors.neutral[100],
    },
    inputRowFocused: {
      borderColor: colors.primary[500],
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
