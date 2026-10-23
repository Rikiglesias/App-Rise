// C50 (contratto android-play): il testo ha contrasto WCAG ≥ 4,5:1 sul suo fondo, in chiaro e in scuro.
// Il rapporto si calcola dai colori resi dai componenti; 4,5 è la soglia di WCAG 2.x per il testo normale.
import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import React from 'react';
import { render } from '@testing-library/react-native';

import { coloreDi, contrasto } from '@/__tests__/helpers/contrasto';
import { AuthConsentCheckbox } from '@/features/auth/components/AuthConsentCheckbox';
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

// Gemelli di C50: un colore semantico pieno (main/dark/light) usato come testo resta sotto 4,5:1 in uno dei
// due temi; il testo usa `semantic.*.text`, che il tema scuro schiarisce. Bordi, fondi e icone restano fuori.
const TESTO_SEMANTICO_PIENO =
  /(?<![A-Za-z])color:\s*[Cc]olors\.semantic\.\w+\.(main|dark|light)\b/;

const fileDi = (cartella: string): string[] =>
  readdirSync(cartella).flatMap(nome => {
    const percorso = join(cartella, nome);
    if (statSync(percorso).isDirectory())
      return nome === '__tests__' ? [] : fileDi(percorso);
    return /\.tsx?$/.test(nome) ? [percorso] : [];
  });

describe('colori semantici usati come testo', () => {
  it('contrasto: i colori semantici da testo sui fondi delle schermate', () => {
    for (const tema of TEMI) {
      const c = colori(tema);
      // `neutral[100]` in chiaro resta fuori: il rosso lì è 4,43:1 e la scelta del rosso è di Riccardo.
      for (const tono of ['error', 'success', 'warning'] as const)
        for (const fondo of [c.neutral[0], c.neutral[50]])
          expect(
            contrasto(c.semantic[tono].text, fondo)
          ).toBeGreaterThanOrEqual(AA);
    }
  });

  it('contrasto: casella del consenso non spuntata', () => {
    // WCAG 1.4.11: il contorno di un controllo chiede 3:1 sul fondo (neutral[400] era 2,5:1).
    for (const tema of TEMI) {
      const ui = conTema(
        tema,
        <AuthConsentCheckbox
          checked={false}
          onToggle={() => undefined}
          label="Accetto"
        />
      );
      const [icona] = ui.UNSAFE_getAllByProps({
        name: 'checkbox-blank-outline',
      });
      for (const fondo of [colori(tema).neutral[0], colori(tema).neutral[50]])
        expect(
          contrasto(String(icona?.props.color), fondo)
        ).toBeGreaterThanOrEqual(3);
    }
  });

  it('contrasto: nessun testo col colore semantico pieno', () => {
    // Positivo: lo schema riconosce il caso da vietare e lascia stare i bordi.
    expect(
      TESTO_SEMANTICO_PIENO.test('color: Colors.semantic.error.main,')
    ).toBe(true);
    expect(
      TESTO_SEMANTICO_PIENO.test('borderColor: Colors.semantic.error.main,')
    ).toBe(false);
    const sorgenti = fileDi(join(__dirname, '../../..'));
    // Positivo: il lettore vede i file dell'app (altrimenti il controllo passerebbe a vuoto).
    expect(sorgenti.some(f => f.endsWith('AuthInput.tsx'))).toBe(true);
    expect(
      sorgenti.filter(f => TESTO_SEMANTICO_PIENO.test(readFileSync(f, 'utf8')))
    ).toEqual([]);
  });
});
