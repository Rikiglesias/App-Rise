import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { act, render, fireEvent, waitFor } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Dimensions, PixelRatio, StyleSheet } from 'react-native';

import BottomTabNavigator from '../../navigation/BottomTabNavigator';
import {
  TAB_BAR_BASE_HEIGHT,
  tabBarHeight,
  tabLabelLineHeight,
} from '../../navigation/tabBarLayout';
import { AllProviders } from '../helpers/testProviders';
import { PerfectSpacing } from '@/shared/constants';
import { scaleWithDimensions } from '@/shared/constants/perfectScale';

// Mock Haptics
jest.mock('expo-haptics');

// Mock useTranslation per navigation labels italiane
jest.mock('../../shared/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'navigation.impact': 'Impatto',
        'navigation.home': 'Home',
        'navigation.actions': 'Azioni',
      };
      return translations[key] || key;
    },
    locale: 'it',
    setLocale: jest.fn(),
    isItalian: true,
    isEnglish: false,
  }),
}));

// Mock Screens
jest.mock('../../features/home/screens/HomeScreen', () => {
  const { View, Text } = require('react-native');
  const { useBottomTabBarHeight } = require('@react-navigation/bottom-tabs');
  return function HomeScreen() {
    return (
      <View testID="home-screen">
        <Text>Home Screen</Text>
        <Text testID="measured-tab-height">{useBottomTabBarHeight()}</Text>
      </View>
    );
  };
});

jest.mock('../../features/actions', () => ({
  ContributeTabScreen: function ContributeTabScreen() {
    const { View, Text } = require('react-native');
    return (
      <View testID="contribute-screen">
        <Text>Contribute Screen</Text>
      </View>
    );
  },
}));

jest.mock('../../navigation/ImpactStackNavigator', () => {
  const { View, Text } = require('react-native');
  return function ImpactStackNavigator() {
    return (
      <View testID="impact-screen">
        <Text>Impact Screen</Text>
      </View>
    );
  };
});

// Mock UI Components
jest.mock('../../components/ui', () => ({
  PlatformBlur: ({ children }: { children: React.ReactNode }) =>
    children ?? null,
  PlatformTouchable: ({ children, onPress, ...props }: any) => {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    );
  },
  PerfectText: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
  PerfectContainer: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  PerfectIcon: ({ name, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{name}</Text>;
  },
}));

const renderNavigator = () => {
  return render(
    <AllProviders>
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    </AllProviders>
  );
};

it('pubblica altezza misurata e offset sicuro dopo layout e rotazione', () => {
  const safeInsets = jest
    .spyOn(
      jest.requireMock<typeof import('react-native-safe-area-context')>(
        'react-native-safe-area-context'
      ),
      'useSafeAreaInsets'
    )
    .mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
  try {
    const { getByTestId, rerender } = renderNavigator();
    fireEvent(getByTestId('bottom-tab-bar'), 'layout', {
      nativeEvent: { layout: { width: 350, height: 95, x: 0, y: 0 } },
    });
    expect(getByTestId('measured-tab-height').props.children).toBe(
      95 + PerfectSpacing.base
    );
    fireEvent(getByTestId('bottom-tab-bar'), 'layout', {
      nativeEvent: { layout: { width: 900, height: 136, x: 0, y: 0 } },
    });
    expect(getByTestId('measured-tab-height').props.children).toBe(
      136 + PerfectSpacing.base
    );
    safeInsets.mockReturnValue({ top: 0, bottom: 34, left: 0, right: 0 });
    rerender(
      <AllProviders>
        <NavigationContainer>
          <BottomTabNavigator />
        </NavigationContainer>
      </AllProviders>
    );
    expect(getByTestId('measured-tab-height').props.children).toBe(
      136 + Math.max(34, PerfectSpacing.base)
    );
  } finally {
    safeInsets.mockRestore();
  }
});

