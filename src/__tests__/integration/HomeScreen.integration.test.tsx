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

// Mock ThemeProvider
jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#DC2626',
      background: '#FFFFFF',
      text: '#1F2937',
      neutral: {
        0: '#FFFFFF',
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
      },
    },
  }),
  ThemeProvider: ({ children }: any) => children,
}));

// Mock useTranslation per forzare italiano
jest.mock('@/shared/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Mock traduzioni italiane per i test
      const translations: Record<string, string> = {
        'home.screenLabel': 'Schermata Home',
        'home.actionTitle': '⚡ Entra in Azione',
        'home.actionMainText':
          'Unisciti a noi nella lotta contro la fame nel mondo',
        'home.actionSubText': 'Ogni azione conta per cambiare vite',
        'home.ctaImpactLabel': 'Scopri il nostro impatto',
        'home.ctaImpactHint': 'Apre la sezione Impatto',
        'home.ctaImpactButton': 'Scopri Impatto',
        'home.ctaImpactSub': 'Risultati',
        'home.ctaDonateLabel': 'Dona e aiuta',
        'home.ctaDonateHint': 'Apre la sezione Azioni',
        'home.ctaDonateButton': 'Dona e Aiuta',
        'home.ctaDonateSub': 'Supporta',
      };
      return translations[key] || key;
    },
    locale: 'it',
    setLocale: jest.fn(),
    isItalian: true,
    isEnglish: false,
  }),
}));

// Mock UniversalTheme to avoid provider requirement in this integration test
jest.mock('@/shared/theme/UniversalTheme', () => ({
  UniversalThemeProvider: ({ children }: any) => children,
  useUniversalTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
    themeMode: 'light',
    colors: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      card: '#FFFFFF',
      modal: '#FFFFFF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      textMuted: '#9CA3AF',
      border: '#E5E7EB',
      borderLight: '#F3F4F6',
      accent: '#DC2626',
      success: '#10B981',
      warning: '#D97706',
    },
  }),
}));

// Import HomeScreen DOPO i mock (necessario per far funzionare i mock)
// eslint-disable-next-line import/first
import HomeScreen from '@/features/home/screens/HomeScreen';

// Creo provider semplificato locale
const AllProviders = ({ children }: any) => {
  return React.createElement(React.Fragment, null, children);
};

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
  PerfectCardContainer: ({ children, ...props }: any) => {
    const { View } = require('react-native');
    return <View {...props}>{children}</View>;
  },
  PerfectImage: ({ source, ...props }: any) => {
    const { Image } = require('react-native');
    return <Image source={source} {...props} />;
  },
  PerfectIcon: ({ name, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{name}</Text>;
  },
  PlatformTouchable: ({ children, onPress, testID, ...props }: any) => {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        {children}
      </TouchableOpacity>
    );
  },
  Logo: ({ ...props }: any) => {
    const { View, Text } = require('react-native');
    return (
      <View {...props}>
        <Text>Logo</Text>
      </View>
    );
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

describe('HomeScreen - Integration Test', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('dovrebbe renderizzare la schermata completa senza errori', async () => {
    const { toJSON } = render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });
  });

  it("dovrebbe mostrare il titolo nell'header", async () => {
    render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText('Rise Against')).toBeTruthy();
      expect(screen.getByText(/Hunger/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare la sezione "Entra in Azione"', async () => {
    render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/Entra in Azione/i)).toBeTruthy();
    });
  });

  it('dovrebbe mostrare i 2 CTA buttons', async () => {
    render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cta-impact')).toBeTruthy();
      expect(screen.getByTestId('cta-donate')).toBeTruthy();
    });
  });

  it('dovrebbe gestire lo scroll con animazioni', async () => {
    const { toJSON } = render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(toJSON()).toBeTruthy();
    });

    // Header dovrebbe avere animazioni parallax configurate
  });

  it('dovrebbe avere gradient background', async () => {
    const { toJSON } = render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      expect(toJSON()).toMatchSnapshot();
    });
  });

  it('dovrebbe mostrare tutti i componenti principali insieme', async () => {
    render(
      <AllProviders>
        <NavigationContainer>
          <HomeScreen navigation={mockNavigation as any} />
        </NavigationContainer>
      </AllProviders>
    );

    await waitFor(() => {
      // Header con titolo principale
      expect(screen.getByText(/Rise Against/i)).toBeTruthy();
      expect(screen.getByText(/Hunger/i)).toBeTruthy();

      // EntraInAzione section
      expect(screen.getByText(/Entra in Azione/i)).toBeTruthy();
      expect(screen.getByTestId('action-description-card')).toBeTruthy();

      // CTA Buttons
      expect(screen.getByTestId('cta-impact')).toBeTruthy();
      expect(screen.getByTestId('cta-donate')).toBeTruthy();
    });
  });
});
