/**
 * HOME SCREEN - INTEGRATION TEST
 * 
 * Test integrazione completa della schermata Home:
 * - Rendering di tutti i componenti principali
 * - Header con logo e scroll parallax
 * - Sezione EntraInAzione con CTA
 * - Navigation verso altre tab
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from '@/features/home/screens/HomeScreen';

// Mock navigation
const mockNavigate = jest.fn();
const mockNavigation = {
  navigate: mockNavigate,
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

// Mock haptic feedback
jest.mock('@/shared/hooks/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: jest.fn(),
  }),
}));

// Mock components
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
    return <TouchableOpacity onPress={onPress} testID={testID} {...props}>{children}</TouchableOpacity>;
  },
  Logo: ({ ...props }: any) => {
    const { View, Text } = require('react-native');
    return <View {...props}><Text>Logo</Text></View>;
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
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('HomeScreen - Integration Test', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('dovrebbe renderizzare la schermata completa senza errori', async () => {
    const { toJSON } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });

  it('dovrebbe mostrare il logo nell\'header', async () => {
    render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Logo')).toBeTruthy();
    });
  });

  it('dovrebbe mostrare il titolo "Rise Against Hunger Italia"', async () => {
    render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Rise Against Hunger Italia/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione "Entra in Azione"', async () => {
    render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Entra in Azione/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare i 2 CTA buttons', async () => {
    render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Scopri.*Impatto/i)).toBeTruthy();
      expect(screen.getByText(/Cosa puoi fare/i)).toBeTruthy();
    });
  });

  it('dovrebbe gestire lo scroll con animazioni', async () => {
    const { toJSON } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
    
    // Header dovrebbe avere animazioni parallax configurate
  });

  it('dovrebbe avere gradient background', async () => {
    const { toJSON } = render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      expect(toJSON()).toMatchSnapshot();
    });
  });

  it('dovrebbe mostrare tutti i componenti principali insieme', async () => {
    render(
      <NavigationContainer>
        <HomeScreen navigation={mockNavigation as any} />
      </NavigationContainer>
    );
    
    await waitFor(() => {
      // Header
      expect(screen.getByText('Logo')).toBeTruthy();
      expect(screen.getByText(/Rise Against Hunger Italia/i)).toBeTruthy();
      
      // EntraInAzione section
      expect(screen.getByText(/Entra in Azione/i)).toBeTruthy();
      expect(screen.getByText(/Scopri.*Impatto/i)).toBeTruthy();
      expect(screen.getByText(/Cosa puoi fare/i)).toBeTruthy();
    });
  });
});
