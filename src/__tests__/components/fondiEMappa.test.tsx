/**
 * F14-ponte (android-play), lotto B. Foto della vc25: la riga dei paesi finiva in «United Sta» senza
 * segno che continuasse; in Impatto una barra grigia da 4 dp stava sola in ~115 dp di vuoto; il fondo
 * di «Chi siamo» e «Seguici» finiva sotto i tre pulsanti di Android, perché nessuno sommava l'inset.
 */
import React from 'react';
import { ScrollView, StyleSheet, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { AllProviders } from '../helpers/testProviders';
import WorldMapSvg from '@/components/layout/WorldMapSvg';
import ChiSiamoScreen from '@/features/about/screens/ChiSiamoScreen';
import { TotalMealsSection } from '@/features/impact/components/TotalMealsSection';
import { convertToMapLocations } from '@/features/impact/utils/mapHelpers';
import SeguiciScreen from '@/features/social/screens/SeguiciScreen';
import { changeLanguage, getCurrentLocale } from '@/locales';

jest.mock('react-native/Libraries/Linking/Linking', () => {
  const linkingMock = { openURL: jest.fn(), canOpenURL: jest.fn() };
  return { __esModule: true, default: linkingMock, ...linkingMock };
});
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual<object>('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

type Nodo = ReturnType<typeof render>['UNSAFE_root'];

const BARRA_DI_SISTEMA = 48;
const navigation = { goBack: jest.fn(), navigate: jest.fn() } as never;

/** paddingBottom del contenuto scorrevole più esterno. */
const fondo = (ui: ReturnType<typeof render>): number =>
  StyleSheet.flatten(
    ui.UNSAFE_getAllByType(ScrollView)[0]?.props.contentContainerStyle
  ).paddingBottom as number;

const conBarraDiSistema = (): void => {
  jest
    .spyOn(
      jest.requireMock<typeof import('react-native-safe-area-context')>(
        'react-native-safe-area-context'
      ),
      'useSafeAreaInsets'
    )
    .mockReturnValue({ top: 0, bottom: BARRA_DI_SISTEMA, left: 0, right: 0 });
};

describe('F14-ponte lotto B', () => {
  const lingua = getCurrentLocale();
  beforeEach(() => changeLanguage('it'));
  afterEach(() => {
    changeLanguage(lingua);
    jest.restoreAllMocks();
  });

  it('mappa: la riga dei paesi sfuma dove continua', () => {
    const ui = render(
      <AllProviders>
        <WorldMapSvg
          locations={convertToMapLocations()}
          onMarkerPress={jest.fn()}
          isFullScreen={false}
        />
      </AllProviders>
    );
    fireEvent(ui.getByTestId('world-map-svg'), 'layout', {
      nativeEvent: { layout: { width: 400, height: 200, x: 0, y: 0 } },
    });
    const riga = ui
      .UNSAFE_getAllByType(ScrollView)
      .find(s => s.props.horizontal === true);
    expect(riga?.props.fadingEdgeLength).toBeGreaterThan(0);
  });

  it('Impatto: nessuna barretta decorativa isolata sopra «I nostri numeri»', () => {
    const ui = render(
      <AllProviders>
        <TotalMealsSection />
      </AllProviders>
    );
    const barrette = ui.UNSAFE_root.findAll(
      (n: Nodo) => typeof n.type === 'string'
    )
      .map((n: Nodo): ViewStyle => StyleSheet.flatten(n.props.style) ?? {})
      .filter(
        (s: ViewStyle) =>
          s.backgroundColor !== undefined &&
          typeof s.height === 'number' &&
          s.height <= 6 &&
          typeof s.width === 'number' &&
          s.width > 100
      );
    expect(barrette).toEqual([]);
  });

  it.each([
    ['Chi siamo', () => <ChiSiamoScreen navigation={navigation} />],
    ['Seguici', () => <SeguiciScreen navigation={navigation} />],
  ])(
    '%s: il fondo scorre fin sopra i tre pulsanti di Android',
    (_nome, schermata) => {
      const senza = render(<AllProviders>{schermata()}</AllProviders>);
      const base = fondo(senza);
      senza.unmount();
      conBarraDiSistema();
      const con = render(<AllProviders>{schermata()}</AllProviders>);
      expect(fondo(con)).toBe(base + BARRA_DI_SISTEMA);
    }
  );
});
