/* eslint-disable max-lines-per-function */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import EnhancedTouchable from '../../../components/ui/EnhancedTouchable';

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: {
    Light: 'Light',
    Medium: 'Medium',
    Heavy: 'Heavy',
  },
}));

describe('EnhancedTouchable', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render children correctly', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Test Button</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Test Button')).toBeTruthy();
    });

    it('should render without crashing', () => {
      const { toJSON } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Test</Text>
        </EnhancedTouchable>
      );

      expect(toJSON()).toBeDefined();
    });
  });

  describe('Press Interactions', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Press me</Text>
        </EnhancedTouchable>
      );

      fireEvent.press(getByText('Press me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} disabled>
          <Text>Disabled Button</Text>
        </EnhancedTouchable>
      );

      fireEvent.press(getByText('Disabled Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle multiple presses', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Multi Press</Text>
        </EnhancedTouchable>
      );

      const button = getByText('Multi Press');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should support accessibility label', () => {
      const { getByLabelText } = render(
        <EnhancedTouchable
          onPress={mockOnPress}
          accessibilityLabel="Custom Button"
        >
          <Text>Button</Text>
        </EnhancedTouchable>
      );

      expect(getByLabelText('Custom Button')).toBeTruthy();
    });

    it('should support accessibility role', () => {
      const { getByRole } = render(
        <EnhancedTouchable onPress={mockOnPress} accessibilityRole="button">
          <Text>Button</Text>
        </EnhancedTouchable>
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should handle disabled state accessibility', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} disabled>
          <Text>Disabled</Text>
        </EnhancedTouchable>
      );

      const button = getByText('Disabled');
      expect(button).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('should apply custom styles', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} style={customStyle}>
          <Text>Styled Button</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Styled Button')).toBeTruthy();
    });

    it('should handle style arrays', () => {
      const styles = [{ backgroundColor: 'red' }, { padding: 10 }];
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} style={styles}>
          <Text>Multi Style</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Multi Style')).toBeTruthy();
    });
  });

  describe('Animation States', () => {
    it('should handle press animation', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Animated Button</Text>
        </EnhancedTouchable>
      );

      const button = getByText('Animated Button');
      fireEvent(button, 'pressIn');
      fireEvent(button, 'pressOut');

      expect(mockOnPress).not.toHaveBeenCalled(); // Only on press, not pressIn/Out
    });

    it('should support animations', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Opacity Animation</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Opacity Animation')).toBeTruthy();
    });
  });

  describe('Haptic Feedback', () => {
    it('should trigger haptic feedback on press', () => {
      const haptics = jest.requireMock('expo-haptics');

      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} hapticFeedback>
          <Text>Haptic Button</Text>
        </EnhancedTouchable>
      );

      const button = getByText('Haptic Button');

      // First trigger pressIn to activate haptic feedback
      fireEvent(button, 'pressIn');

      expect(haptics.impactAsync).toHaveBeenCalled();
    });

    it('should not trigger haptic feedback when disabled', () => {
      const haptics = jest.requireMock('expo-haptics');

      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} hapticFeedback={false}>
          <Text>No Haptic</Text>
        </EnhancedTouchable>
      );

      fireEvent.press(getByText('No Haptic'));

      expect(haptics.impactAsync).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined onPress gracefully', () => {
      expect(() => {
        render(
          <EnhancedTouchable>
            <Text>No Handler</Text>
          </EnhancedTouchable>
        );
      }).not.toThrow();
    });

    it('should handle single child', () => {
      const { toJSON } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Single Child</Text>
        </EnhancedTouchable>
      );

      expect(toJSON()).toBeDefined();
    });

    it('should handle complex children structure', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Parent</Text>
          <Text>Child</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Parent')).toBeTruthy();
      expect(getByText('Child')).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle rapid presses', () => {
      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress}>
          <Text>Rapid Press</Text>
        </EnhancedTouchable>
      );

      const button = getByText('Rapid Press');

      // Simulate rapid presses
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(mockOnPress).toHaveBeenCalledTimes(10);
    });

    it('should maintain performance with complex styles', () => {
      const complexStyle = {
        backgroundColor: 'blue',
        borderRadius: 10,
        padding: 20,
        margin: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        elevation: 5,
      };

      const { getByText } = render(
        <EnhancedTouchable onPress={mockOnPress} style={complexStyle}>
          <Text>Complex Style</Text>
        </EnhancedTouchable>
      );

      expect(getByText('Complex Style')).toBeTruthy();
    });
  });
});
