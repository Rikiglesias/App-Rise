/**
 * C45 (contratto android-play): PerfectModal sceglie l'aspetto dal tipo di dispositivo
 * (`useDeviceType`, lato corto), non da soglie sulla larghezza che un telefono in orizzontale
 * supera; la mappa interattiva aggiunge lo spazio della barra delle schede solo dove la barra c'è.
 */
import { suTelefono } from '../helpers/touchArea';
import type { WindowSize } from '@/shared/utils/textScale';

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

const noop = (): void => undefined;

/** Presentazione scelta da PerfectModal sulla finestra data. */
const presentazione = (
  finestra: WindowSize
): { presentationStyle: unknown; transparent: unknown } =>
  suTelefono(finestra, () => {
    const React = require('react') as typeof import('react');
    const { Modal, Text } = require('react-native');
    const { render } = require('@testing-library/react-native/pure');
    const { AllProviders } = require('../helpers/testProviders');
    const { PerfectModal } = require('@/components/ui/PerfectModal');
    const ui = render(
      React.createElement(
        AllProviders,
        null,
        React.createElement(
          PerfectModal,
          { visible: true, onRequestClose: noop },
          React.createElement(Text, null, 'contenuto')
        )
      )
    );
    const { presentationStyle, transparent } = ui.UNSAFE_getByType(Modal).props;
    ui.unmount();
    return { presentationStyle, transparent };
  });

/** Spazio in fondo alla mappa, con o senza la barra delle schede attorno. */
const spazioMappa = (barra: number | undefined): unknown =>
  suTelefono({ width: 360, height: 640 }, () => {
    const React = require('react') as typeof import('react');
    const { StyleSheet } = require('react-native');
    const { render } = require('@testing-library/react-native/pure');
    const { SafeAreaProvider } = require('react-native-safe-area-context');
    const { AllProviders } = require('../helpers/testProviders');
    const {
      BottomTabBarHeightContext,
    } = require('@react-navigation/bottom-tabs');
    const MapModalScreen =
      require('@/features/impact/screens/MapModalScreen').default;
    const mappa = React.createElement(MapModalScreen);
    const ui = render(
      React.createElement(
        SafeAreaProvider,
        {
          initialMetrics: {
            frame: { x: 0, y: 0, width: 360, height: 640 },
            insets: { top: 0, left: 0, right: 0, bottom: 0 },
          },
        },
        React.createElement(
          AllProviders,
          null,
          barra === undefined
            ? mappa
            : React.createElement(
                BottomTabBarHeightContext.Provider,
                { value: barra },
                mappa
              )
        )
      )
    );
    const spazio = StyleSheet.flatten(
      ui.getByTestId('map-safe-content').props.style
    ).paddingBottom;
    ui.unmount();
    return spazio;
  });

describe('C45 modali e mappa', () => {
  it('modali e mappa: PerfectModal usa il tipo di dispositivo', () => {
    const telefono = { presentationStyle: 'overFullScreen', transparent: true };
    const tablet = { presentationStyle: 'formSheet', transparent: false };
    // Un telefono resta telefono anche girato: 915 dp di larghezza non lo fanno tablet.
    expect(presentazione({ width: 412, height: 915 })).toEqual(telefono);
    expect(presentazione({ width: 915, height: 412 })).toEqual(telefono);
    // Un tablet piccolo (lato corto 600) è un tablet, non un «telefono grande».
    expect(presentazione({ width: 600, height: 960 })).toEqual(tablet);
    expect(presentazione({ width: 1024, height: 768 })).toEqual(tablet);
  });

  it("modali e mappa: spazio della barra solo dove c'è", () => {
    expect(spazioMappa(undefined)).toBe(0);
    expect(spazioMappa(80)).toBe(80);
  });
});
