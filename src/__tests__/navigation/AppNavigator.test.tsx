import React from 'react';
import { render } from '@testing-library/react-native';
import { AllProviders } from '../helpers/testProviders';
import AppNavigator from '../../navigation/AppNavigator';

// Mock all screen components
jest.mock('../../features/about/screens/ChiSiamoScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../features/social/screens/SeguiciScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../navigation/LazyLoading', () => ({
  WrappedImpatto2024Screen: () => null,
  WrappedProjectsScreen: () => null,
  WrappedDevelopmentScreen: () => null,
}));

jest.mock('../../navigation/BottomTabNavigator', () => ({
  __esModule: true,
  default: () => null,
}));

describe('AppNavigator', () => {
  it('should render without crashing', () => {
    const { root } = render(
      <AllProviders>
        <AppNavigator />
      </AllProviders>
    );
    expect(root).toBeTruthy();
  });

  it('should be a valid React component', () => {
    expect(typeof AppNavigator).toBe('function');
  });

  it('should wrap content in NavigationContainer', () => {
    const { UNSAFE_root } = render(
      <AllProviders>
        <AppNavigator />
      </AllProviders>
    );
    expect(UNSAFE_root).toBeTruthy();
  });
});
