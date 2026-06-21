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

jest.mock('@/components/layout/WorldMapSvg', () => 'WorldMapSvg');

// eslint-disable-next-line import/first -- Import dopo mock setup è necessario per test
import { MapSection } from '@/features/impact/components/MapSection';

describe('MapSection map-search clamp', () => {
  const originalGet = jest.requireActual('react-native').Dimensions.get;
  const Dimensions = require('react-native').Dimensions;

  afterEach(() => {
    Dimensions.get = originalGet;
  });

  it('clamps to min on small devices', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 320, height: 568 });
    const { getByTestId } = renderWithProviders(
      <MapSection locations={[]} onMapPress={() => {}} />,
      render
    );
    expect(getByTestId(/mdi-map-search-24/)).toBeTruthy();
  });

  it('clamps to max on large tablets', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 1366, height: 1024 });
    const { getByTestId } = renderWithProviders(
      <MapSection locations={[]} onMapPress={() => {}} />,
      render
    );
    expect(getByTestId(/mdi-map-search-32/)).toBeTruthy();
  });
});
