import React, { useMemo, useState } from 'react';
import { Platform, View, StyleSheet, Pressable } from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthDateFieldProps {
  label: string;
  /** Valore ISO `YYYY-MM-DD` ('' se non ancora selezionato). */
  value: string;
  onChange: (isoDate: string) => void;
  error?: string | undefined;
  /** Testo mostrato quando nessuna data è selezionata. */
  placeholder?: string;
}

/** Date → `YYYY-MM-DD` usando i componenti locali (no toISOString → niente shift UTC). */
const toISODate = (d: Date): string => {
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

/** ISO `YYYY-MM-DD` → `GG/MM/AAAA` per la visualizzazione (formato italiano). */
const toDisplayDate = (iso: string): string => {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${d}/${m}/${y}` : iso;
};

/**
 * Campo data con date picker nativo (sostituisce l'input testuale AAAA-MM-GG).
 * Espone/riceve sempre una stringa ISO `YYYY-MM-DD`, così resta compatibile con
 * la validazione (validateAdult) e con il payload del profilo (birth_date).
 */
export const AuthDateField: React.FC<AuthDateFieldProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  // Data iniziale del picker: il valore valido corrente, altrimenti 18 anni fa
  // (default sensato per i donatori, riduce lo scroll).
  const pickerDate = useMemo(() => {
    const parsed = new Date(value);
    if (value && !Number.isNaN(parsed.getTime())) return parsed;
    const fallback = new Date();
    fallback.setFullYear(fallback.getFullYear() - 18);
    return fallback;
  }, [value]);

  const handleChange = (event: DateTimePickerEvent, date?: Date): void => {
    // Android chiude il dialog da sé; iOS lo mantiene inline finché non lo togliamo.
    setOpen(Platform.OS === 'ios');
    if (event.type === 'dismissed') {
      setOpen(false);
      return;
    }
    if (date) onChange(toISODate(date));
  };

  // Il rullo (spinner) compare INLINE sotto il campo (niente pop-up/Modal).
  const picker = (
    <DateTimePicker
      value={pickerDate}
      mode="date"
      display="spinner"
      locale="it-IT"
      maximumDate={new Date()}
      onChange={handleChange}
    />
  );

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <PlatformTouchable
        onPress={() => setOpen(o => !o)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.field, error ? styles.fieldError : null]}
      >
        <PerfectText
          size={16}
          lines={1}
          style={value ? styles.value : styles.placeholder}
        >
          {value ? toDisplayDate(value) : placeholder || ''}
        </PerfectText>
      </PlatformTouchable>
      {open ? (
        <>
          {/* Overlay invisibile a tutto schermo: un tap in QUALSIASI punto fuori
              dal rullo lo chiude. Reso PRIMA del picker → il rullo resta sopra e
              scorribile, mentre il resto della pagina chiude al tocco. */}
          <Pressable
            style={styles.dismissOverlay}
            onPress={() => setOpen(false)}
            accessibilityLabel="Chiudi selezione data"
          />
          {picker}
        </>
      ) : null}
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
    field: {
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      paddingHorizontal: PerfectSpacing.base,
      // Altezza uniforme a tutti gli altri campi della pagina.
      minHeight: scale(48),
      justifyContent: 'center',
    },
    fieldError: {
      borderColor: Colors.semantic.error.main,
    },
    value: {
      color: colors.neutral[900],
    },
    placeholder: {
      color: colors.neutral[400],
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
    // Overlay invisibile esteso ben oltre il campo in ogni direzione: copre la
    // pagina visibile così un tap ovunque (fuori dal rullo) chiude il picker,
    // senza il look di un pop-up. Il rullo, reso dopo, resta sopra e scorribile.
    dismissOverlay: {
      position: 'absolute',
      top: -1000,
      left: -1000,
      right: -1000,
      bottom: -1000,
    },
  });
