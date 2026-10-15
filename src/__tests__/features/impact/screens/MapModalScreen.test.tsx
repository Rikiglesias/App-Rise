import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';

import { AllProviders } from '../../../helpers/testProviders';
import MapModalScreen from '@/features/impact/screens/MapModalScreen';
import { changeLanguage, getCurrentLocale } from '@/locales';
import { getAdaptiveColors } from '@/shared/theme/adaptiveColors';
import * as ThemeColorsHook from '@/shared/hooks/useThemeColors';

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

const renderScreen = (tabBarHeight = 140) => {
  const utils = render(
    <AllProviders>
      <BottomTabBarHeightContext.Provider value={tabBarHeight}>
        <MapModalScreen />
      </BottomTabBarHeightContext.Provider>
    </AllProviders>
  );
  fireEvent(utils.getByTestId('world-map-svg'), 'layout', {
    nativeEvent: { layout: { width: 800, height: 400, x: 0, y: 0 } },
  });
  return utils;
};

describe('MapModalScreen — tap paese → dettaglio nazione', () => {
  const originalLocale = getCurrentLocale();
  beforeEach(() => changeLanguage('it'));
  afterEach(() => {
    changeLanguage(originalLocale);
    jest.restoreAllMocks();
  });
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

  it('in inglese traduce la mappa e l’intera scheda località', () => {
    changeLanguage('en');
    const { getByText, getAllByLabelText, queryByText } = renderScreen();
    fireEvent.press(getByText('Italy'));
    expect(getByText('Italy - European Office')).toBeTruthy();
    expect(getByText('Meals')).toBeTruthy();
    expect(getByText('Kits')).toBeTruthy();
    expect(getByText('PROGRAM')).toBeTruthy();
    expect(getByText('RESULTS')).toBeTruthy();
    expect(getAllByLabelText('Close').length).toBeGreaterThan(0);
    expect(queryByText('Pasti')).toBeNull();
  });

  it.each([80, 150, 220])(
    'riserva l’ingombro reale della barra (%s) e i lati sicuri',
    tabBarHeight => {
      jest
        .spyOn(
          jest.requireMock<typeof import('react-native-safe-area-context')>(
            'react-native-safe-area-context'
          ),
          'useSafeAreaInsets'
        )
        .mockReturnValue({ top: 24, bottom: 34, left: 12, right: 20 });
      const { getByTestId, getByText } = renderScreen(tabBarHeight);
      expect(getByTestId('map-safe-content')).toHaveStyle({
        paddingBottom: tabBarHeight,
        paddingLeft: 12,
        paddingRight: 20,
      });
      fireEvent.press(getByText('Italia'));
      expect(getByText('Bologna')).toBeTruthy();
    }
  );

  it.each([false, true])(
    'il tasto chiudi ha contrasto >= 3:1 (dark=%s)',
    isDark => {
      const colors = getAdaptiveColors(isDark);
      jest.spyOn(ThemeColorsHook, 'useThemeColors').mockReturnValue(colors);
      const { getByLabelText } = renderScreen();
      const close = getByLabelText('Chiudi la mappa');
      const foreground: string = close.findByProps({ name: 'close' }).props
        .color;
      const background: string = StyleSheet.flatten(
        close.props.style
      ).backgroundColor;
      const luminance = (hex: string): number => {
        const channels = [1, 3, 5].map(index => {
          const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4;
        });
        return channels.reduce(
          (total, channel, index) =>
            total + channel * ([0.2126, 0.7152, 0.0722][index] ?? 0),
          0
        );
      };
      const a = luminance(foreground);
      const b = luminance(background);
      expect(
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
      ).toBeGreaterThanOrEqual(3);
    }
  );
});
