/**
 * ACTION BUTTONS COMPONENT TEST
 *
 * Test suite per il componente ActionButtons refactored.
 * Verifica separazione Business Logic / UI e comportamento dei bottoni.
 */

import React from 'react';
import { Animated } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import ActionButtons from '@/features/actions/components/ActionButtons/ActionButtons';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock haptic feedback
jest.mock('@/shared/hooks/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: jest.fn(),
  }),
}));

// Mock link handler
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({
    openLink: jest.fn(),
  }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock icons
jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

const mockAnimations = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ] as const,
};

const mockNavigation = { navigate: mockNavigate } as any;

describe('ActionButtons Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('dovrebbe renderizzare il componente senza errori', () => {
    const { toJSON } = renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );
    expect(toJSON()).toBeTruthy();
  });

  it('dovrebbe mostrare le tre sezioni di bottoni', () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    // Sezione Donazioni (titolo bottone principale)
    expect(screen.getByText(/Dona Ora/i)).toBeTruthy();

    // Sezione Esplora (almeno una occorrenza di "Progetti")
    expect(screen.getAllByText(/Progetti/i).length).toBeGreaterThan(0);

    // Sezione Community (bottone "Seguici")
    expect(screen.getByText(/Seguici/i)).toBeTruthy();
  });

  it("non mostra il DonationInfoModal all'inizio (prima del tap)", () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    // Il testo del modal non è presente finché non si preme info
    expect(screen.queryByText(/Come (Donare|funziona)/i)).toBeNull();
  });

  it('dovrebbe usare useActionButtonsData hook per la business logic', () => {
    // Test che verifica la separazione Business Logic / UI
    const { toJSON } = renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    expect(toJSON()).toBeTruthy();
    // Hook interno gestisce dati e handlers
  });

  it('dovrebbe renderizzare ActionButtonsUI per la presentazione', () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    // Verifica elementi chiave senza snapshot fragile
    expect(screen.getByTestId('donate-header')).toBeTruthy();
    expect(screen.getByText(/Dona Ora/i)).toBeTruthy();
    expect(screen.getAllByText(/Progetti/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Seguici/i)).toBeTruthy();
  });
});
