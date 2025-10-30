import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import ActionCardEnhanced from '../../../components/domain/ActionCardEnhanced';
import { AllProviders } from '../../helpers/testProviders';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
}));

// Helper to wrap components with ThemeProvider
const renderWithTheme = (component: React.ReactElement) => {
  return render(<AllProviders>{component}</AllProviders>);
};

describe('ActionCardEnhanced', () => {
  const mockOnPress = jest.fn();
  const defaultProps = {
    title: 'Progetti',
    description: 'Scopri i nostri progetti internazionali',
    icon: '🌍',
    onPress: mockOnPress,
    variant: 'info' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with all props', () => {
    const { getByLabelText, toJSON } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    // Usa accessibilityLabel che è sempre presente
    const card = getByLabelText(
      'Progetti: Scopri i nostri progetti internazionali'
    );
    expect(card).toBeTruthy();
    expect(toJSON()).toBeDefined();
  });

  it('should handle press events', async () => {
    const { getByLabelText } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const card = getByLabelText(
      'Progetti: Scopri i nostri progetti internazionali'
    );
    fireEvent.press(card);

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  it('should handle different variants', () => {
    const variants = ['info', 'success', 'warning', 'brand'] as const;

    variants.forEach(variant => {
      const { getByLabelText } = renderWithTheme(
        <ActionCardEnhanced {...defaultProps} variant={variant} />
      );
      expect(
        getByLabelText('Progetti: Scopri i nostri progetti internazionali')
      ).toBeTruthy();
    });
  });

  it('should handle different content', () => {
    const { getByLabelText } = renderWithTheme(
      <ActionCardEnhanced
        {...defaultProps}
        title="Test Title"
        description="Test Description"
        icon="🎯"
      />
    );
    expect(getByLabelText('Test Title: Test Description')).toBeTruthy();
  });

  it('should handle press animations', () => {
    const { getByLabelText } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const card = getByLabelText(
      'Progetti: Scopri i nostri progetti internazionali'
    );

    fireEvent(card, 'pressIn');
    fireEvent(card, 'pressOut');

    expect(card).toBeTruthy();
  });

  it('should be accessible', () => {
    const { getByLabelText, getByRole } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const card = getByLabelText(
      'Progetti: Scopri i nostri progetti internazionali'
    );
    expect(card).toBeTruthy();
    expect(getByRole('button')).toBeTruthy();
  });

  it('should handle edge cases', () => {
    const customOnPress = jest.fn();
    const { getByLabelText } = renderWithTheme(
      <ActionCardEnhanced
        {...defaultProps}
        onPress={customOnPress}
        title=""
        description=""
      />
    );

    const card = getByLabelText(': ');
    fireEvent.press(card);

    expect(customOnPress).toHaveBeenCalled();
  });
});
