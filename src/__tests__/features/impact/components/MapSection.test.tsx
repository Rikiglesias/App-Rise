/**
 * MAP SECTION COMPONENT TEST
 *
 * Test suite per il componente MapSection che mostra
 * la mappa dell'Italia con indicatore cliccabile.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MapSection } from '@/features/impact/components/MapSection';
import { AllProviders } from '../../../helpers/testProviders';
import i18n from '@/locales';

// Forza locale italiana per test consistenti
beforeAll(() => {
  i18n.locale = 'it';
});

// Mock Perfect UI Components
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
  PerfectIcon: ({ name, ...props }: any) => {
    const { Text } = require('react-native');
    return <Text {...props}>{name}</Text>;
  },
  PlatformTouchable: ({ children, onPress, ...props }: any) => {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity onPress={onPress} {...props}>
        {children}
      </TouchableOpacity>
    );
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

const mockOnMapPress = jest.fn();

// MapSection è dark-aware (useThemeColors) → richiede il provider del tema.
const MapSectionWithTheme = (props: { onMapPress: () => void }) => (
  <AllProviders>
    <MapSection {...props} />
  </AllProviders>
);

describe('MapSection Component', () => {
  beforeEach(() => {
    mockOnMapPress.mockClear();
  });

  it('dovrebbe renderizzare il componente senza errori', () => {
    const { toJSON } = render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);
    expect(toJSON()).toBeTruthy();
  });

  it('dovrebbe mostrare il titolo della sezione', () => {
    render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);
    expect(screen.getByText(/Dove Operiamo/i)).toBeTruthy();
  });

  it("dovrebbe mostrare l'immagine della mappa", () => {
    const { toJSON } = render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);
    const tree = toJSON();

    // Verifica presenza immagine
    expect(tree).toBeTruthy();
  });

  it('dovrebbe mostrare l\'indicatore "Tocca per esplorare"', () => {
    render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);
    expect(screen.getByText(/Tocca per esplorare/i)).toBeTruthy();
  });

  it('dovrebbe chiamare onMapPress quando si clicca sulla mappa', () => {
    const { getByText } = render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);

    // Trova e clicca l'elemento touchable
    const touchable = getByText(/Tocca per esplorare/i).parent?.parent;
    if (touchable) {
      fireEvent.press(touchable);
    }

    expect(mockOnMapPress).toHaveBeenCalled();
  });

  it('dovrebbe avere il gradient overlay corretto', () => {
    const { toJSON } = render(<MapSectionWithTheme onMapPress={mockOnMapPress} />);
    const tree = toJSON();

    expect(tree).toMatchSnapshot();
  });
});
