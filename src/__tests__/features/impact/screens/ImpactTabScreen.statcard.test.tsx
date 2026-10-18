/**
 * Le 6 StatCard di Impatto aprono la loro pagina di dettaglio (C7 del contratto android-play).
 *
 * Ogni card, toccata come la tocca una persona (sul suo testo), chiama una sola volta
 * `navigate` verso la sua rotta; la guardia controlla che non ci siano card in più né
 * destinazioni diverse da quelle del contratto.
 */
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';
import { changeLanguage } from '@/locales';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// La mappa non contiene StatCard e porta con sé l'SVG del mondo.
jest.mock('@/features/impact/components/MapSection', () => ({
  MapSection: () => null,
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// Le etichette attese sono quelle italiane: la lingua si fissa prima di montare.
const montaImpatto = () => {
  changeLanguage('it');
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AllProviders>
        <ImpactTabScreen />
      </AllProviders>
    </SafeAreaProvider>
  );
};

// Etichetta del contratto → testo della card in italiano → rotta attesa.
const CARD = [
  { nome: 'pasti dalla nascita', etichetta: 'Pasti Totali', rotta: 'Meals' },
  { nome: 'kit dalla nascita', etichetta: 'Kit Totali', rotta: 'Kits' },
  { nome: 'volontari 2025', etichetta: 'Volontari', rotta: 'Volunteers' },
  {
    nome: 'associazioni partner',
    etichetta: 'Associazioni',
    rotta: 'Partners',
  },
  { nome: 'pasti 2025', etichetta: 'Pasti Confezionati', rotta: 'Meals' },
  {
    nome: 'vite raggiunte 2025',
    etichetta: 'Vite Impattate',
    rotta: 'Beneficiaries',
  },
] as const;

const cardCon = (etichetta: string) => {
  const sue = screen
    .getAllByTestId('stat-card')
    .filter(card => within(card).queryByText(etichetta) !== null);
  expect({ etichetta, card: sue.length }).toEqual({ etichetta, card: 1 });
  return sue[0];
};

describe('StatCard di Impatto', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it.each(CARD)(
    'StatCard aprono il dettaglio: $nome',
    ({ etichetta, rotta }) => {
      montaImpatto();
      fireEvent.press(within(cardCon(etichetta)).getByText(etichetta));
      expect(mockNavigate.mock.calls).toEqual([[rotta]]);
    }
  );

  it('StatCard aprono il dettaglio: nessuna StatCard in più', () => {
    montaImpatto();
    const cards = screen.getAllByTestId('stat-card');
    expect(cards).toHaveLength(CARD.length);
    cards.forEach(card => {
      fireEvent.press(within(card).getAllByText(/[a-z]/i)[0]);
    });
    expect(mockNavigate.mock.calls.map(([rotta]) => rotta).sort()).toEqual(
      CARD.map(c => c.rotta).sort()
    );
  });

  it('le card che aprono una pagina si annunciano come pulsanti', () => {
    montaImpatto();
    expect(screen.getAllByRole('button')).toHaveLength(CARD.length);
  });
});