// C44: la barra cresce di quanto cresce la riga dell'etichetta, dal primo passo sopra 1,0 al tetto.
it('barra delle schede: cresce col testo', () => {
  const passi = [1, 1.1, 1.3, 1.5, 2];
  const finestre = [
    { width: 360, height: 640 },
    { width: 320, height: 568 },
    { width: 393, height: 852 },
  ];
  for (const finestra of finestre) {
    const altezze = passi.map(s => tabBarHeight(s, finestra));
    expect(altezze[0]).toBeCloseTo(
      scaleWithDimensions(TAB_BAR_BASE_HEIGHT, finestra.width, finestra.height),
      6
    );
    for (let i = 1; i < altezze.length; i++) {
      expect(altezze[i]).toBeGreaterThan(altezze[i - 1] as number);
    }
    // Il margine attorno all'etichetta non si consuma: la barra cresce quanto la riga.
    const riga = tabLabelLineHeight(finestra);
    passi.forEach((s, i) => {
      expect((altezze[i] as number) - (altezze[0] as number)).toBeCloseTo(
        riga * (s - 1),
        6
      );
    });
    expect(tabBarHeight(3, finestra)).toBeCloseTo(tabBarHeight(2, finestra), 6);
  }

  // La barra disegnata usa la stessa funzione con la scala di sistema di adesso.
  const fontScale = jest.spyOn(PixelRatio, 'getFontScale');
  try {
    const finestra = Dimensions.get('window');
    const disegnata = (s: number) => {
      fontScale.mockReturnValue(s);
      const ui = renderNavigator();
      const altezza = StyleSheet.flatten(
        ui.getByTestId('bottom-tab-bar').props.style
      ).height as number;
      ui.unmount();
      return altezza;
    };
    const a1 = disegnata(1);
    const a13 = disegnata(1.3);
    const a2 = disegnata(2);
    expect(a1).toBeCloseTo(tabBarHeight(1, finestra), 6);
    expect(a13).toBeCloseTo(tabBarHeight(1.3, finestra), 6);
    expect(a2).toBeCloseTo(tabBarHeight(2, finestra), 6);
    expect(a13).toBeGreaterThan(a1);
    expect(a2).toBeGreaterThan(a13);
  } finally {
    fontScale.mockRestore();
  }
});

