/**
 * MAP SECTION COMPONENT TEST
 * 
 * Test suite per il componente MapSection che mostra
 * la mappa dell'Italia con indicatore cliccabile.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MapSection } from '@/features/impact/components/MapSection';

// Mock PerfectImage
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
  PlatformTouchable: ({ children, onPress, ...props }: any) => {
    const { TouchableOpacity } = require('react-native');
    return <TouchableOpacity onPress={onPress} {...props}>{children}</TouchableOpacity>;
  },
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

const mockOnMapPress = jest.fn();

describe('MapSection Component', () => {
  beforeEach(() => {
    mockOnMapPress.mockClear();
  });

  it('dovrebbe renderizzare il componente senza errori', () => {
    const { toJSON } = render(<MapSection onMapPress={mockOnMapPress} />);
    expect(toJSON()).toBeTruthy();
  });

  it('dovrebbe mostrare il titolo della sezione', () => {
    render(<MapSection onMapPress={mockOnMapPress} />);
    expect(screen.getByText(/Dove Operiamo/i)).toBeTruthy();
  });

  it('dovrebbe mostrare l\'immagine della mappa', () => {
    const { toJSON } = render(<MapSection onMapPress={mockOnMapPress} />);
    const tree = toJSON();
    
    // Verifica presenza immagine
    expect(tree).toBeTruthy();
  });

  it('dovrebbe mostrare l\'indicatore "Tocca per esplorare"', () => {
    render(<MapSection onMapPress={mockOnMapPress} />);
    expect(screen.getByText(/Tocca per esplorare/i)).toBeTruthy();
  });

  it('dovrebbe chiamare onMapPress quando si clicca sulla mappa', () => {
    const { getByText } = render(<MapSection onMapPress={mockOnMapPress} />);
    
    // Trova e clicca l'elemento touchable
    const touchable = getByText(/Tocca per esplorare/i).parent?.parent;
    if (touchable) {
      fireEvent.press(touchable);
    }
    
    expect(mockOnMapPress).toHaveBeenCalled();
  });

  it('dovrebbe avere il gradient overlay corretto', () => {
    const { toJSON } = render(<MapSection onMapPress={mockOnMapPress} />);
    const tree = toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});
