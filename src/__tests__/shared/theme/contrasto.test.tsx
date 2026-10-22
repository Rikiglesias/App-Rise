// C50 (contratto android-play): il testo ha contrasto WCAG ≥ 4,5:1 sul suo fondo, in chiaro e in scuro.
// Il rapporto si calcola dai colori resi dai componenti; 4,5 è la soglia di WCAG 2.x per il testo normale.
import React from 'react';
import { render } from '@testing-library/react-native';

import { coloreDi, contrasto } from '@/__tests__/helpers/contrasto';
import { AuthDateField } from '@/features/auth/components/AuthDateField';
import { ActionCTAButtons } from '@/features/home/components/EntraInAzione/ActionCTAButtons';
import { TabBarButton } from '@/navigation/TabBarButton';
import { getAdaptiveColors } from '@/shared/theme/adaptiveColors';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

const AA = 4.5;
type Tema = 'light' | 'dark';
const TEMI: Tema[] = ['light', 'dark'];

const colori = (tema: Tema) => getAdaptiveColors(tema === 'dark');
const conTema = (tema: Tema, ui: React.ReactElement) =>
  render(
    <UniversalThemeProvider initialTheme={tema} followSystem={false}>
      {ui}
    </UniversalThemeProvider>
  );

// Fondo Android della barra delle schede (`TabBar.tsx`): bianco in chiaro, rgba(20, 20, 22, 0.97) in scuro.
const FONDO_BARRA: Record<Tema, string> = { light: '#FFFFFF', dark: '#141416' };

const campoData = (tema: Tema, props: { value: string; error?: string }) =>
  conTema(
    tema,
    <AuthDateField
      label="Data di nascita"
      placeholder="GG/MM/AAAA"
      onChange={() => undefined}
      {...props}
    />
  );

const segnapostoDellaData = (tema: Tema) => {
  const ui = campoData(tema, { value: '' });
  // Il campo ha il fondo `neutral[0]` del tema.
  return contrasto(
    coloreDi(ui.getByText('GG/MM/AAAA')),
    colori(tema).neutral[0]
  );
};

const testoSulFondo = (tema: Tema) => {
  const c = colori(tema);
  return [c.neutral[0], c.neutral[50]].flatMap(fondo =>
    [c.neutral[900], c.neutral[600]].map(testo => contrasto(testo, fondo))
  );
};

describe('contrasto del testo', () => {
  it('contrasto: errore in tema scuro', () => {
    const ui = campoData('dark', { value: '', error: 'Data non valida' });
    // Le schermate di accesso hanno il fondo `neutral[50]` (`AuthScreen`).
    expect(
      contrasto(
        coloreDi(ui.getByText('Data non valida')),
        colori('dark').neutral[50]
      )
    ).toBeGreaterThanOrEqual(AA);
  });

  it('contrasto: Dona e aiuta', () => {
    for (const tema of TEMI) {
      const ui = conTema(tema, <ActionCTAButtons />);
      for (const id of ['cta-donate-label', 'cta-donate-sub']) {
        expect(
          contrasto(coloreDi(ui.getByTestId(id)), colori(tema).neutral[0])
        ).toBeGreaterThanOrEqual(AA);
      }
    }
  });

  it('contrasto: etichetta della scheda Azioni', () => {
    for (const tema of TEMI) {
      const ui = conTema(
        tema,
        <TabBarButton
          isFocused={false}
          isCentral
          options={{ tabBarAccessibilityLabel: 'Azioni' }}
          onPress={() => undefined}
          onLongPress={() => undefined}
          routeName="InfoTab"
        />
      );
      expect(
        contrasto(coloreDi(ui.getByText('Azioni')), FONDO_BARRA[tema])
      ).toBeGreaterThanOrEqual(AA);
    }
  });

  it('contrasto: segnaposto della data in chiaro', () => {
    expect(segnapostoDellaData('light')).toBeGreaterThanOrEqual(AA);
  });

  it('contrasto: segnaposto della data in scuro', () => {
    expect(segnapostoDellaData('dark')).toBeGreaterThanOrEqual(AA);
  });

  it('contrasto: testo primario e secondario in chiaro', () => {
    for (const r of testoSulFondo('light'))
      expect(r).toBeGreaterThanOrEqual(AA);
  });

  it('contrasto: testo primario e secondario in scuro', () => {
    for (const r of testoSulFondo('dark')) expect(r).toBeGreaterThanOrEqual(AA);
  });
});
