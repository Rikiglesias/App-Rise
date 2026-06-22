import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../../helpers/testProviders';
import WorldMapSvg from '@/components/layout/WorldMapSvg';
import { convertToMapLocations } from '@/features/impact/utils/mapHelpers';

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
});
