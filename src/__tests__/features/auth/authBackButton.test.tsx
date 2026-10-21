/**
 * «Indietro» delle pagine dell'account (AuthScreen lo monta su tutte): l'etichetta deve
 * restare leggibile anche in tema scuro, come la freccia accanto.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { render, within } from '@testing-library/react-native';

import { AuthBackButton } from '@/features/auth/components/AuthBackButton';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { useThemeColors } from '@/shared/hooks/useThemeColors';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: jest.fn(), canGoBack: () => true }),
}));

// Rapporto di contrasto WCAG 2.x fra due colori #RRGGBB.
const channel = (hex: string, at: number) => {
  const c = parseInt(hex.slice(at, at + 2), 16) / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminance = (hex: string) =>
  0.2126 * channel(hex, 1) +
  0.7152 * channel(hex, 3) +
  0.0722 * channel(hex, 5);
const contrast = (a: string, b: string) => {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

beforeEach(() => {
  i18n.locale = 'it';
});

it('indietro leggibile in chiaro e in scuro', () => {
  for (const theme of ['light', 'dark'] as const) {
    let background = '';
    const Background = () => {
      // Lo sfondo di AuthScreen, su cui il pulsante sta.
      background = useThemeColors().neutral[50];
      return null;
    };
    const ui = render(
      <UniversalThemeProvider initialTheme={theme} followSystem={false}>
        <ThemeProvider>
          <Background />
          <AuthBackButton />
        </ThemeProvider>
      </UniversalThemeProvider>
    );
    const button = ui.getByRole('button', { name: 'Indietro' });
    const label = StyleSheet.flatten(
      within(button).getByText('Indietro').props.style
    ).color as string;
    const arrow = within(button).UNSAFE_getByProps({ name: 'arrow-left' });

    expect(label).toMatch(/^#[0-9A-Fa-f]{6}$/);
    expect(label).toBe(arrow.props.color);
    expect(contrast(label, background)).toBeGreaterThanOrEqual(4.5);
    ui.unmount();
  }
});
