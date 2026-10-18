/**
 * Pagine di dettaglio del tab Impatto (C38 del contratto android-play).
 *
 * Lo stack di Impatto vero si monta in un NavigationContainer: ogni rotta di dettaglio si
 * apre con il suo titolo e un numero di IMPACT_DATA formattato in italiano, e il pulsante
 * «Indietro» della pagina riporta alla schermata Impatto.
 */
import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import { IMPACT_DATA } from '@/features/impact/data/impactData';
import { changeLanguage } from '@/locales';
import ImpactStackNavigator from '@/navigation/ImpactStackNavigator';
import type { ImpactStackParamList } from '@/navigation/types';

// La schermata Impatto e la mappa non sono sotto prova: un segnaposto riconoscibile basta.
jest.mock('@/features/impact', () => {
  const { Text: Testo } = jest.requireActual('react-native');
  return { ImpactTabScreen: () => <Testo>schermata Impatto</Testo> };
});
jest.mock('@/features/impact/screens/MapModalScreen', () => ({
  __esModule: true,
  default: () => null,
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const formatta = (n: number) => new Intl.NumberFormat('it').format(n);

const PAGINE = [
  { rotta: 'Meals', titolo: 'Pasti', numero: IMPACT_DATA.mealsDistributed },
  {
    rotta: 'Kits',
    titolo: 'Kit alimentari',
    numero: IMPACT_DATA.kitsDistributed,
  },
  {
    rotta: 'Volunteers',
    titolo: 'Volontari',
    numero: IMPACT_DATA.volunteers,
  },
  {
    rotta: 'Partners',
    titolo: 'Associazioni partner',
    numero: IMPACT_DATA.partnerAssociations.length,
  },
  {
    rotta: 'Beneficiaries',
    titolo: 'Vite raggiunte',
    numero: IMPACT_DATA.livesImpactedKits,
  },
] as const;

describe('pagine di dettaglio di Impatto', () => {
  it.each(PAGINE)(
    'pagine di dettaglio: $rotta si apre e torna indietro',
    ({ rotta, titolo, numero }) => {
      changeLanguage('it');
      const ref = createNavigationContainerRef<ImpactStackParamList>();
      render(
        <SafeAreaProvider initialMetrics={initialMetrics}>
          <AllProviders>
            <NavigationContainer ref={ref}>
              <ImpactStackNavigator />
            </NavigationContainer>
          </AllProviders>
        </SafeAreaProvider>
      );
      expect(screen.getByText('schermata Impatto')).toBeTruthy();

      act(() => ref.navigate(rotta));
      expect(ref.getCurrentRoute()?.name).toBe(rotta);
      expect(screen.getByRole('header', { name: titolo })).toBeTruthy();
      expect(screen.getByText(formatta(numero))).toBeTruthy();

      fireEvent.press(screen.getByRole('button', { name: 'Indietro' }));
      expect(ref.getCurrentRoute()?.name).toBe('Impact');
      expect(screen.getByText('schermata Impatto')).toBeTruthy();
    }
  );
});
