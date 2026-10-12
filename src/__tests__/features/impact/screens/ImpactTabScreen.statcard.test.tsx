/**
 * Le StatCard di Impatto non devono aprire schermate segnaposto.
 *
 * Le quattro card che navigavano (pasti, kit, volontari, partner) portavano alla
 * schermata «In fase di sviluppo»: nella versione per gli store un revisore Google
 * la leggerebbe come funzione rotta. Ora sono solo numeri. Le due card dei
 * risultati annuali erano già non premibili: il test le preme comunque tutte.
 */
import React from 'react';
import {
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';
import { CommunitySection } from '@/features/impact/components/CommunitySection';
import { TotalMealsSection } from '@/features/impact/components/TotalMealsSection';
import { ThemeProvider } from '@/shared/hooks/useTheme';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// La mappa non c'entra con le card e porta con sé l'SVG del mondo.
jest.mock('@/features/impact/components/MapSection', () => ({
  MapSection: () => null,
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderWithSafeArea = (ui: React.ReactElement) =>
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <UniversalThemeProvider>
        <ThemeProvider>{ui}</ThemeProvider>
      </UniversalThemeProvider>
    </SafeAreaProvider>
  );

// Si preme ogni testo DENTRO la card: il tocco risale fino al pulsante della card,
// come il dito di una persona (premere il contenitore esterno non proverebbe nulla).
const pressAllStatCards = (): number => {
  const cards = screen.getAllByTestId('stat-card');
  cards.forEach(card => {
    within(card)
      .queryAllByText(/[a-z0-9]/i)
      .forEach(node => fireEvent.press(node));
  });
  return cards.length;
};

describe('StatCard senza segnaposto', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('le sezioni Numeri e Community hanno esattamente le 4 card che navigavano, e nessuna naviga più', () => {
    renderWithSafeArea(
      <>
        <TotalMealsSection />
        <CommunitySection />
      </>
    );

    expect(pressAllStatCards()).toBe(4);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('su tutta la schermata Impatto nessuna StatCard apre una schermata', () => {
    renderWithSafeArea(<ImpactTabScreen />);

    // 2 Numeri + 2 Risultati annuali + 2 Community
    expect(pressAllStatCards()).toBe(6);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('le card non premibili non si annunciano come pulsanti', () => {
    renderWithSafeArea(
      <>
        <TotalMealsSection />
        <CommunitySection />
      </>
    );

    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });
});
