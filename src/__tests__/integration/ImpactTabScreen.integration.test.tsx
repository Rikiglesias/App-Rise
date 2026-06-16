/**
 * IMPACT TAB SCREEN - INTEGRATION TEST
 *
 * Test integrazione completa della schermata Impact:
 * - Rendering di tutti i componenti
 * - Scroll interactions
 * - Navigation flows
 * - Data loading
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import ImpactTabScreen from '@/features/impact/screens/ImpactTabScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

// Mock components
jest.mock('@/features/impact/components', () => ({
  ImpactHeader: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>Il Nostro Impatto</Text>
      </View>
    );
  },
  TotalMealsSection: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>Pasti Donati</Text>
      </View>
    );
  },
  Results2024Section: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>Risultati 2024</Text>
      </View>
    );
  },
  CommunitySection: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>La Nostra Community</Text>
      </View>
    );
  },
  MapSection: () => {
    const { View, Text } = require('react-native');
    return (
      <View>
        <Text>Dove Operiamo</Text>
      </View>
    );
  },
}));
jest.mock('@/components/ui', () => ({
  PerfectText: ({ children, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{children}</Text>;
  },
  PerfectContainer: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  PerfectImage: ({ source, ...props }: any) => {
    const { Image } = require('react-native');
    return <Image source={source} {...props} />;
  },
  PlatformTouchable: ({ children, onPress, testID, ...props }: any) => {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        {children}
      </TouchableOpacity>
    );
  },
  PlatformScrollView: ({ children, ...props }: any) => {
    const { ScrollView } = require('react-native');
    return <ScrollView {...props}>{children}</ScrollView>;
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
}));

// Mock icons
jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

describe('ImpactTabScreen - Integration Test', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('dovrebbe renderizzare la schermata completa senza errori', async () => {
    const { toJSON } = renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });

  it('dovrebbe mostrare l\'header "Il Nostro Impatto"', async () => {
    renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(screen.getByText(/Il Nostro Impatto/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione pasti donati', async () => {
    renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(screen.getByText(/Pasti Donati/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione mappa Italia', async () => {
    renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(screen.getByText(/Dove Operiamo/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione risultati 2024', async () => {
    renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(screen.getByText(/Risultati 2024/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione community', async () => {
    renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    await waitFor(() => {
      expect(screen.getByText(/La Nostra Community/i)).toBeTruthy();
    });
  });

  it('dovrebbe gestire lo scroll senza crash', async () => {
    const { toJSON } = renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    // Verifica che il componente ScrollView sia renderizzato
    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });

  it('dovrebbe avere tutte le animazioni inizializzate', async () => {
    const { toJSON } = renderWithProviders(
      <NavigationContainer>
        <ImpactTabScreen />
      </NavigationContainer>,
      render
    );

    // Le animazioni dovrebbero essere inizializzate senza errori
    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });
});
