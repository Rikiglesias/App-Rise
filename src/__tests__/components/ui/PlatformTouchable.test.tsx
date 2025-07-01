import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import PlatformTouchable from '../../../components/ui/PlatformTouchable';

describe('PlatformTouchable - Rendering', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should render children correctly', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress}>
        <Text>Test Content</Text>
      </PlatformTouchable>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('should render without onPress', () => {
    const { getByText } = render(
      <PlatformTouchable>
        <Text>Test Content</Text>
      </PlatformTouchable>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });
});

describe('PlatformTouchable - Interactions', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should call onPress when pressed', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress}>
        <Text>Pressable</Text>
      </PlatformTouchable>
    );

    fireEvent.press(getByText('Pressable'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should support activeOpacity prop', () => {
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress} activeOpacity={0.7}>
        <Text>Pressable</Text>
      </PlatformTouchable>
    );

    expect(getByText('Pressable')).toBeTruthy();
  });

  it('should support style prop', () => {
    const testStyle = { backgroundColor: 'red' };
    const { getByText } = render(
      <PlatformTouchable onPress={mockOnPress} style={testStyle}>
        <Text>Styled</Text>
      </PlatformTouchable>
    );

    expect(getByText('Styled')).toBeTruthy();
  });
});

describe('PlatformTouchable - Accessibility', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('should support accessibility props', () => {
    const { getByLabelText } = render(
      <PlatformTouchable
        onPress={mockOnPress}
        accessibilityLabel="Test Button"
        accessibilityRole="button"
      >
        <Text>Button</Text>
      </PlatformTouchable>
    );

    expect(getByLabelText('Test Button')).toBeTruthy();
  });

  it('should support accessibility state', () => {
    const { getByText } = render(
      <PlatformTouchable
        onPress={mockOnPress}
        accessibilityState={{ disabled: false }}
      >
        <Text>Button</Text>
      </PlatformTouchable>
    );

    expect(getByText('Button')).toBeTruthy();
  });
});

describe('PlatformTouchable - Edge Cases', () => {
  it('should handle multiple children', () => {
    const { getByText } = render(
      <PlatformTouchable>
        <Text>First</Text>
        <Text>Second</Text>
      </PlatformTouchable>
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
  });

  it('should handle empty children', () => {
    expect(() => {
      render(<PlatformTouchable />);
    }).not.toThrow();
  });
});
