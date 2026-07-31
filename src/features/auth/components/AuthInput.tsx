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
  /**
   * Riscontro sotto il campo che NON è un errore: «Controllo…», «Libero», «non
   * verificabile». Nasce per la disponibilità del nickname (migration 0018), dove
   * l'esito buono e l'esito incerto vanno detti quanto quello cattivo — ma dirli in
   * rosso, con `error`, farebbe leggere «Libero» come un problema.
   * L'errore ha la precedenza: quando c'è, il suggerimento non si mostra.
   */
  hint?: string | undefined;
  /** Tono del suggerimento: informativo (default), esito positivo, o incertezza. */
  hintTone?: 'neutral' | 'positive' | 'warning';
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
export const AuthInput = forwardRef<TextInput, AuthInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      error,
      hint,
      hintTone = 'neutral',
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

    // Stessa cosa per il suggerimento, e per la stessa ragione: `accessibilityLiveRegion`
    // sotto funziona SOLO su Android, quindi senza questa riga chi usa VoiceOver non
    // saprebbe mai che il nickname scelto è già di qualcun altro. Non si annuncia mentre
    // l'errore è a schermo (lì il messaggio mostrato è l'altro), e il tono `neutral` —
    // cioè «Controllo…» — resta muto: annunciare un'attesa a ogni pausa di digitazione
    // sarebbe rumore, non informazione.
    useEffect(() => {
      if (!error && hint && hintTone !== 'neutral') {
        AccessibilityInfo.announceForAccessibility(hint);
      }
    }, [error, hint, hintTone]);

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
        ) : hint ? (
          // `polite` e non `assertive`: un riscontro che arriva mentre si scrive non
          // deve interrompere lo screen reader a metà parola, come farebbe un errore.
          <View accessibilityLiveRegion="polite">
            <PerfectText size={13} lines={2} style={styles[hintTone]}>
              {hint}
            </PerfectText>
          </View>
        ) : null}
      </View>
    );
  }
);

AuthInput.displayName = 'AuthInput';

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
    // I tre toni del suggerimento. Stessa metrica dell'errore, colore diverso: sotto il
    // campo la posizione è la stessa, quindi a distinguerli deve bastare il colore.
    neutral: {
      color: colors.neutral[600],
      marginTop: PerfectSpacing.xs,
    },
    positive: {
      color: Colors.semantic.success.dark,
      marginTop: PerfectSpacing.xs,
    },
    warning: {
      color: Colors.semantic.warning.dark,
      marginTop: PerfectSpacing.xs,
    },
  });
