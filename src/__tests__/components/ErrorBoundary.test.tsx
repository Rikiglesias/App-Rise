/**
 * Test per ErrorBoundary
 * Rise Against Hunger Italia
 */

import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Componente che genera errore per testing
const ThrowError: React.FC<{ shouldThrow: boolean }> = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <Text>No error</Text>;
};

describe('ErrorBoundary', () => {
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
});
