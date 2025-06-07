import 'react-native-gesture-handler/jestSetup';

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));

// Silence the warning about deprecated prop-types
jest.mock('prop-types', () => {
  const PropTypes = jest.requireActual('prop-types');
  return {
    ...PropTypes,
    // Add any specific mock you might need
  };
});

// Mock console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};
