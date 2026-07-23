/**
 * ACTION BUTTONS - Donate Section tests
 * Verifica i tre bottoni: Dona Ora, Charity Shop, Gift Cards
 * - Presenza via testID
 * - Press handler instrada verso il flusso partner corretto (goal partner-identita F1.7):
 *   Dona → Donorbox (openDonation); shop/gift card → Let's Donation (openLetsDonationExit)
 */

import React from 'react';
import { Animated } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import { RISE_URLS } from '@/shared/constants/urls';

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

// Mock link handler (usato da useActionButtonsData solo per tracciabilità = sito Rise)
const mockOpenTracciabilitaLink = jest.fn();
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({
    openLink: jest.fn(),
    openTracciabilitaLink: mockOpenTracciabilitaLink,
  }),
}));

// Mock del flusso partner: spia gli handler senza toccare auth/DB reali.
const mockOpenDonation = jest.fn();
const mockOpenLetsDonationExit = jest.fn();
jest.mock('@/shared/partner/usePartnerExit', () => ({
  usePartnerExit: () => ({
    isLoading: null,
    disclosureVisible: false,
    openDonation: mockOpenDonation,
    openLetsDonationExit: mockOpenLetsDonationExit,
    confirmDisclosure: jest.fn(),
    cancelDisclosure: jest.fn(),
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

// Mock modali (fuori scope di questo test)
jest.mock('@/features/actions/components/shared/DonationInfoModal', () => ({
  __esModule: true,
  default: () => null,
  DonationInfoModalMigrated: () => null,
}));
jest.mock(
  '@/features/actions/components/shared/PartnerDisclosureModal',
  () => ({
    __esModule: true,
    default: () => null,
    PartnerDisclosureModal: () => null,
  })
);

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
    PerfectText: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
    PerfectContainer: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
    PlatformIcon: ({ name }: any) => (
      <Text accessibilityLabel={`icon-${name}`} />
    ),
    PerfectIcon: ({ name }: any) => (
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

  it('instrada verso il flusso partner corretto quando premuti', async () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={mockNavigation} />,
      render
    );

    fireEvent.press(screen.getByTestId('action-button-dona'));
    fireEvent.press(screen.getByTestId('action-button-charity-shop'));
    fireEvent.press(screen.getByTestId('action-button-gift-card'));

    await screen.findByTestId('action-button-gift-card');
    // Attendi ciclo async dell'handler (triggerHaptic prima di onPress)
    await new Promise(r => setTimeout(r, 0));

    // Dona → Donorbox (nessuna schermata onesta)
    expect(mockOpenDonation).toHaveBeenCalledTimes(1);
    // Shop e Gift Card → Let's Donation con l'URL e la loadingKey giusti
    expect(mockOpenLetsDonationExit).toHaveBeenCalledWith(
      RISE_URLS.shop,
      'shop',
      expect.any(String)
    );
    expect(mockOpenLetsDonationExit).toHaveBeenCalledWith(
      RISE_URLS.giftCards,
      'giftcard',
      expect.any(String)
    );
    // Haptic per ogni pressione
    expect(mockTriggerHaptic).toHaveBeenCalled();
  });
});
