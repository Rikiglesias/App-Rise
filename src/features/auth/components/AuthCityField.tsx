import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  type LayoutChangeEvent,
} from 'react-native';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { searchComuni, type Comune } from '@/shared/data/comuni';

interface AuthCityFieldProps {
  label: string;
  /** Città corrente (controllata dal form). */
  value: string;
  /** Digitazione libera: il form aggiorna la città e azzera la provincia derivata. */
  onChangeCity: (city: string) => void;
  /** Selezione di un comune dal dropdown: città + sigla provincia insieme. */
  onSelectComune: (city: string, provinceSigla: string) => void;
  error?: string | undefined;
  placeholder?: string;
}

/** Chiude il dropdown poco dopo il blur, lasciando registrare l'eventuale tap su un'opzione. */
const BLUR_CLOSE_MS = 150;

/**
 * Campo Città con autocomplete sui comuni italiani. Il dropdown è INLINE (spinge
 * il contenuto, come AuthDateField) per evitare il clipping di un overlay assoluto
 * dentro lo ScrollView del form su Android. Alla selezione di un comune emette
 * città + sigla provincia, così il campo Provincia si auto-compila.
 */
export const AuthCityField: React.FC<AuthCityFieldProps> = ({
  label,
  value,
  onChangeCity,
  onSelectComune,
  error,
  placeholder,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  // Evita la riapertura del dropdown sul focus subito dopo una selezione.
  const justSelected = useRef(false);
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pulisce il timer di chiusura allo smontaggio (no leak / no setState post-unmount).
  useEffect(
    () => () => {
      if (blurTimer.current) clearTimeout(blurTimer.current);
    },
    []
  );

  const suggestions = useMemo<Comune[]>(() => searchComuni(value), [value]);
  const showDropdown = open && suggestions.length > 0;

  const handleChange = (text: string): void => {
    justSelected.current = false;
    onChangeCity(text);
    setOpen(true);
  };

  const handleSelect = (c: Comune): void => {
    justSelected.current = true;
    if (blurTimer.current) clearTimeout(blurTimer.current);
    onSelectComune(c.nome, c.sigla);
    setOpen(false);
    Keyboard.dismiss();
  };

  const handleFocus = (): void => {
    setFocused(true);
    if (!justSelected.current) setOpen(true);
  };

  const handleBlur = (): void => {
    setFocused(false);
    blurTimer.current = setTimeout(() => setOpen(false), BLUR_CLOSE_MS);
  };

  // Larghezza del campo per dimensionare il dropdown coerentemente.
  const [fieldWidth, setFieldWidth] = useState(0);
  const onFieldLayout = (e: LayoutChangeEvent): void =>
    setFieldWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <View
        onLayout={onFieldLayout}
        style={[
          styles.inputRow,
          focused ? styles.inputRowFocused : null,
          error ? styles.inputRowError : null,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCapitalize="words"
          autoComplete="postal-address-locality"
          textContentType="addressCity"
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[500]}
          accessibilityLabel={label}
        />
      </View>
      {showDropdown ? (
        <View
          style={[styles.dropdown, fieldWidth ? { width: fieldWidth } : null]}
        >
          {suggestions.map((c, i) => (
            <PlatformTouchable
              key={`${c.nome}-${c.sigla}`}
              testID={`city-option-${i}`}
              onPress={(): void => handleSelect(c)}
              accessibilityRole="button"
              accessibilityLabel={`${c.nome} (${c.sigla})`}
              style={[
                styles.option,
                i < suggestions.length - 1 ? styles.optionDivider : null,
              ]}
            >
              <PerfectText size={16} lines={1} style={styles.optionName}>
                {c.nome}
              </PerfectText>
              <PerfectText size={13} lines={1} style={styles.optionProvince}>
                {`${c.provincia} (${c.sigla})`}
              </PerfectText>
            </PlatformTouchable>
          ))}
        </View>
      ) : null}
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
    // Dropdown inline: card sotto il campo, scostata di poco. Spinge il contenuto
    // del form (niente overlay assoluto → niente clipping nello ScrollView).
    dropdown: {
      marginTop: PerfectSpacing.xs,
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      overflow: 'hidden',
    },
    option: {
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.sm + scale(2),
    },
    optionDivider: {
      borderBottomWidth: scale(1),
      borderBottomColor: colors.neutral[100],
    },
    optionName: {
      color: colors.neutral[900],
    },
    optionProvince: {
      color: colors.neutral[500],
      marginTop: scale(1),
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
