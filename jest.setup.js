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

// Do NOT mock UniversalTheme here: some tests validate real behavior.

// Provide SafeArea defaults to avoid provider errors in integration tests
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  
  // Create a proper Context for React Native Paper compatibility
  const defaultInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const defaultFrame = { x: 0, y: 0, width: 390, height: 844 };
  
  const SafeAreaInsetsContext = React.createContext(defaultInsets);
  const SafeAreaFrameContext = React.createContext(defaultFrame);
  
  return {
    SafeAreaContext: React.createContext({
      insets: defaultInsets,
      frame: defaultFrame,
    }),
    SafeAreaInsetsContext,
    SafeAreaFrameContext,
    SafeAreaProvider: ({ children }) => {
      return React.createElement(SafeAreaInsetsContext.Provider, {
        value: defaultInsets
      }, React.createElement(SafeAreaFrameContext.Provider, {
        value: defaultFrame
      }, children));
    },
    SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
    useSafeAreaInsets: () => defaultInsets,
    useSafeAreaFrame: () => defaultFrame,
    SafeAreaView: ({ children, ...props }) => React.createElement('View', props, children),
    initialWindowMetrics: {
      insets: defaultInsets,
      frame: defaultFrame,
    },
  };
});
