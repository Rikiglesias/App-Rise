import React from 'react';
import { Animated } from 'react-native';
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from '@testing-library/react-native';

import { renderWithProviders } from '@/__tests__/helpers/testProviders';
import ActionButtons from '@/features/actions/components/ActionButtons/ActionButtons';

// Mock link handler to avoid external calls
jest.mock('@/shared/hooks/useLinkHandler', () => ({
  useLinkHandler: () => ({
    openLink: jest.fn(),
    openTracciabilitaLink: jest.fn(),
  }),
}));

// Mock del flusso partner: il test tocca solo la modale "Come donare", non le uscite.
jest.mock('@/shared/partner/usePartnerExit', () => ({
  usePartnerExit: () => ({
    isLoading: null,
    disclosureVisible: false,
    openDonation: jest.fn(),
    openLetsDonationExit: jest.fn(),
    confirmDisclosure: jest.fn(),
    cancelDisclosure: jest.fn(),
  }),
}));

jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock(
  '@expo/vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons'
);

const mockAnimations = {
  fadeAnim: new Animated.Value(1),
  slideAnim: new Animated.Value(0),
  scaleAnim: new Animated.Value(1),
  buttonAnimations: Array.from(
    { length: 8 },
    () => new Animated.Value(1)
  ) as any,
};

describe('DonationInfoModal integration', () => {
  it('apre e chiude il modal informazioni donazioni', async () => {
    renderWithProviders(
      <ActionButtons animations={mockAnimations} navigation={{} as any} />,
      render
    );

    fireEvent.press(screen.getByTestId('donate-info-button'));
    await waitFor(() => expect(screen.getByText(/Come Donare/i)).toBeTruthy());
    expect(screen.getByTestId('donation-modal-content')).toBeTruthy();

    fireEvent.press(screen.getByTestId('donation-modal-close'));
  });
});
