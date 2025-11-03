/**
 * ENTRA IN AZIONE COMPONENT TEST
 * 
 * Test suite per il componente principale della home che mostra
 * titolo, descrizione e CTA buttons per navigare verso Impact e Actions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EntraInAzione } from '@/features/home/components/EntraInAzione';

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

// Mock useTheme
jest.mock('@/shared/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      primary: '#DC2626',
      background: '#FFFFFF',
      text: '#1F2937',
    },
  }),
}));

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// Mock icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');

describe('EntraInAzione Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it('dovrebbe renderizzare il componente senza errori', () => {
    const { toJSON } = render(<EntraInAzione />);
    expect(toJSON()).toBeTruthy();
  });

  it('dovrebbe mostrare il titolo "Entra in Azione"', () => {
    render(<EntraInAzione />);
    expect(screen.getByTestId('action-title')).toBeTruthy();
  });

  it('dovrebbe mostrare la descrizione (due frasi)', () => {
    render(<EntraInAzione />);
    expect(screen.getByTestId('action-description-main')).toBeTruthy();
    expect(screen.getByTestId('action-description-sub')).toBeTruthy();
  });

  it('dovrebbe mostrare entrambi i bottoni CTA', () => {
    render(<EntraInAzione />);
    expect(screen.getByTestId('cta-impact')).toBeTruthy();
    expect(screen.getByTestId('cta-donate')).toBeTruthy();
  });

  it('dovrebbe navigare a ImpactTab quando si clicca il CTA impatto', () => {
    render(<EntraInAzione />);
    const impactButton = screen.getByTestId('cta-impact');
    fireEvent.press(impactButton);
    expect(mockNavigate).toHaveBeenCalledWith('ImpactTab');
  });

  it('dovrebbe navigare a InfoTab quando si clicca il CTA dona', () => {
    render(<EntraInAzione />);
    const donateButton = screen.getByTestId('cta-donate');
    fireEvent.press(donateButton);
    expect(mockNavigate).toHaveBeenCalledWith('InfoTab');
  });

  it('dovrebbe avere gli stili corretti per i gradient borders', () => {
    const { toJSON } = render(<EntraInAzione />);
    const tree = toJSON();
    
    // Verifica che il componente abbia una struttura valida
    expect(tree).toMatchSnapshot();
  });
});
