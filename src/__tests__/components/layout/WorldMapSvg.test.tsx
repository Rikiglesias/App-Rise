import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import WorldMapSvg from '@/components/layout/WorldMapSvg';
import { convertToMapLocations } from '@/features/impact/utils/mapHelpers';
import { changeLanguage, getCurrentLocale } from '@/locales';

const renderMap = (onMarkerPress: jest.Mock = jest.fn()) => {
  const utils = render(
    <AllProviders>
      <WorldMapSvg
        locations={convertToMapLocations()}
        onMarkerPress={onMarkerPress}
        isFullScreen
      />
    </AllProviders>
  );
  // Simula la misura del viewport (onLayout) per far disegnare i path SVG.
  fireEvent(utils.getByTestId('world-map-svg'), 'layout', {
    nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
  });
  return { ...utils, onMarkerPress };
};

describe('WorldMapSvg', () => {
  const originalLocale = getCurrentLocale();
  beforeEach(() => changeLanguage('it'));
  afterEach(() => changeLanguage(originalLocale));
  it('renderizza la lista fallback con i paesi-evento (a11y + target tap)', () => {
    const { getByText } = renderMap();
    expect(getByText('Italia')).toBeTruthy();
    expect(getByText('Ucraina')).toBeTruthy();
    expect(getByText('Zimbabwe')).toBeTruthy();
  });

  it('chiama onMarkerPress con la location corretta dal fallback', () => {
    const onMarkerPress = jest.fn();
    const { getByText } = renderMap(onMarkerPress);
    fireEvent.press(getByText('Italia'));
    expect(onMarkerPress).toHaveBeenCalledTimes(1);
    expect(onMarkerPress).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'Italia' })
    );
  });

  it('non crasha prima della misura del viewport (nessun path ancora)', () => {
    const { getByText } = render(
      <AllProviders>
        <WorldMapSvg
          locations={convertToMapLocations()}
          onMarkerPress={jest.fn()}
        />
      </AllProviders>
    );
    // I chip esistono anche senza layout (fuori dal guard shapes>0).
    expect(getByText('Italia')).toBeTruthy();
  });

  it('traduce chip e poligoni accessibili in inglese, inclusi più eventi nello stesso paese', () => {
    changeLanguage('en');
    const locations = convertToMapLocations();
    const italy = locations.find(location => location.id === 'italy');
    if (!italy) throw new Error('Missing Italy fixture');
    const { getByLabelText, getByTestId, getAllByLabelText } = render(
      <AllProviders>
        <WorldMapSvg
          locations={[...locations, { ...italy, id: 'italy-second' }]}
          onMarkerPress={jest.fn()}
        />
      </AllProviders>
    );
    fireEvent(getByTestId('world-map-svg'), 'layout', {
      nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
    });
    expect(getByLabelText('Countries where we work')).toBeTruthy();
    expect(getAllByLabelText('Italy: tap for details')).toHaveLength(2);
    expect(getByLabelText('Italy: 2 events, tap for details')).toBeTruthy();
  });
});
