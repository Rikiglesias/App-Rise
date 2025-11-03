import React from 'react';
import { render } from '@testing-library/react-native';

// Mock MDI to expose size and name via text for assertions
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ name, size, color }: any) => React.createElement(Text, { testID: `mdi-${name}-${size}-${color || 'none'}` }, 'icon');
});

import { PerfectIcon } from '@/components/ui';

describe('PerfectIcon clamp behavior', () => {
  const originalGet = jest.requireActual('react-native').Dimensions.get;
  const Dimensions = require('react-native').Dimensions;

  afterEach(() => {
    // restore original Dimensions.get
    Dimensions.get = originalGet;
  });

  it('clamps to minSize on very small devices', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 320, height: 568 }); // small phone
    const { getByTestId } = render(
      <PerfectIcon name="information" size={16} minSize={14} maxSize={18} />
    );
    // scale(16) ~ 13.x -> clamped to 14
    expect(getByTestId(/mdi-information-14/)).toBeTruthy();
  });

  it('clamps to maxSize on large tablets', () => {
    Dimensions.get = jest.fn().mockReturnValue({ width: 1366, height: 1024 }); // large tablet
    const { getByTestId } = render(
      <PerfectIcon name="information" size={16} minSize={14} maxSize={18} />
    );
    // scale(16) >> 18 -> clamped to 18
    expect(getByTestId(/mdi-information-18/)).toBeTruthy();
  });
});
