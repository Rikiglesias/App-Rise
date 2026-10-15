/**
 * Test per ErrorBoundary
 * Rise Against Hunger Italia
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { changeLanguage, getCurrentLocale } from '@/locales';

// Componente che genera errore per testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
  const originalLocale = getCurrentLocale();
  const runtime = globalThis as typeof globalThis & { __DEV__: boolean };
  const originalDev = runtime.__DEV__;
  beforeEach(() => {
    changeLanguage('it');
  });
  afterEach(() => {
    changeLanguage(originalLocale);
    runtime.__DEV__ = originalDev;
  });
  // Sopprime console.error durante i test per non inquinare l'output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('renders children when no error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(getByText('No error')).toBeTruthy();
  });

  it('renders error UI when child throws error', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verifica che mostri il messaggio di errore
    expect(getByText('Qualcosa è andato storto')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });

  it('shows reload button', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(getByText('🔄 Ricarica App')).toBeTruthy();
  });

  it.each([
    [
      'it',
      'Qualcosa è andato storto',
      "Ricarica l'app e riprova.",
      '🔄 Ricarica App',
    ],
    [
      'en',
      'Something went wrong',
      'Please reload the app and try again.',
      '🔄 Reload app',
    ],
  ] as const)(
    'in produzione usa %s senza mostrare dettagli tecnici',
    (locale, title, message, reload) => {
      runtime.__DEV__ = false;
      changeLanguage(locale);
      const { getByText, queryByText } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow />
        </ErrorBoundary>
      );
      expect(getByText(title)).toBeTruthy();
      expect(getByText(message)).toBeTruthy();
      expect(getByText(reload)).toBeTruthy();
      expect(
        queryByText(
          /Test error|Errore Tecnico|Technical error|Stack|Ignore error|Ignora errore/
        )
      ).toBeNull();
    }
  );

  it('in sviluppo traduce i titoli e conserva il dettaglio tecnico', () => {
    runtime.__DEV__ = true;
    changeLanguage('en');
    const { getByText } = render(
      <ErrorBoundary>
        <ThrowError shouldThrow />
      </ErrorBoundary>
    );
    expect(getByText('Technical error:')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
  });
});
