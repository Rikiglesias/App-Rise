/**
 * C46 (contratto android-play), seconda parte: su Android la lingua si cambia dalle Impostazioni
 * senza riavviare l'app, e la documentazione di expo-localization chiede di rileggere
 * `getLocales()` a ogni ritorno in primo piano. Qui si monta la schermata vera in italiano, si
 * cambia la lingua che il telefono dichiara e si simula il ritorno (`AppState` → `active`):
 * testi, numeri e nomi della mappa già a schermo devono passare all'inglese.
 */
import React from 'react';
import { AppState } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { AllProviders } from '../helpers/testProviders';
import { IMPACT_DATA } from '@/features/impact/data/impactData';
import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import { changeLanguage } from '@/locales';

let mockLinguaTelefono = 'it';
jest.mock('expo-localization', () => ({
  ...jest.requireActual('expo-localization'),
  getLocales: () => [
    { languageCode: mockLinguaTelefono, languageTag: mockLinguaTelefono },
  ],
}));

// I parametri della rotta sono una foto presa all'apertura della mappa, come nell'app.
let mockParametriMappa: { locations: unknown[] } | undefined;
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const {
    convertToMapLocations,
  } = require('@/features/impact/utils/mapHelpers');
  return {
    ...actual,
    useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
    useRoute: () => ({
      params: (mockParametriMappa ??= { locations: convertToMapLocations() }),
    }),
  };
});

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// La mappa del tab Impatto porta con sé l'SVG del mondo: qui basta vedere i nomi che riceve.
jest.mock('@/features/impact/components/MapSection', () => {
  const { Text } = require('react-native');
  const { createElement } = require('react');
  return {
    MapSection: ({ locations }: { locations: { name: string }[] }) =>
      createElement(
        Text,
        { testID: 'nomi-mappa' },
        locations.map(l => l.name).join(', ')
      ),
  };
});

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const formatta = (n: number, lingua: 'it' | 'en') =>
  new Intl.NumberFormat(lingua).format(n);

const montaImpatto = () =>
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AllProviders>
        <ImpactTabScreen />
      </AllProviders>
    </SafeAreaProvider>
  );

/** La persona cambia lingua nelle Impostazioni, poi torna nell'app. */
const tornaDalleImpostazioni = (lingua: string) => {
  mockLinguaTelefono = lingua;
  const gestori = (AppState.addEventListener as jest.Mock).mock.calls
    .filter(([evento]) => evento === 'change')
    .map(([, gestore]) => gestore as (stato: string) => void);
  expect(gestori.length).toBeGreaterThan(0);
  act(() => {
    gestori.forEach(gestore => gestore('background'));
    gestori.forEach(gestore => gestore('active'));
  });
};

describe('C46 lingua al ritorno', () => {
  beforeEach(() => {
    mockLinguaTelefono = 'it';
    mockParametriMappa = undefined;
    changeLanguage('it');
  });

  afterEach(() => {
    act(() => changeLanguage('it'));
  });

  it("lingua al ritorno: schermata già montata passa all'inglese", () => {
    montaImpatto();
    expect(screen.getByText('Pasti Totali')).toBeTruthy();
    expect(screen.getByTestId('nomi-mappa').props.children).toContain('Kiev');

    tornaDalleImpostazioni('en');

    expect(screen.getByText('Total Meals')).toBeTruthy();
    expect(screen.queryByText('Pasti Totali')).toBeNull();
    const nomi = screen.getByTestId('nomi-mappa').props.children as string;
    expect(nomi).toContain('Kyiv');
    expect(nomi).not.toContain('Kiev');
  });

  it('lingua al ritorno: numeri nella nuova lingua', () => {
    const totale = IMPACT_DATA.mealsProducedLifetime;
    expect(totale).toBeGreaterThanOrEqual(1000);
    montaImpatto();
    expect(screen.getByText(formatta(totale, 'it'))).toBeTruthy();

    tornaDalleImpostazioni('en');

    expect(screen.getByText(formatta(totale, 'en'))).toBeTruthy();
    expect(screen.queryByText(formatta(totale, 'it'))).toBeNull();
  });

  it("lingua al ritorno: la mappa aperta e la sua scheda passano all'inglese", () => {
    render(
      <AllProviders>
        <BottomTabBarHeightContext.Provider value={100}>
          <MapModalScreen />
        </BottomTabBarHeightContext.Provider>
      </AllProviders>
    );
    fireEvent(screen.getByTestId('world-map-svg'), 'layout', {
      nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
    });
    fireEvent.press(screen.getByText('Ucraina'));
    expect(screen.getByText('Kiev')).toBeTruthy();

    tornaDalleImpostazioni('en');

    expect(screen.getByText('Ukraine')).toBeTruthy();
    expect(screen.getByText('Kyiv')).toBeTruthy();
    expect(screen.queryAllByText(/Kiev|Ucraina/)).toHaveLength(0);
  });

  it('lingua al ritorno: stessa lingua, nessun cambio', () => {
    montaImpatto();
    tornaDalleImpostazioni('it');
    expect(screen.getByText('Pasti Totali')).toBeTruthy();
  });

  it("lingua al ritorno: l'ascolto si chiude quando nessuno traduce più", () => {
    const aggiunte = AppState.addEventListener as jest.Mock;
    const prima = aggiunte.mock.results.length;
    const ui = montaImpatto();
    const nuove = aggiunte.mock.results.slice(prima);
    expect(nuove).toHaveLength(1);
    const [ascolto] = nuove;

    ui.unmount();

    expect(ascolto?.value.remove).toHaveBeenCalledTimes(1);
  });
});
