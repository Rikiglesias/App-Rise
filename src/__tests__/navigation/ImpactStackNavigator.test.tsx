import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ImpactStackNavigator from '../../navigation/ImpactStackNavigator';

// Mock all screen components
jest.mock('../../features/impact', () => ({
  ImpactTabScreen: () => null,
}));

jest.mock('../../features/impact/screens/MapModalScreen', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../navigation/LazyLoading', () => ({
  WrappedSimplePlaceholderScreen: () => null,
}));

describe('ImpactStackNavigator', () => {
  const renderNavigator = () => {
    return render(
      <NavigationContainer>
        <ImpactStackNavigator />
      </NavigationContainer>
    );
  };

  it('should render without crashing', () => {
    const { root } = renderNavigator();
    expect(root).toBeTruthy();
  });

  it('should be a valid React component', () => {
    expect(typeof ImpactStackNavigator).toBe('function');
  });

  it('should render within NavigationContainer', () => {
    const result = renderNavigator();
    expect(result).toBeTruthy();
  });
});
