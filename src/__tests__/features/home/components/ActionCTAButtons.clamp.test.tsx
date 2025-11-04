import React from 'react';
import { render } from '@testing-library/react-native';
import { renderWithProviders } from '@/__tests__/helpers/testProviders';

// Mock MDI to expose computed size
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, size, color }: any) =>
    React.createElement(
      Text,
      { testID: `mdi-${name}-${size}-${color || 'none'}` },
      'icon'
    );
});

// Mock gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: any) =>
      require('react').createElement(View, props, children),
  };
});

// eslint-disable-next-line import/first -- Import dopo mock setup è necessario per test
import { ActionCTAButtons } from '@/features/home/components/EntraInAzione/ActionCTAButtons';

// Mock navigation hook used inside ActionCTAButtons
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn() }),
  };
});

describe('ActionCTAButtons icon clamp', () => {
  const originalGet = jest.requireActual('react-native').Dimensions.get;
  const Dimensions = require('react-native').Dimensions;

  afterEach(() => {
    Dimensions.get = originalGet;
  });

  it('clamps arrow-left/right to min on small devices', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 320, height: 568 });
    const { getByTestId } = renderWithProviders(<ActionCTAButtons />, render);
    expect(getByTestId(/mdi-arrow-left-18/)).toBeTruthy();
    expect(getByTestId(/mdi-arrow-right-18/)).toBeTruthy();
  });

  it('clamps arrow-left/right to max on large tablets', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 1366, height: 1024 });
    const { getByTestId } = renderWithProviders(<ActionCTAButtons />, render);
    expect(getByTestId(/mdi-arrow-left-24/)).toBeTruthy();
    expect(getByTestId(/mdi-arrow-right-24/)).toBeTruthy();
  });
});
