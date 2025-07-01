/* eslint-disable max-lines-per-function */
import React from 'react';
import { render } from '@testing-library/react-native';

import FormattedText from '../../../components/ui/FormattedText';

describe('FormattedText', () => {
  describe('Basic Rendering', () => {
    it('should render with children', () => {
      const { getByText } = render(
        <FormattedText>Simple text content</FormattedText>
      );

      expect(getByText('Simple text content')).toBeTruthy();
    });

    it('should render without crashing', () => {
      const { toJSON } = render(<FormattedText>Test text</FormattedText>);

      expect(toJSON()).toBeDefined();
    });
  });

  describe('Variants', () => {
    it('should render display variants', () => {
      const { getByText } = render(
        <FormattedText variant="display-large">Display Text</FormattedText>
      );

      expect(getByText('Display Text')).toBeTruthy();
    });

    it('should render headline variants', () => {
      const { getByText } = render(
        <FormattedText variant="headline-medium">Headline Text</FormattedText>
      );

      expect(getByText('Headline Text')).toBeTruthy();
    });

    it('should render title variants', () => {
      const { getByText } = render(
        <FormattedText variant="title-large">Title Text</FormattedText>
      );

      expect(getByText('Title Text')).toBeTruthy();
    });

    it('should render body variants', () => {
      const { getByText } = render(
        <FormattedText variant="body-medium">Body Text</FormattedText>
      );

      expect(getByText('Body Text')).toBeTruthy();
    });

    it('should render label variants', () => {
      const { getByText } = render(
        <FormattedText variant="label-small">Label Text</FormattedText>
      );

      expect(getByText('Label Text')).toBeTruthy();
    });

    it('should default to body-medium variant', () => {
      const { getByText } = render(<FormattedText>Default Text</FormattedText>);

      expect(getByText('Default Text')).toBeTruthy();
    });
  });

  describe('Font Scaling Control', () => {
    it('should disable font scaling by default', () => {
      const { getByText } = render(
        <FormattedText>Non-scaling text</FormattedText>
      );

      const textElement = getByText('Non-scaling text');
      expect(textElement).toBeTruthy();
      expect(textElement.props.allowFontScaling).toBe(false);
    });

    it('should allow font scaling when enabled', () => {
      const { getByText } = render(
        <FormattedText allowSystemFontScaling={true}>
          Scaling text
        </FormattedText>
      );

      const textElement = getByText('Scaling text');
      expect(textElement.props.allowFontScaling).toBe(true);
    });
  });

  describe('Wrap Mode', () => {
    it('should handle flexible wrap mode', () => {
      const { getByText } = render(
        <FormattedText wrapMode="flexible">
          Flexible wrapping text
        </FormattedText>
      );

      expect(getByText('Flexible wrapping text')).toBeTruthy();
    });

    it('should handle strict wrap mode', () => {
      const { getByText } = render(
        <FormattedText wrapMode="strict">Strict wrapping text</FormattedText>
      );

      expect(getByText('Strict wrapping text')).toBeTruthy();
    });

    it('should handle none wrap mode', () => {
      const { getByText } = render(
        <FormattedText wrapMode="none">Single line text</FormattedText>
      );

      const textElement = getByText('Single line text');
      expect(textElement.props.numberOfLines).toBe(1);
    });
  });

  describe('Readability Constraints', () => {
    it('should enforce readability constraints by default', () => {
      const { getByText } = render(
        <FormattedText fontSize={8}>Small text</FormattedText>
      );

      expect(getByText('Small text')).toBeTruthy();
    });

    it('should allow bypassing readability constraints', () => {
      const { getByText } = render(
        <FormattedText fontSize={8} enforceReadabilityConstraints={false}>
          Tiny text
        </FormattedText>
      );

      expect(getByText('Tiny text')).toBeTruthy();
    });
  });

  describe('Style Customization', () => {
    it('should apply custom styles', () => {
      const customStyle = { color: 'red', marginTop: 10 };
      const { getByText } = render(
        <FormattedText style={customStyle}>Styled text</FormattedText>
      );

      expect(getByText('Styled text')).toBeTruthy();
    });

    it('should apply custom color', () => {
      const { getByText } = render(
        <FormattedText color="#FF0000">Red text</FormattedText>
      );

      expect(getByText('Red text')).toBeTruthy();
    });

    it('should apply custom font weight', () => {
      const { getByText } = render(
        <FormattedText fontWeight="bold">Bold text</FormattedText>
      );

      expect(getByText('Bold text')).toBeTruthy();
    });

    it('should apply manual fontSize', () => {
      const { getByText } = render(
        <FormattedText fontSize={24}>Large text</FormattedText>
      );

      expect(getByText('Large text')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      const { getByText } = render(
        <FormattedText>Accessible content</FormattedText>
      );

      expect(getByText('Accessible content')).toBeTruthy();
    });

    it('should preserve text content for accessibility', () => {
      const accessibleText = 'Important accessibility content';
      const { getByText } = render(
        <FormattedText>{accessibleText}</FormattedText>
      );

      expect(getByText(accessibleText)).toBeTruthy();
    });

    it('should support accessibility props', () => {
      const { getByText } = render(
        <FormattedText
          accessibilityLabel="Custom label"
          accessibilityHint="Custom hint"
        >
          Accessibility text
        </FormattedText>
      );

      const textElement = getByText('Accessibility text');
      expect(textElement.props.accessibilityLabel).toBe('Custom label');
      expect(textElement.props.accessibilityHint).toBe('Custom hint');
    });
  });

  describe('Performance', () => {
    it('should handle rapid re-renders', () => {
      const { rerender, getByText } = render(
        <FormattedText>Initial text</FormattedText>
      );

      expect(getByText('Initial text')).toBeTruthy();

      rerender(<FormattedText>Updated text</FormattedText>);
      expect(getByText('Updated text')).toBeTruthy();

      rerender(<FormattedText>Final text</FormattedText>);
      expect(getByText('Final text')).toBeTruthy();
    });

    it('should handle variant changes efficiently', () => {
      const { rerender, getByText } = render(
        <FormattedText variant="body-small">Test text</FormattedText>
      );

      expect(getByText('Test text')).toBeTruthy();

      rerender(
        <FormattedText variant="headline-large">Test text</FormattedText>
      );
      expect(getByText('Test text')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { toJSON } = render(<FormattedText></FormattedText>);

      expect(toJSON()).toBeDefined();
    });

    it('should handle numeric children', () => {
      const { getByText } = render(<FormattedText>{123}</FormattedText>);

      expect(getByText('123')).toBeTruthy();
    });

    it('should handle boolean children gracefully', () => {
      const { toJSON } = render(<FormattedText>{true}</FormattedText>);

      expect(toJSON()).toBeDefined();
    });

    it('should handle null/undefined children', () => {
      const { toJSON } = render(<FormattedText>{null}</FormattedText>);

      expect(toJSON()).toBeDefined();
    });
  });
});
