import React from 'react';
import { Text, View, type ViewProps } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { LazyScreen } from '../../navigation/LazyLoading/LazyScreen';
import { changeLanguage, getCurrentLocale } from '@/locales';
import { UniversalThemeProvider } from '@/shared/theme/UniversalTheme';

// Mock logger to avoid console noise
jest.mock('../../shared/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mock PerfectText
jest.mock('../../components/ui', () => ({
  PerfectContainer: ({
    children,
    ...props
  }: React.PropsWithChildren<ViewProps>) => {
    const { View: RNView } = require('react-native');
    return <RNView {...props}>{children}</RNView>;
  },
  PerfectText: ({ children, onPress, ...props }: any) => {
    const { Text: RNText, TouchableOpacity } = require('react-native');
    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} testID="perfect-text-touchable">
          <RNText {...props}>{children}</RNText>
        </TouchableOpacity>
      );
    }
    return <RNText {...props}>{children}</RNText>;
  },
}));

describe('LazyScreen', () => {
  describe('Basic Rendering', () => {
    it('should render children successfully', () => {
      const { getByText } = render(
        <LazyScreen>
          <Text>Test Content</Text>
        </LazyScreen>
      );

      expect(getByText('Test Content')).toBeTruthy();
    });

    it('should handle multiple children', () => {
      const { getByText } = render(
        <LazyScreen>
          <View>
            <Text>First Child</Text>
            <Text>Second Child</Text>
          </View>
        </LazyScreen>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
    });

    it('should render with default loading fallback', () => {
      const { getByText } = render(
        <LazyScreen>
          <Text>Content</Text>
        </LazyScreen>
      );

      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Custom Fallbacks', () => {
    it('should render custom loading fallback', () => {
      const CustomLoading = () => <Text>Custom Loading...</Text>;

      const { getByText } = render(
        <LazyScreen fallback={CustomLoading}>
          <Text>Content</Text>
        </LazyScreen>
      );

      // Children should be visible (Suspense resolved immediately in tests)
      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept custom error fallback', () => {
      const CustomError = ({ error, retry }: any) => (
        <View>
          <Text>Custom Error: {error.message}</Text>
          <Text onPress={retry}>Custom Retry</Text>
        </View>
      );

      const { getByText } = render(
        <LazyScreen errorFallback={CustomError}>
          <Text>Content</Text>
        </LazyScreen>
      );

      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('errori di caricamento tradotti', () => {
    const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
    const originalDev = runtime.__DEV__;
    const originalLocale = getCurrentLocale();
    let consoleSpy: jest.SpyInstance;
    let shouldThrow: boolean;
    const BrokenScreen = () => {
      if (shouldThrow) throw new Error('Private loading detail');
      return <Text>Recovered screen</Text>;
    };
    beforeEach(() => {
      shouldThrow = true;
      consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
    });
    afterEach(() => {
      runtime.__DEV__ = originalDev;
      changeLanguage(originalLocale);
      consoleSpy.mockRestore();
    });
    it.each([
      [
        'it',
        'Errore di caricamento',
        'Impossibile caricare la schermata. Riprova.',
        'Riprova',
      ],
      [
        'en',
        'Loading error',
        'Unable to load this screen. Please try again.',
        'Retry',
      ],
    ] as const)(
      'in produzione usa %s, nasconde il messaggio tecnico e consente retry',
      (locale, title, message, retry) => {
        runtime.__DEV__ = false;
        changeLanguage(locale);
        const { getByText, queryByText } = render(
          <UniversalThemeProvider>
            <LazyScreen>
              <BrokenScreen />
            </LazyScreen>
          </UniversalThemeProvider>
        );
        expect(getByText(title)).toBeTruthy();
        expect(getByText(message)).toBeTruthy();
        expect(queryByText('Private loading detail')).toBeNull();
        shouldThrow = false;
        fireEvent.press(getByText(retry));
        expect(getByText('Recovered screen')).toBeTruthy();
      }
    );
    it('in sviluppo conserva il dettaglio tecnico', () => {
      runtime.__DEV__ = true;
      changeLanguage('en');
      const { getByText } = render(
        <UniversalThemeProvider>
          <LazyScreen>
            <BrokenScreen />
          </LazyScreen>
        </UniversalThemeProvider>
      );
      expect(getByText('Private loading detail')).toBeTruthy();
      expect(getByText('Loading error')).toBeTruthy();
    });
  });

  describe('Suspense Integration', () => {
    it('should wrap children in Suspense', () => {
      const { getByText } = render(
        <LazyScreen>
          <Text>Suspense Content</Text>
        </LazyScreen>
      );

      expect(getByText('Suspense Content')).toBeTruthy();
    });

    it('should handle Suspense with custom loading', () => {
      const CustomLoading = () => <Text>Loading custom...</Text>;

      const { getByText } = render(
        <LazyScreen fallback={CustomLoading}>
          <Text>Loaded</Text>
        </LazyScreen>
      );

      expect(getByText('Loaded')).toBeTruthy();
    });
  });

  describe('Component Props', () => {
    it('should accept and use fallback prop', () => {
      const MyFallback = () => <Text>My Fallback</Text>;

      const { getByText } = render(
        <LazyScreen fallback={MyFallback}>
          <Text>Content</Text>
        </LazyScreen>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should accept and use errorFallback prop', () => {
      const MyErrorFallback = ({ error, retry }: any) => (
        <Text>Error: {error.message}</Text>
      );

      const { getByText } = render(
        <LazyScreen errorFallback={MyErrorFallback}>
          <Text>Content</Text>
        </LazyScreen>
      );

      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle null children gracefully', () => {
      const result = render(<LazyScreen>{null}</LazyScreen>);

      expect(result).toBeTruthy();
    });

    it('should handle undefined children gracefully', () => {
      const result = render(<LazyScreen>{undefined}</LazyScreen>);

      expect(result).toBeTruthy();
    });

    it('should handle empty children', () => {
      const result = render(
        <LazyScreen>
          <></>
        </LazyScreen>
      );

      expect(result).toBeTruthy();
    });
  });
});
