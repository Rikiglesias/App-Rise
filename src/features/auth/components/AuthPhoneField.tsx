import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import PhoneInput, {
  type ICountry,
  getCountryByCca2,
} from 'rn-international-phone-number';
import type { ICountryCca2, ICountrySelectStyle } from 'rn-country-select';

import { PerfectText } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';

interface AuthPhoneFieldProps {
  label: string;
  /** Riceve la stringa completa "<prefisso> <numero>" (es. "+39 333 1234567"). */
  onChangeText: (fullPhone: string) => void;
  error?: string | undefined;
}

// Italia in cima al selettore (caso comune: donatori italiani); il resto della
// lista resta in ordine alfabetico.
const POPULAR_COUNTRIES: ICountryCca2[] = ['IT'];

// Backdrop trasparente ma CLICCABILE: nessun velo grigio a tutta pagina, ma un
// tap in qualunque punto fuori dal pop-up lo chiude (oltre alla X). Si ottiene
// non rimuovendo il backdrop (altrimenti la lib lo disabilita) e sovrascrivendo
// solo il suo colore di sfondo a 'transparent'.
const MODAL_STYLES: ICountrySelectStyle = {
  backdrop: { backgroundColor: 'transparent' },
};

/**
 * Prefisso internazionale da ICountry: `idd.root` + suffisso quando è unico
 * (Italia: "+3"+"9" = "+39"); per i paesi con più suffissi (es. USA "+1") si usa
 * solo la root, che è il vero calling code.
 */
const buildCallingCode = (c: ICountry | null): string => {
  const root = c?.idd?.root;
  if (!root) return '';
  const suffixes = c?.idd?.suffixes ?? [];
  return suffixes.length === 1 ? `${root}${suffixes[0]}` : root;
};

/**
 * Campo telefono con selettore prefisso/paese (default Italia). Lo stato di
 * numero e paese è interno; al form arriva solo la stringa completa col prefisso,
 * coerente col contratto string del campo (come AuthInput).
 */
export const AuthPhoneField: React.FC<AuthPhoneFieldProps> = ({
  label,
  onChangeText,
  error,
}) => {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [number, setNumber] = useState('');
  const [country, setCountry] = useState<ICountry | null>(
    () => getCountryByCca2('IT') ?? null
  );

  const emit = (num: string, c: ICountry | null): void => {
    const code = buildCallingCode(c);
    // E.164 senza spazi ("+<cifre>"): è il formato richiesto da validatePhoneIT.
    // `num` è il numero nazionale formattato dalla libreria → ne prendo le cifre.
    const digits = num.replace(/\D/g, '');
    onChangeText(digits ? `${code}${digits}` : '');
  };

  // Stili theme-aware per allineare il campo agli altri input (sfondo/bordo/radius
  // del tema): la libreria di default usa un campo bianco fisso, che in dark mode
  // stonerebbe con gli altri campi scuri.
  const phoneStyles = useMemo(
    () => ({
      container: {
        backgroundColor: colors.neutral[0],
        borderWidth: scale(1),
        borderColor: colors.neutral[200],
        borderRadius: scale(12),
      },
      flagContainer: { backgroundColor: 'transparent' as const },
      input: { color: colors.neutral[900] },
      callingCode: { color: colors.neutral[900] },
      caret: { color: colors.neutral[500] },
    }),
    [colors]
  );

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <PhoneInput
        value={number}
        defaultCountry="IT"
        country={country}
        accessibilityLabelPhoneInput={label}
        phoneInputStyles={phoneStyles}
        popularCountries={POPULAR_COUNTRIES}
        modalType="bottomSheet"
        initialBottomsheetHeight="75%"
        minBottomsheetHeight="75%"
        maxBottomsheetHeight="75%"
        showModalAlphabetFilter={false}
        modalStyles={MODAL_STYLES}
        showModalCloseButton
        onChangePhoneNumber={(num: string): void => {
          setNumber(num);
          emit(num, country);
        }}
        onChangeCountry={(c: ICountry): void => {
          setCountry(c);
          emit(number, c);
        }}
      />
      {error ? (
        <PerfectText size={13} lines={2} style={styles.error}>
          {error}
        </PerfectText>
      ) : null}
    </View>
  );
};

const createStyles = (_colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      marginBottom: PerfectSpacing.base,
    },
    label: {
      color: _colors.neutral[700],
      fontWeight: '600',
      marginBottom: PerfectSpacing.xs,
    },
    error: {
      color: Colors.semantic.error.main,
      marginTop: PerfectSpacing.xs,
    },
  });
