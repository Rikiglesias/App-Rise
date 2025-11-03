/**
 * ACTION BUTTONS - Donate Section tests
 * Verifica i tre bottoni: Dona Ora, Charity Shop, Gift Cards
 * - Presenza via testID
 * - Press handler chiama i link handler corretti
 */

import React from 'react';
import { Animated } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';

// Mock navigation
const mockNavigate = jest.fn();

// Mock haptic feedback
const mockTriggerHaptic = jest.fn();
jest.mock('@/shared/hooks/useHapticFeedback', () => ({
  useHapticFeedback: () => ({
    triggerHaptic: (...args: unknown[]) => {
      mockTriggerHaptic(...args);
    },
  }),
}));

// Mock link handler
const mockOpenDonationLink = jest.fn();
const mockOpenShopLink = jest.fn();
const mockOpenGiftCardLink = jest.fn();
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({
    openLink: jest.fn(),
    openDonationLink: mockOpenDonationLink,
    openEventsLink: jest.fn(),
    openShopLink: mockOpenShopLink,
    openGiftCardLink: mockOpenGiftCardLink,
    openProjectsLink: jest.fn(),
    openTracciabilitaLink: jest.fn(),
  }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

// Mock UI components to ensure press events work in tests
jest.mock('@/components/ui', () => {
  const React = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  return {
    PlatformTouchable: ({ children, onPress, testID, ...props }: any) => (
      <TouchableOpacity onPress={onPress} testID={testID} {...props}>
        {children}
      </TouchableOpacity>
    ),
    PerfectText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    PerfectContainer: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    PlatformIcon: ({ name, size, color }: any) => (
      <Text accessibilityLabel={`icon-${name}`} />
    ),
    PerfectIcon: ({ name, size, color }: any) => (
      <Text accessibilityLabel={`icon-${name}`} />
    ),
  };
});

// eslint-disable-next-line import/first -- Import dopo mock setup è necessario per test
import ActionButtons from '@/features/actions/components/ActionButtons/ActionButtons';

const mockAnimations = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: [
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ] as const,
};

const mockNavigation = { navigate: mockNavigate } as any;

describe('ActionButtons Donate section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderizza i tre bottoni con testID', () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    expect(screen.getByTestId('action-button-dona')).toBeTruthy();
    expect(screen.getByTestId('action-button-charity-shop')).toBeTruthy();
    expect(screen.getByTestId('action-button-gift-card')).toBeTruthy();
  });

  it('chiama i link handler corretti quando premuti', async () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    fireEvent.press(screen.getByTestId('action-button-dona'));
    fireEvent.press(screen.getByTestId('action-button-charity-shop'));
    fireEvent.press(screen.getByTestId('action-button-gift-card'));

    await screen.findByTestId('action-button-gift-card');
    // Attendi ciclo async dell'handler
    await new Promise(r => setTimeout(r, 0));
    expect(mockOpenDonationLink).toHaveBeenCalledTimes(1);
    expect(mockOpenShopLink).toHaveBeenCalledTimes(1);
    expect(mockOpenGiftCardLink).toHaveBeenCalledTimes(1);
    // Haptic viene chiamato per ogni pressione
    expect(mockTriggerHaptic).toHaveBeenCalled();
  });
});
