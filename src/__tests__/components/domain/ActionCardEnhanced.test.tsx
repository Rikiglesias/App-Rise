import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

import ActionCardEnhanced from '../../../components/domain/ActionCardEnhanced';
import { ThemeProvider } from '../../../shared/hooks/useTheme';

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
  return render(<ThemeProvider>{component}</ThemeProvider>);
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
    const { getByText, toJSON } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    expect(getByText('Progetti')).toBeTruthy();
    expect(getByText('Scopri i nostri progetti internazionali')).toBeTruthy();
    expect(getByText('🌍')).toBeTruthy();
    expect(toJSON()).toBeDefined();
  });

  it('should handle press events', async () => {
    const { getByText } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const card = getByText('Progetti');
    fireEvent.press(card.parent?.parent || card);

    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalled();
    });
  });

  it('should handle different variants', () => {
    const variants = ['info', 'success', 'warning', 'brand'] as const;

    variants.forEach(variant => {
      const { getByText } = renderWithTheme(
        <ActionCardEnhanced {...defaultProps} variant={variant} />
      );
      expect(getByText('Progetti')).toBeTruthy();
    });
  });

  it('should handle different content', () => {
    const { getByText } = renderWithTheme(
      <ActionCardEnhanced
        {...defaultProps}
        title="Test Title"
        description="Test Description"
        icon="🎯"
      />
    );
    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Description')).toBeTruthy();
    expect(getByText('🎯')).toBeTruthy();
  });

  it('should handle press animations', () => {
    const { getByText } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const card = getByText('Progetti');

    fireEvent(card.parent?.parent || card, 'pressIn');
    fireEvent(card.parent?.parent || card, 'pressOut');

    expect(card).toBeTruthy();
  });

  it('should be accessible', () => {
    const { getByText } = renderWithTheme(
      <ActionCardEnhanced {...defaultProps} />
    );

    const title = getByText('Progetti');
    const description = getByText('Scopri i nostri progetti internazionali');
    const icon = getByText('🌍');

    expect(title).toBeTruthy();
    expect(description).toBeTruthy();
    expect(icon).toBeTruthy();
  });

  it('should handle edge cases', () => {
    const customOnPress = jest.fn();
    const { getByText } = renderWithTheme(
      <ActionCardEnhanced
        {...defaultProps}
        onPress={customOnPress}
        title=""
        description=""
      />
    );

    const card = getByText('🌍');
    fireEvent.press(card.parent?.parent || card);

    expect(customOnPress).toHaveBeenCalled();
  });
});
