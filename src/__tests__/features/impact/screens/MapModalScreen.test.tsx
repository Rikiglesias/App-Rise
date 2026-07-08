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

describe('MapModalScreen — navigazione continenti + tap paese → dettaglio', () => {
  it('mostra solo le destinazioni del continente attivo (default Africa)', () => {
    const { getByText, getAllByText, queryByText } = renderScreen();
    // Default = Africa: Zimbabwe visibile (label + legend), Ucraina (Europa) no.
    expect(getAllByText('Zimbabwe').length).toBeGreaterThan(0);
    expect(queryByText('Ucraina')).toBeNull();
    // Passo all'Europa → compaiono le sue destinazioni.
    fireEvent.press(getByText('Europa'));
    expect(getAllByText('Ucraina').length).toBeGreaterThan(0);
    expect(queryByText('Zimbabwe')).toBeNull();
  });

  it('apre il dettaglio della nazione toccata con i dati corretti (getModalData)', () => {
    const { getByText, getAllByText, queryByText } = renderScreen();

    // Vado in Europa per raggiungere l'Italia (hub).
    fireEvent.press(getByText('Europa'));
    // Prima del tap: il dettaglio (title = name città) non è montato.
    expect(queryByText('Bologna')).toBeNull();

    // Tap su Italia (fallback legend, ultimo match: label sulla mappa + legend) →
    // onMarkerPress → modal nazione. La città compare nel titolo E nella traccia
    // (destinazione): più occorrenze, attese.
    const italiaMatches = getAllByText('Italia');
    fireEvent.press(italiaMatches[italiaMatches.length - 1]);
    expect(getAllByText('Bologna').length).toBeGreaterThan(0);
    expect(getByText(/Hub Europa/i)).toBeTruthy();
  });

  it('mostra il dettaglio della nazione giusta per un altro paese', () => {
    const { getByText, getAllByText } = renderScreen();
    fireEvent.press(getByText('Europa'));
    const ucrainaMatches = getAllByText('Ucraina');
    fireEvent.press(ucrainaMatches[ucrainaMatches.length - 1]);
    expect(getAllByText('Kyiv').length).toBeGreaterThan(0);
  });
});
