/**
 * Numeri d'impatto (C37 del contratto android-play).
 *
 * Le 6 StatCard del tab Impatto mostrano i valori di IMPACT_DATA (Annual Report 2025),
 * formattati con i separatori della lingua dell'app, accanto alla loro etichetta tradotta.
 * Il test monta la schermata vera con i provider dei test: il valore atteso si calcola qui
 * con Intl, non col formatter dell'app, e le etichette attese sono scritte per esteso.
 */
import React from 'react';
import { render, screen, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import { IMPACT_DATA } from '@/features/impact/data/impactData';
import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';
import { changeLanguage } from '@/locales';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

// La mappa non contiene StatCard e porta con sé l'SVG del mondo.
jest.mock('@/features/impact/components/MapSection', () => ({
  MapSection: () => null,
}));

type Lingua = 'it' | 'en';
interface CardAttesa {
  etichetta: string;
  sottotitolo: string;
  numero: number;
}

// Letto dentro il test (non all'import): sul codice di prima i campi mancano e il test
// deve fallire dentro ciascun test, non impedire alla suite di partire.
const cardAttese = (lingua: Lingua): CardAttesa[] => {
  const anno = IMPACT_DATA.resultsYear;
  const partner = IMPACT_DATA.partnerAssociations.length;
  return {
    it: [
      {
        etichetta: 'Pasti Totali',
        sottotitolo: 'Prodotti dal 2012',
        numero: IMPACT_DATA.mealsProducedLifetime,
      },
      {
        etichetta: 'Kit Totali',
        sottotitolo: 'Prodotti dal 2020',
        numero: IMPACT_DATA.kitsProducedLifetime,
      },
      {
        etichetta: 'Pasti Confezionati',
        sottotitolo: `Prodotti nel ${anno}`,
        numero: IMPACT_DATA.mealsProduced,
      },
      {
        etichetta: 'Vite Impattate',
        sottotitolo: `Con i pasti del ${anno}`,
        numero: IMPACT_DATA.livesImpactedMeals,
      },
      {
        etichetta: 'Volontari',
        sottotitolo: `Coinvolti nel ${anno}`,
        numero: IMPACT_DATA.volunteers,
      },
      {
        etichetta: 'Associazioni',
        sottotitolo: `Partner nel ${anno}`,
        numero: partner,
      },
    ],
    en: [
      {
        etichetta: 'Total Meals',
        sottotitolo: 'Produced since 2012',
        numero: IMPACT_DATA.mealsProducedLifetime,
      },
      {
        etichetta: 'Total Kits',
        sottotitolo: 'Produced since 2020',
        numero: IMPACT_DATA.kitsProducedLifetime,
      },
      {
        etichetta: 'Meals Packaged',
        sottotitolo: `Produced in ${anno}`,
        numero: IMPACT_DATA.mealsProduced,
      },
      {
        etichetta: 'Lives Impacted',
        sottotitolo: `Through ${anno} meals`,
        numero: IMPACT_DATA.livesImpactedMeals,
      },
      {
        etichetta: 'Volunteers',
        sottotitolo: `Involved in ${anno}`,
        numero: IMPACT_DATA.volunteers,
      },
      {
        etichetta: 'Organizations',
        sottotitolo: `Partners in ${anno}`,
        numero: partner,
      },
    ],
  }[lingua];
};

const ALTRA: Record<Lingua, Lingua> = { it: 'en', en: 'it' };
const formatta = (n: number, lingua: Lingua) =>
  new Intl.NumberFormat(lingua).format(n);

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const montaInLingua = (lingua: Lingua) => {
  changeLanguage(lingua);
  render(
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AllProviders>
        <ImpactTabScreen />
      </AllProviders>
    </SafeAreaProvider>
  );
};

const verificaLingua = (lingua: Lingua) => {
  montaInLingua(lingua);
  const attese = cardAttese(lingua);
  const cards = screen.getAllByTestId('stat-card');
  expect(cards).toHaveLength(6);

  for (const attesa of attese) {
    const sue = cards.filter(
      card => within(card).queryByText(attesa.etichetta) !== null
    );
    expect({ etichetta: attesa.etichetta, card: sue.length }).toEqual({
      etichetta: attesa.etichetta,
      card: 1,
    });
    const [card] = sue;
    expect(within(card).getByText(attesa.sottotitolo)).toBeTruthy();
    expect(
      within(card).getByText(formatta(attesa.numero, lingua))
    ).toBeTruthy();
  }

  // Assenza con positivo: ogni numero dalle migliaia in su compare coi separatori della
  // lingua dell'app e non compare coi separatori dell'altra lingua.
  const migliaia = attese.filter(c => c.numero >= 1000);
  expect(migliaia.length).toBeGreaterThan(0);
  for (const c of migliaia) {
    expect(screen.getAllByText(formatta(c.numero, lingua))).toHaveLength(1);
    expect(screen.queryByText(formatta(c.numero, ALTRA[lingua]))).toBeNull();
  }
};

describe("numeri d'impatto", () => {
  afterEach(() => {
    changeLanguage('it');
  });

  it("numeri d'impatto: le 6 StatCard mostrano IMPACT_DATA in it", () => {
    verificaLingua('it');
  });

  it("numeri d'impatto: le 6 StatCard mostrano IMPACT_DATA in en", () => {
    verificaLingua('en');
  });
});
