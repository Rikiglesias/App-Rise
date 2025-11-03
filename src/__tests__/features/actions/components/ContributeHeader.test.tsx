import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import ContributeHeader from '@/features/actions/components/shared/ContributeHeader';

// Minimal animations stub (values are static in production code)
const mockAnimations = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: [
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const,
};

describe('ContributeHeader', () => {
  it('renders titles and subtitle with testIDs', () => {
    renderWithProviders(
      <ContributeHeader animations={mockAnimations as any} />,
      render
    );

    expect(screen.getByTestId('actions-header')).toBeTruthy();
    expect(screen.getByTestId('actions-title-1')).toBeTruthy();
    expect(screen.getByTestId('actions-title-2')).toBeTruthy();
    expect(screen.getByTestId('actions-subtitle')).toBeTruthy();
  });
});