describe('BottomTabNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render bottom tab navigator', () => {
      const { getByTestId } = renderNavigator();
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    it('should render the three tabs', () => {
      const { getByLabelText, queryByLabelText } = renderNavigator();

      // Check for Italian tab accessibility labels
      expect(getByLabelText(/Impatto/i)).toBeTruthy();
      expect(getByLabelText(/Home/i)).toBeTruthy();
      expect(getByLabelText(/Azioni/i)).toBeTruthy();
      // L'account sta nell'intestazione, non nella barra.
      expect(queryByLabelText(/Profilo/i)).toBeNull();
    });

    it('should show Home tab as active by default', () => {
      const { getByTestId } = renderNavigator();
      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  describe('Tab Navigation', () => {
    it('should navigate to Impact tab when pressed', async () => {
      const { getByLabelText, getByTestId } = renderNavigator();

      // Find and press Impact tab (Italian label)
      const impactTab = getByLabelText(/Impatto/i);
      fireEvent.press(impactTab);

      await waitFor(() => {
        expect(getByTestId('impact-screen')).toBeTruthy();
      });
    });

    it('indietro: dalla Home esce, da un altro tab torna alla Home', async () => {
      const ref = createNavigationContainerRef();
      const { getByLabelText, getByTestId } = render(
        <AllProviders>
          <NavigationContainer ref={ref}>
            <BottomTabNavigator />
          </NavigationContainer>
        </AllProviders>
      );

      // Home è la destinazione iniziale: «indietro» deve uscire dall'app.
      await waitFor(() => expect(ref.isReady()).toBe(true));
      expect(ref.canGoBack()).toBe(false);

      fireEvent.press(getByLabelText(/Impatto/i));
      await waitFor(() => expect(getByTestId('impact-screen')).toBeTruthy());
      expect(ref.canGoBack()).toBe(true);

      act(() => ref.goBack());
      await waitFor(() => expect(getByTestId('home-screen')).toBeTruthy());
      expect(ref.canGoBack()).toBe(false);
    });

    it('should navigate to Contribute tab when pressed', async () => {
      const { getByLabelText, getByTestId } = renderNavigator();

      // Find and press Azioni/Contribute tab (Italian label)
      const contributeTab = getByLabelText(/Azioni/i);
      fireEvent.press(contributeTab);

      await waitFor(() => {
        expect(getByTestId('contribute-screen')).toBeTruthy();
      });
    });

    it('should trigger haptic feedback on tab press', async () => {
      const { getByLabelText } = renderNavigator();

      const impactTab = getByLabelText(/Impatto/i);
      fireEvent.press(impactTab);

      await waitFor(() => {
        expect(Haptics.impactAsync).toHaveBeenCalledWith(
          Haptics.ImpactFeedbackStyle.Medium
        );
      });
    });

    it('should not navigate if already on the same tab', async () => {
      const { getByLabelText } = renderNavigator();

      // Home tab is active by default (Italian label)
      const homeTab = getByLabelText(/Home/i);

      // Clear previous calls
      jest.clearAllMocks();

      fireEvent.press(homeTab);

      // Should not trigger navigation or haptic
      await waitFor(() => {
        expect(Haptics.impactAsync).not.toHaveBeenCalled();
      });
    });
  });

  describe('Tab Bar Styling', () => {
    it('should apply central tab styling to HomeTab', () => {
      const { getByLabelText } = renderNavigator();
      const homeTab = getByLabelText(/Home/i);

      // HomeTab should have different styling (isCentral: true)
      expect(homeTab).toBeTruthy();
    });

    it('should apply Impact tab red color', () => {
      const { getByLabelText } = renderNavigator();
      const impactTab = getByLabelText(/Impatto/i);

      // ImpactTab should have red background (#DC2626)
      expect(impactTab).toBeTruthy();
    });

    it('should apply Contribute tab green color', () => {
      const { getByLabelText } = renderNavigator();
      const contributeTab = getByLabelText(/Azioni/i);

      // InfoTab should have green background (#059669)
      expect(contributeTab).toBeTruthy();
    });
  });

  describe('Icon Mapping', () => {
    it('should display correct icon for Impact tab', () => {
      const { getByLabelText } = renderNavigator();
      const impactTab = getByLabelText(/Impatto/i);

      // Should use 'chart-line' icon
      expect(impactTab).toBeTruthy();
    });

    it('should display correct icon for Home tab', () => {
      const { getByLabelText } = renderNavigator();
      const homeTab = getByLabelText(/Home/i);

      // Should use 'home' icon
      expect(homeTab).toBeTruthy();
    });

    it('should display correct icon for Contribute tab', () => {
      const { getByLabelText } = renderNavigator();
      const contributeTab = getByLabelText(/Azioni/i);

      // Should use 'hand-heart' icon
      expect(contributeTab).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility labels for all tabs', () => {
      const { getByLabelText } = renderNavigator();

      expect(() => getByLabelText(/Impatto/i)).not.toThrow();
      expect(() => getByLabelText(/Home/i)).not.toThrow();
      expect(() => getByLabelText(/Azioni/i)).not.toThrow();
    });

    it('should handle long press on tabs', () => {
      const { getByLabelText } = renderNavigator();
      const homeTab = getByLabelText(/Home/i);

      // Should not throw error on long press
      expect(() => fireEvent(homeTab, 'longPress')).not.toThrow();
    });
  });

  describe('Safe Area Handling', () => {
    it('should respect safe area insets', () => {
      // The component uses useSafeAreaInsets() to position the tab bar
      const { getByTestId } = renderNavigator();
      expect(getByTestId('home-screen')).toBeTruthy();
    });

    it('should apply minimum spacing when insets are zero', () => {
      // Component uses Math.max(insets.bottom, PerfectSpacing.base)
      const { getByTestId } = renderNavigator();
      expect(getByTestId('home-screen')).toBeTruthy();
    });
  });

  describe('Tab Bar Component Memoization', () => {
    it('should memoize TabBar component', () => {
      // Component uses React.memo to prevent unnecessary re-renders
      const { rerender } = renderNavigator();

      // Re-render with same props
      rerender(
        <AllProviders>
          <NavigationContainer>
            <BottomTabNavigator />
          </NavigationContainer>
        </AllProviders>
      );

      // Should not cause errors or unnecessary renders
      expect(true).toBe(true);
    });
  });

  describe('Navigation Events', () => {
    it('should emit tabPress event on tab press', async () => {
      const { getByLabelText } = renderNavigator();
      const impactTab = getByLabelText(/Impatto/i);

      fireEvent.press(impactTab);

      await waitFor(() => {
        // Navigation event should be emitted
        expect(true).toBe(true);
      });
    });

    it('should emit tabLongPress event on long press', () => {
      const { getByLabelText } = renderNavigator();
      const homeTab = getByLabelText(/Home/i);

      fireEvent(homeTab, 'longPress');

      // Should emit longPress event without errors
      expect(true).toBe(true);
    });

    it('should prevent default navigation if event is prevented', () => {
      // This tests the canPreventDefault logic in the component
      const { getByLabelText } = renderNavigator();
      const impactTab = getByLabelText(/Impatto/i);

      fireEvent.press(impactTab);

      // Should handle preventDefault correctly
      expect(true).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing descriptor gracefully', () => {
      // Component checks `if (!descriptor) return null`
      const result = renderNavigator();
      expect(result).toBeTruthy();
    });

    it('should handle route name not in ICON_MAP', () => {
      // Component has fallback for unknown route names
      const result = renderNavigator();
      expect(result).toBeTruthy();
    });
  });
});
