// Mock react-native-gesture-handler BEFORE import to prevent React Native renderer errors
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(component => component),
    Directions: {},
    GestureDetector: View,
    Gesture: {
      Tap: () => ({}),
      Pan: () => ({}),
      Pinch: () => ({}),
      Rotation: () => ({}),
      Fling: () => ({}),
      LongPress: () => ({}),
      ForceTouch: () => ({}),
      Native: () => ({}),
      Race: () => ({}),
      Simultaneous: () => ({}),
      Exclusive: () => ({}),
    },
    GestureHandlerRootView: View,
  };
});

// Mock @sentry/react-native: nei test niente modulo nativo né invii reali.
// wrap deve restituire il componente (pass-through) così App renderizza.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: jest.fn(component => component),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
  setTag: jest.fn(),
}));

// Now safe to import
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
  const actual = jest.requireActual(
    'react-native/Libraries/TurboModule/TurboModuleRegistry'
  );
  return {
    ...actual,
    // Il modulo nativo RNGoogleSignin non è registrato in jest, ma il mock JS di
    // @react-native-google-signin/google-signin sì: facciamo passare la sonda
    // non-enforcing di loadGoogleSignin (socialAuth) così i test del login Google
    // raggiungono il mock invece di uscire subito.
    get: name => {
      if (name === 'RNGoogleSignin') {
        return {};
      }
      return actual.get(name);
    },
    getEnforcing: name => {
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

// Mock expo-constants to avoid EXDevLauncher errors in tests
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        fontScaleUnlockThreshold: 1.3,
      },
    },
    manifest: {
      extra: {
        fontScaleUnlockThreshold: 1.3,
      },
    },
  },
}));

// Mock expo-updates for OTA functionality in tests
jest.mock('expo-updates', () => ({
  __esModule: true,
  manifest: {
    extra: {
      fontScaleUnlockThreshold: 1.3,
    },
  },
  checkForUpdateAsync: jest.fn(),
  fetchUpdateAsync: jest.fn(),
  reloadAsync: jest.fn(),
}));

// Mock globale del client Supabase: nessuna chiamata di rete nei test.
// I test che servono comportamenti specifici possono override con jest.mock locale.
jest.mock('@/shared/auth/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithPassword: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      signUp: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
      resetPasswordForEmail: jest.fn(() => Promise.resolve({ error: null })),
      signInWithIdToken: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      updateUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      setSession: jest.fn(() =>
        Promise.resolve({ data: { session: null }, error: null })
      ),
      startAutoRefresh: jest.fn(),
      stopAutoRefresh: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      insert: jest.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock expo-linking (deep link recovery password): createURL/useURL deterministici nei test.
jest.mock('expo-linking', () => ({
  createURL: jest.fn(path => `rahitalia://${path}`),
  useURL: jest.fn(() => null),
  parse: jest.fn(),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

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
      return React.createElement(
        SafeAreaInsetsContext.Provider,
        {
          value: defaultInsets,
        },
        React.createElement(
          SafeAreaFrameContext.Provider,
          {
            value: defaultFrame,
          },
          children
        )
      );
    },
    SafeAreaConsumer: SafeAreaInsetsContext.Consumer,
    useSafeAreaInsets: () => defaultInsets,
    useSafeAreaFrame: () => defaultFrame,
    SafeAreaView: ({ children, ...props }) =>
      React.createElement('View', props, children),
    initialWindowMetrics: {
      insets: defaultInsets,
      frame: defaultFrame,
    },
  };
});

// Mock expo-linear-gradient to avoid undefined errors in tests
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  return {
    LinearGradient: ({ children, ...props }) =>
      React.createElement('View', props, children),
  };
});

// Mock expo-blur to avoid undefined errors in tests
jest.mock('expo-blur', () => {
  const React = require('react');
  return {
    BlurView: ({ children, ...props }) =>
      React.createElement('View', props, children),
  };
});

// Mock social auth native modules (no native runtime in Jest)
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(() =>
    Promise.resolve({ identityToken: 'apple-token-mock' })
  ),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
  AppleAuthenticationButton: 'AppleAuthenticationButton',
  AppleAuthenticationButtonType: { SIGN_IN: 0, CONTINUE: 1, SIGN_UP: 2 },
  AppleAuthenticationButtonStyle: { WHITE: 0, WHITE_OUTLINE: 1, BLACK: 2 },
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(() => Promise.resolve(true)),
    signIn: jest.fn(() =>
      Promise.resolve({ type: 'success', data: { idToken: 'google-token-mock' } })
    ),
  },
  GoogleSigninButton: 'GoogleSigninButton',
  statusCodes: {},
}));

// Mock @react-native-community/datetimepicker (modulo nativo): nei test renderizza un
// Pressable che, premuto, conferma una data FISSA valida (1990-01-01, adulto) per
// determinismo (evita flakiness sul confronto temporale di validateAdult).
jest.mock('@react-native-community/datetimepicker', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');
  const FIXED_DATE = new Date(1990, 0, 1);
  const DateTimePicker = ({ onChange, testID }) =>
    React.createElement(
      Pressable,
      {
        testID: testID || 'date-picker',
        accessibilityLabel: 'date-picker-confirm',
        onPress: () => onChange && onChange({ type: 'set' }, FIXED_DATE),
      },
      React.createElement(Text, null, 'date-picker')
    );
  return { __esModule: true, default: DateTimePicker };
});

