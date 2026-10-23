/**
 * Il rimando tenue delle schermate di accesso («Password dimenticata?», variante `linkMuted` di
 * AuthButton) resta leggibile nei due temi: almeno 4,5:1 sui fondi delle schermate di accesso.
 * Prima il grigio era fisso del tema chiaro (`#737373`): in scuro ~3,8:1 su `neutral[50]`.
 */
import React from 'react';
import { render } from '@testing-library/react-native';

import { coloreDi, contrasto } from '@/__tests__/helpers/contrasto';
import { AuthButton } from '@/features/auth/components/AuthButton';
import { getAdaptiveColors } from '@/shared/theme/adaptiveColors';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

const AA = 4.5;
type Tema = 'light' | 'dark';

const rimandoTenue = (tema: Tema) =>
  render(
    <UniversalThemeProvider initialTheme={tema} followSystem={false}>
      <AuthButton
        label="Password dimenticata?"
        onPress={() => undefined}
        variant="linkMuted"
      />
    </UniversalThemeProvider>
  );

const contrastoSuiFondi = (tema: Tema) => {
  const c = getAdaptiveColors(tema === 'dark');
  const colore = coloreDi(
    rimandoTenue(tema).getByText('Password dimenticata?')
  );
  // `AuthScreen` usa `neutral[50]`; i campi e le schede `neutral[0]`.
  return Math.min(
    contrasto(colore, c.neutral[0]),
    contrasto(colore, c.neutral[50])
  );
};

describe('rimando tenue delle schermate di accesso', () => {
  it('contrasto: rimando tenue in chiaro', () => {
    expect(contrastoSuiFondi('light')).toBeGreaterThanOrEqual(AA);
  });

  it('contrasto: rimando tenue in scuro', () => {
    expect(contrastoSuiFondi('dark')).toBeGreaterThanOrEqual(AA);
  });
});
