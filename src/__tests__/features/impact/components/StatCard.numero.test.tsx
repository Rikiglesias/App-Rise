/**
 * Il numero di una StatCard resta su una riga anche col testo di sistema al doppio: «24.562.744»
 * andava a capo dentro la scheda («24.562.74» + «4», Pixel_7 API 36, scala 2,0). Si restringe,
 * come i numeri della scheda sulla mappa. Sotto Jest la scala del testo è bloccata
 * (`SystemImmunity.ts`), quindi qui si prova la variante; l'effetto a scala 2,0 si guarda sul telefono.
 */
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import { StatCard } from '@/features/impact/components/StatCard';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

const initialMetrics = {
  frame: { x: 0, y: 0, width: 411, height: 914 },
  insets: { top: 24, left: 0, right: 0, bottom: 24 },
};

const scheda = (pressable: boolean) => (
  <SafeAreaProvider initialMetrics={initialMetrics}>
    <AllProviders>
      <StatCard
        icon="food-apple"
        iconColor="#B91C1C"
        value="24.562.744"
        label="Pasti Totali"
        subtitle="Prodotti dal 2012"
        gradientColors={['#D1FAE5', '#FFFFFF']}
        pressable={pressable}
        onPress={() => undefined}
      />
    </AllProviders>
  </SafeAreaProvider>
);

describe.each([
  ['toccabile', true],
  ['non toccabile', false],
])('StatCard %s', (_nome, pressable) => {
  it('il numero resta su una riga e si restringe se non entra', () => {
    render(scheda(pressable));

    const numero = screen.getByText('24.562.744');
    expect(numero.props.numberOfLines).toBe(1);
    expect(numero.props.adjustsFontSizeToFit).toBe(true);
  });
});