// Mock React Native Animated API for complete animation support in tests
// Fixes: TypeError: Cannot read properties of undefined (reading 'S')

// Create mockable Animated.Value with all required methods
const createMockAnimatedValue = (initialValue = 0) => {
  let value = initialValue;
  const listeners = [];

  return {
    setValue: jest.fn(newValue => {
      value = newValue;
      listeners.forEach(listener => listener.listener({ value }));
    }),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    addListener: jest.fn(listener => {
      const id = String(listeners.length);
      listeners.push({ id, listener });
      return id;
    }),
    removeListener: jest.fn(id => {
      const index = listeners.findIndex(l => l.id === id);
      if (index >= 0) listeners.splice(index, 1);
    }),
    removeAllListeners: jest.fn(() => listeners.splice(0)),
    stopAnimation: jest.fn(callback => callback?.(value)),
    resetAnimation: jest.fn(callback => {
      value = initialValue;
      callback?.(value);
    }),
    interpolate: jest.fn(_config => createMockAnimatedValue(value)),
    animate: jest.fn(),
    __getValue: jest.fn(() => value),
    __getAnimatedValue: jest.fn(() => value),
    __attach: jest.fn(),
    __detach: jest.fn(),
    __makeNative: jest.fn(),
    __onAnimatedValueUpdateReceived: jest.fn(),
    // Serializzazione per snapshot - restituisce valore primitivo
    toJSON: jest.fn(() => value),
  };
};

// Mock Animated timing/spring/decay with proper callback support
const createMockAnimation = () => ({
  start: jest.fn(callback => {
    // Simulate successful animation completion synchronously
    // No setTimeout to avoid "act()" warnings and ensure immediate completion
    callback?.({ finished: true });
  }),
  stop: jest.fn(),
  reset: jest.fn(),
});

// Override global React Native Animated
const RN = require('react-native');

// Preserve original Animated structure
const OriginalAnimated = RN.Animated;

RN.Animated.Value = jest.fn(initialValue =>
  createMockAnimatedValue(initialValue)
);
RN.Animated.ValueXY = jest.fn(initialValue => {
  const x = createMockAnimatedValue(initialValue?.x ?? 0);
  const y = createMockAnimatedValue(initialValue?.y ?? 0);
  return {
    x,
    y,
    setValue: jest.fn(value => {
      x.setValue(value.x);
      y.setValue(value.y);
    }),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    resetAnimation: jest.fn(),
    stopAnimation: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    getLayout: jest.fn(() => ({ left: x, top: y })),
    getTranslateTransform: jest.fn(() => [
      { translateX: x },
      { translateY: y },
    ]),
  };
});

RN.Animated.timing = jest.fn(() => createMockAnimation());
RN.Animated.spring = jest.fn(() => createMockAnimation());
RN.Animated.decay = jest.fn(() => createMockAnimation());

RN.Animated.sequence = jest.fn(animations => ({
  start: jest.fn(callback => {
    // Execute all animations in sequence
    animations.forEach(anim => anim.start?.());
    callback?.({ finished: true });
  }),
  stop: jest.fn(),
  reset: jest.fn(),
}));

RN.Animated.parallel = jest.fn(animations => ({
  start: jest.fn(callback => {
    // Execute all animations in parallel
    animations.forEach(anim => anim.start?.());
    callback?.({ finished: true });
  }),
  stop: jest.fn(),
  reset: jest.fn(),
}));

RN.Animated.stagger = jest.fn((delay, animations) => ({
  start: jest.fn(callback => {
    animations.forEach(anim => anim.start?.());
    callback?.({ finished: true });
  }),
  stop: jest.fn(),
  reset: jest.fn(),
}));

RN.Animated.delay = jest.fn(() => createMockAnimation());
RN.Animated.loop = jest.fn(animation => ({
  start: jest.fn(callback => {
    animation.start?.();
    callback?.({ finished: true });
  }),
  stop: jest.fn(),
  reset: jest.fn(),
}));

// Preserve other Animated methods
RN.Animated.add = jest.fn((_a, _b) => createMockAnimatedValue(0));
RN.Animated.subtract = jest.fn((_a, _b) => createMockAnimatedValue(0));
RN.Animated.multiply = jest.fn((_a, _b) => createMockAnimatedValue(0));
RN.Animated.divide = jest.fn((_a, _b) => createMockAnimatedValue(1));
RN.Animated.modulo = jest.fn((_a, _modulus) => createMockAnimatedValue(0));
RN.Animated.diffClamp = jest.fn((_a, _min, _max) => createMockAnimatedValue(0));

// Event handling
RN.Animated.event = jest.fn(() => jest.fn());

// Ensure createAnimatedComponent works
RN.Animated.createAnimatedComponent = OriginalAnimated.createAnimatedComponent;
