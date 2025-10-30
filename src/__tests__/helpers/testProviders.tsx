import React from 'react';
import { ThemeProvider } from '../../shared/hooks/useTheme';
import { UniversalThemeProvider } from '../../shared/theme/UniversalTheme';

/**
 * Wrapper con tutti i provider necessari per i test
 * Usa questo per wrappare i componenti nei test
 */
export const AllProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <UniversalThemeProvider>
    <ThemeProvider>{children}</ThemeProvider>
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
