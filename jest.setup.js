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
