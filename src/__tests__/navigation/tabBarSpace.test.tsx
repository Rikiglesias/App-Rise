/**
 * C44 (contratto android-play): lo spazio sotto i contenuti delle 3 schede è l'altezza che la barra
 * pubblica (misurata, con la distanza dal bordo sicuro), non una costante. Le radici sono quelle vere;
 * i loro figli pesanti sono sostituiti, perché qui conta solo il fondo dello scorrimento.
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../helpers/testProviders';
import BottomTabNavigator from '@/navigation/BottomTabNavigator';
import HomeScreen from '@/features/home/screens/HomeScreen';
import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';
import { ContributeTabScreen } from '@/features/actions/screens/ContributeTabScreen';
import type { ContributeTabScreenProps } from '@/features/actions/ContributeScreenTypes';
import { PerfectSpacing } from '@/shared/constants';

jest.mock('@/features/home/components/EntraInAzione', () => ({
  EntraInAzione: () => null,
}));
jest.mock('@/features/home/components/HomeHeaderSection', () => ({
  HomeHeaderSection: () => null,
}));
jest.mock('@/features/impact/components', () => ({
  ImpactHeader: () => null,
  TotalMealsSection: () => null,
  AnnualResultsSection: () => null,
  CommunitySection: () => null,
  MapSection: () => null,
}));
jest.mock('@/features/actions/components', () => ({
  ActionButtons: () => null,
  ContributeHeader: () => null,
  HeaderDivider: () => null,
  useNewActionsAnimations: () => ({}),
}));
// Nel giro completo col navigatore: Impatto e Azioni non servono, la Home sì (quella vera).
jest.mock('@/navigation/ImpactStackNavigator', () => () => null);
jest.mock('@/features/actions', () => ({ ContributeTabScreen: () => null }));
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual<object>('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}));

type Nodo = ReturnType<typeof render>['UNSAFE_root'];

/** paddingBottom del contenuto scorrevole della radice. */
const fondoDelloScorrimento = (root: Nodo): number => {
  const scroll = root.findAll(
    (n: Nodo) => n.props.contentContainerStyle !== undefined
  )[0];
  if (!scroll) throw new Error('nessun contenuto scorrevole');
  return StyleSheet.flatten(scroll.props.contentContainerStyle)
    .paddingBottom as number;
};

const navigation = {
  navigate: jest.fn(),
} as unknown as ContributeTabScreenProps['navigation'];
const RADICI: [string, () => React.ReactElement][] = [
  ['Home', () => <HomeScreen navigation={navigation as never} />],
  ['Impatto', () => <ImpactTabScreen />],
  ['Azioni', () => <ContributeTabScreen navigation={navigation} />],
];

it('barra delle schede: spazio sotto i contenuti = altezza vera', () => {
  for (const [nome, radice] of RADICI) {
    for (const altezza of [120, 200]) {
      const ui = render(
        <AllProviders>
          <NavigationContainer>
            <BottomTabBarHeightContext.Provider value={altezza}>
              {radice()}
            </BottomTabBarHeightContext.Provider>
          </NavigationContainer>
        </AllProviders>
      );
      expect([nome, fondoDelloScorrimento(ui.UNSAFE_root)]).toEqual([
        nome,
        altezza + PerfectSpacing.lg,
      ]);
      ui.unmount();
    }
  }

  // Giro completo: l'altezza che la barra misura e pubblica arriva al fondo della Home vera.
  const safeInsets = jest
    .spyOn(
      jest.requireMock<typeof import('react-native-safe-area-context')>(
        'react-native-safe-area-context'
      ),
      'useSafeAreaInsets'
    )
    .mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 });
  try {
    const ui = render(
      <AllProviders>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </AllProviders>
    );
    fireEvent(ui.getByTestId('bottom-tab-bar'), 'layout', {
      nativeEvent: { layout: { width: 350, height: 131, x: 0, y: 0 } },
    });
    expect(fondoDelloScorrimento(ui.getByTestId('home-screen'))).toBe(
      131 + Math.max(34, PerfectSpacing.base) + PerfectSpacing.lg
    );
  } finally {
    safeInsets.mockRestore();
  }
});
