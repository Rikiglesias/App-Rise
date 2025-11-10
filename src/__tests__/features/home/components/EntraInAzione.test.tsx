/**
 * ENTRA IN AZIONE COMPONENT TEST
 *
 * Test suite per il componente principale della home che mostra
 * titolo, descrizione e CTA buttons per navigare verso Impact e Actions.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// Mock navigation - PRIMA degli import
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

// Mock useTranslation per testi italiani - PRIMA dell'import del componente
jest.mock('@/shared/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'home.actionTitle': '⚡ Entra in Azione',
        'home.actionMainText':
          'Unisciti a noi nella lotta contro la fame nel mondo',
        'home.actionSubText': 'Ogni azione conta per cambiare vite',
        'home.ctaImpactLabel': 'Scopri il nostro impatto',
        'home.ctaImpactHint': 'Apre la sezione Impatto',
        'home.ctaImpactButton': 'Scopri Impatto',
        'home.ctaImpactSub': 'Risultati',
        'home.ctaDonateLabel': 'Dona e aiuta',
        'home.ctaDonateHint': 'Apre la sezione Azioni',
        'home.ctaDonateButton': 'Dona e Aiuta',
        'home.ctaDonateSub': 'Supporta',
      };
      return translations[key] || key;
    },
    locale: 'it',
    setLocale: jest.fn(),
    isItalian: true,
    isEnglish: false,
  }),
}));

// Import del componente DOPO i mock (necessario per far funzionare i mock)
// eslint-disable-next-line import/first
import { EntraInAzione } from '@/features/home/components/EntraInAzione';

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

// Mock UniversalTheme to avoid provider requirement in this unit test
jest.mock('@/shared/theme/UniversalTheme', () => ({
  UniversalThemeProvider: ({ children }: any) => children,
  useUniversalTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    setTheme: jest.fn(),
    themeMode: 'light',
    // Empty colors to preserve previous snapshot (no auto background)
    colors: {} as any,
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
