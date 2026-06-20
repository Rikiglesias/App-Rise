import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../../helpers/testProviders';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';

// Naviga con le location reali via route params; goBack stubbato.
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

const renderScreen = () => {
  const utils = render(
    <AllProviders>
      <MapModalScreen />
    </AllProviders>
  );
  fireEvent(utils.getByTestId('world-map-svg'), 'layout', {
    nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
  });
  return utils;
};

describe('MapModalScreen — tap paese → dettaglio nazione', () => {
  it('apre il dettaglio della nazione toccata con i dati corretti (getModalData)', () => {
    const { getByText, queryByText } = renderScreen();

    // Prima del tap: il dettaglio (title = name città) non è montato.
    expect(queryByText('Bologna')).toBeNull();

    // Tap su Italia (chip fallback) → onMarkerPress → modal nazione.
    fireEvent.press(getByText('Italia'));
    expect(getByText('Bologna')).toBeTruthy();
    expect(getByText(/Sede Europea/i)).toBeTruthy();
  });

  it('mostra il dettaglio della nazione giusta per un altro paese', () => {
    const { getByText } = renderScreen();
    fireEvent.press(getByText('Ucraina'));
    expect(getByText('Kiev')).toBeTruthy();
  });
});
