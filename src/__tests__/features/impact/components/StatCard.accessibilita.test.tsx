/**
 * Come si annuncia una StatCard ai lettori di schermo (C51 del contratto android-play).
 *
 * Una card che non si tocca è un contenuto, non un pulsante spento: TalkBack non deve dire
 * «disattivato». Il test sta qui e non in `ImpactTabScreen.statcard.test.tsx`, che è protetto
 * dalla controprova di C7.
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
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

type Nodo = ReturnType<typeof render>['UNSAFE_root'];

describe('StatCard e lettori di schermo', () => {
  it('icone con etichetta: StatCard non annunciata disattivata', () => {
    // C51 (PAGINE-09): una card che non si tocca è un contenuto, non un pulsante spento.
    render(
      <SafeAreaProvider initialMetrics={initialMetrics}>
        <AllProviders>
          <StatCard
            icon="account-group"
            iconColor="#047857"
            value="52"
            label="Volontari"
            subtitle="nel 2025"
            gradientColors={['#D1FAE5', '#FFFFFF']}
            pressable={false}
          />
        </AllProviders>
      </SafeAreaProvider>
    );
    // Positivo: la card c'è e si legge.
    expect(screen.getByText('Volontari')).toBeTruthy();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(
      screen.UNSAFE_root.findAll(
        (nodo: Nodo) => nodo.props.accessibilityState?.disabled === true
      )
    ).toHaveLength(0);
  });
});
