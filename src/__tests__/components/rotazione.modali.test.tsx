/**
 * C54 (contratto android-play): la mappa a tutto schermo e `PerfectModal` si ridisegnano con la
 * finestra nuova senza riavvio. Oracolo e finestre in `helpers/cambioFinestra`.
 */
import React from 'react';
import { Text } from 'react-native';
import { act } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { AllProviders } from '../helpers/testProviders';
import {
  provaCambioFinestra,
  ripristinaFinestra,
} from '../helpers/cambioFinestra';
import { PerfectModal } from '@/components/ui/PerfectModal';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import i18n from '@/locales';

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    goBack: jest.fn(),
    canGoBack: () => true,
    navigate: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      locations:
        require('@/features/impact/utils/mapHelpers').convertToMapLocations(),
    },
  }),
}));

beforeEach(() => {
  jest.useFakeTimers();
  i18n.locale = 'it';
});
afterEach(() => {
  ripristinaFinestra();
  jest.clearAllTimers();
  jest.useRealTimers();
});

const settle = () => act(() => jest.runOnlyPendingTimers());
const noop = (): void => undefined;

it('rotazione: MapModalScreen si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: () => (
      <AllProviders>
        <BottomTabBarHeightContext.Provider value={80}>
          <MapModalScreen />
        </BottomTabBarHeightContext.Provider>
      </AllProviders>
    ),
    apri: settle,
    assesta: settle,
    testID: 'map-safe-content',
  });
});

it('rotazione: PerfectModal si ridisegna con le nuove dimensioni', () => {
  provaCambioFinestra({
    elemento: () => (
      <AllProviders>
        <PerfectModal visible onRequestClose={noop}>
          <Text>contenuto</Text>
        </PerfectModal>
      </AllProviders>
    ),
    apri: settle,
    assesta: settle,
  });
});
