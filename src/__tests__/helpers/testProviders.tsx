import React from 'react';
import { ThemeProvider } from '../../shared/hooks/useTheme';
import { UniversalThemeProvider } from '../../shared/theme/UniversalTheme';
import { AuthProvider } from '../../shared/auth/AuthContext';
import i18n from '../../locales';

// Forza lingua italiana per tutti i test per garantire consistenza
i18n.locale = 'it';

/**
 * Wrapper con tutti i provider necessari per i test
 * Usa questo per wrappare i componenti nei test
 */
export const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <UniversalThemeProvider>
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  </UniversalThemeProvider>
);

/**
 * Helper per render con provider
 */
export const renderWithProviders = (
  component: React.ReactElement,
  render: any
) => {
  return render(<AllProviders>{component}</AllProviders>);
};
