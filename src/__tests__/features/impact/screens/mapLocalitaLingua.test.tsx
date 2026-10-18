/**
 * Dati della mappa (C39 del contratto android-play): la scheda di una località porta il nome
 * della città nella lingua dell'app. Si monta la schermata vera e si tocca il paese, senza
 * leggere i dati delle località: conta quello che vede chi usa l'app.
 */
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';

import { AllProviders } from '@/__tests__/helpers/testProviders';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  const {
    convertToMapLocations,
  } = require('@/features/impact/utils/mapHelpers');
  return {
    ...actual,
    useNavigation: () => ({ goBack: jest.fn(), navigate: jest.fn() }),
    useRoute: () => ({ params: { locations: convertToMapLocations() } }),
  };
});

const apriUcraina = (paese: string) => {
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
  fireEvent.press(screen.getByText(paese));
};

describe('mappa: nome della località nella lingua dell’app', () => {
  const linguaIniziale = getCurrentLocale();
  afterEach(() => changeLanguage(linguaIniziale));

  it('dati località: in inglese Kyiv', () => {
    changeLanguage('en');
    apriUcraina('Ukraine');
    expect(screen.getByText('Kyiv')).toBeTruthy();
    expect(screen.queryAllByText(/Kiev/)).toHaveLength(0);
  });

  it('dati località: in italiano Kiev', () => {
    changeLanguage('it');
    apriUcraina('Ucraina');
    expect(screen.getByText('Kiev')).toBeTruthy();
    expect(screen.queryAllByText(/Kyiv/)).toHaveLength(0);
  });
});
