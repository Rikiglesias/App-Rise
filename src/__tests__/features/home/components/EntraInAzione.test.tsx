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
    expect(screen.getByText(/Entra in Azione/i)).toBeTruthy();
  });

  it('dovrebbe mostrare la descrizione del componente', () => {
    render(<EntraInAzione />);
    expect(screen.getByText(/Esplora l'impatto/i)).toBeTruthy();
  });

  it('dovrebbe mostrare entrambi i bottoni CTA', () => {
    render(<EntraInAzione />);
    
    // Verifica presenza bottoni
    expect(screen.getByText(/Scopri.*Impatto/i)).toBeTruthy();
    expect(screen.getByText(/Cosa puoi fare/i)).toBeTruthy();
  });

  it('dovrebbe navigare a ImpactTab quando si clicca "Scopri Impatto"', () => {
    render(<EntraInAzione />);
    
    const impactButton = screen.getByText(/Scopri.*Impatto/i);
    fireEvent.press(impactButton.parent?.parent as any);
    
    expect(mockNavigate).toHaveBeenCalledWith('ImpactTab');
  });

  it('dovrebbe navigare a ActionsTab quando si clicca "Cosa puoi fare"', () => {
    render(<EntraInAzione />);
    
    const actionsButton = screen.getByText(/Cosa puoi fare/i);
    fireEvent.press(actionsButton.parent?.parent as any);
    
    expect(mockNavigate).toHaveBeenCalledWith('ActionsTab');
  });

  it('dovrebbe avere gli stili corretti per i gradient borders', () => {
    const { toJSON } = render(<EntraInAzione />);
    const tree = toJSON();
    
    // Verifica che il componente abbia una struttura valida
    expect(tree).toMatchSnapshot();
  });
});
