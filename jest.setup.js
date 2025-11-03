import 'react-native-gesture-handler/jestSetup';

// Ensure __DEV__ exists in Jest/CI environment
// Enable development-mode logging for tests
// Adjust to false if you want production-style silent logging
global.__DEV__ = true;

// React Navigation mock removed for 100% pure component testing
// Components requiring navigation should be tested with NavigationContainer

// Expo Status Bar mock removed - not needed for UI component testing

// prop-types mock removed - deprecated and not needed for modern React testing

// Console mock removed - using real console for better Logger integration
// Our Logger system handles console output properly

// Mock TurboModuleRegistry DevMenu to avoid RN DevMenu in tests
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => {
  const actual = jest.requireActual('react-native/Libraries/TurboModule/TurboModuleRegistry');
  return {
    ...actual,
    getEnforcing: (name) => {
      if (name === 'DevMenu') {
        return {};
      }
      try {
        return actual.getEnforcing(name);
      } catch {
        return {};
      }
    },
  };
});


// Mock NativeSettingsManager to satisfy React Native Settings module in Jest
jest.mock('react-native/Libraries/Settings/NativeSettingsManager', () => ({
  default: {
    getConstants: () => ({
      userInterfaceStyle: 'light',
      selectedFontScale: 1,
    }),
    setValues: () => {},
  },
}));

// Fallback mock for Settings to avoid internal NativeSettingsManager dependency issues
jest.mock('react-native/Libraries/Settings/Settings', () => ({
  default: {
    _settings: {},
    get: () => null,
    set: () => {},
    watchKeys: () => 0,
    clearWatch: () => {},
    _sendObservations: () => {},
  },
}));

// Provide SafeArea defaults to avoid provider errors in integration tests
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => children,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaView: ({ children, ...props }) => React.createElement('View', props, children),
  };
});
