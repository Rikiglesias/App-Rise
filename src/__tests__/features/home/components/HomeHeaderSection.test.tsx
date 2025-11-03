import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { HomeHeaderSection } from '@/features/home/components/HomeHeaderSection';
import { renderWithProviders } from '@/__tests__/helpers/testProviders';

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('HomeHeaderSection', () => {
  it('renderizza titolo e immagine hero con overlay', () => {
    const scrollY = new Animated.Value(0);
    renderWithProviders(<HomeHeaderSection scrollY={scrollY} />, render);
    expect(screen.getByText(/Rise Against/i)).toBeTruthy();
    expect(screen.getByText(/Italia/i)).toBeTruthy();
    expect(screen.getByLabelText('Hero Rise Against Hunger')).toBeTruthy();
  });
});
