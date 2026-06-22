import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import CountrySelect, {
  getCountryByCca2,
  type ICountry,
  type ICountryCca2,
} from 'rn-country-select';

import { PerfectText, PlatformTouchable } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';
import type { ThemeColors } from '@/shared/theme/adaptiveColors';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type { SupportedLocale } from '@/locales';

interface AuthCountryFieldProps {
  label: string;
  /** Codice ISO 3166-1 alpha-2 corrente (es. 'IT'). */
  value: string;
  onSelect: (code: string) => void;
  error?: string | undefined;
}

const LANG_KEY: Record<SupportedLocale, 'ita' | 'eng'> = {
  it: 'ita',
  en: 'eng',
};

const localizedName = (
  c: ICountry | undefined,
  locale: SupportedLocale
): string =>
  c?.translations?.[LANG_KEY[locale]]?.common ?? c?.name?.common ?? '';

/**
 * Campo Paese: riga touchable (bandiera + nome localizzato) che apre il picker
 * `CountrySelect` (stessa UX del selettore paese del campo telefono). Persistito
 * il `cca2`. Italia in cima alla lista (caso comune: donatori italiani).
 */
export const AuthCountryField: React.FC<AuthCountryFieldProps> = ({
  label,
  value,
  onSelect,
  error,
}) => {
  const colors = useThemeColors();
  const { isDark } = useUniversalTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { locale } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = getCountryByCca2(value as ICountryCca2);

  return (
    <View style={styles.wrap}>
      <PerfectText size={16} lines={1} style={styles.label}>
        {label}
      </PerfectText>
      <PlatformTouchable
        testID="country-field"
        onPress={(): void => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[styles.inputRow, error ? styles.inputRowError : null]}
      >
        <PerfectText size={16} lines={1} style={styles.valueText}>
          {current ? `${current.flag}  ${localizedName(current, locale)}` : ''}
        </PerfectText>
        <PerfectText size={16} lines={1} style={styles.chevron}>
          {'⌄'}
        </PerfectText>
      </PlatformTouchable>
      <CountrySelect
        visible={open}
        onClose={(): void => setOpen(false)}
        language={locale}
        popularCountries={['IT']}
        modalType="bottomSheet"
        theme={isDark ? 'dark' : 'light'}
        onSelect={(c: ICountry): void => {
          onSelect(c.cca2);
          setOpen(false);
        }}
      />
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
    wrap: { marginBottom: PerfectSpacing.base },
    label: {
      color: colors.neutral[700],
      fontWeight: '600',
      marginBottom: PerfectSpacing.xs,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.neutral[0],
      borderWidth: scale(1),
      borderColor: colors.neutral[200],
      borderRadius: scale(12),
      paddingHorizontal: PerfectSpacing.base,
      paddingVertical: PerfectSpacing.sm,
    },
    inputRowError: { borderColor: Colors.semantic.error.main },
    valueText: { color: colors.neutral[900] },
    chevron: { color: colors.neutral[500] },
    error: { color: Colors.semantic.error.main, marginTop: PerfectSpacing.xs },
  });
