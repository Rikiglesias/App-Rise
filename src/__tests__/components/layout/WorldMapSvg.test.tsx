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
  it('renderizza i nomi dei paesi-evento (label sulla mappa + legend fallback)', () => {
    // In fullscreen il nome compare due volte per paese: label ancorata al pin +
    // chip legend fissa in basso. Entrambi sono target tap e fallback a11y validi.
    const { getAllByText } = renderMap();
    expect(getAllByText('Italia').length).toBeGreaterThan(0);
    expect(getAllByText('Ucraina').length).toBeGreaterThan(0);
    expect(getAllByText('Zimbabwe').length).toBeGreaterThan(0);
  });

  it('chiama onMarkerPress con la location corretta dal fallback legend', () => {
    const onMarkerPress = jest.fn();
    const { getAllByText } = renderMap(onMarkerPress);
    // La legend fissa è renderizzata per ultima → ultimo match del nome.
    const italiaMatches = getAllByText('Italia');
    fireEvent.press(italiaMatches[italiaMatches.length - 1]);
    expect(onMarkerPress).toHaveBeenCalledTimes(1);
    expect(onMarkerPress).toHaveBeenCalledWith(
      expect.objectContaining({ country: 'Italia' })
    );
  });

  it('preview: nessun bottone duplicato (né legend né label, pin decorativi)', () => {
    // In preview il tap vive sul container (MapSection): la mappa non deve
    // esporre bottoni noop nell'albero a11y (né chip legend né label né pin).
    const utils = render(
      <AllProviders>
        <WorldMapSvg
          locations={convertToMapLocations()}
          onMarkerPress={jest.fn()}
        />
      </AllProviders>
    );
    // Prima della misura: nessun crash, nessun contenuto interattivo.
    expect(utils.queryAllByRole('button')).toHaveLength(0);
    // Dopo la misura i pin esistono ma restano decorativi (nessun bottone).
    fireEvent(utils.getByTestId('world-map-svg'), 'layout', {
      nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
    });
    expect(utils.queryByText('Italia')).toBeNull();
    expect(utils.queryAllByRole('button')).toHaveLength(0);
  });
});
