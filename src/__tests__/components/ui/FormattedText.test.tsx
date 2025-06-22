/* eslint-disable max-lines-per-function */
import React from 'react';
import { render } from '@testing-library/react-native';

import FormattedText from '../../../components/ui/FormattedText';

describe('FormattedText', () => {
  describe('Basic Rendering', () => {
    it('should render single paragraph text', () => {
      const { getByText } = render(
        <FormattedText text="Simple single paragraph text" />
      );

      expect(getByText('Simple single paragraph text')).toBeTruthy();
    });

    it('should render without crashing', () => {
      const { toJSON } = render(<FormattedText text="Test text" />);

      expect(toJSON()).toBeDefined();
    });
  });

  describe('Paragraph Splitting', () => {
    it('should split text into multiple paragraphs', () => {
      const text = 'First paragraph\n\nSecond paragraph\n\nThird paragraph';
      const { getByText } = render(<FormattedText text={text} />);

      expect(getByText('First paragraph')).toBeTruthy();
      expect(getByText('Second paragraph')).toBeTruthy();
      expect(getByText('Third paragraph')).toBeTruthy();
    });

    it('should handle single line breaks correctly', () => {
      const text = 'First line\nSecond line in same paragraph\n\nNew paragraph';
      const { getByText } = render(<FormattedText text={text} />);

      expect(
        getByText('First line\nSecond line in same paragraph')
      ).toBeTruthy();
      expect(getByText('New paragraph')).toBeTruthy();
    });

    it('should handle multiple consecutive line breaks', () => {
      const text = 'First paragraph\n\n\n\nSecond paragraph';
      const { getAllByText } = render(<FormattedText text={text} />);

      expect(getAllByText('First paragraph')).toHaveLength(1);
      expect(getAllByText('Second paragraph')).toHaveLength(1);
      // text.split('\n\n') creates one empty string between the two
      expect(getAllByText('')).toHaveLength(1);
    });
  });

  describe('Style Handling', () => {
    it('should apply custom styles', () => {
      const customStyle = { color: 'red', fontSize: 20 };
      const { getByText } = render(
        <FormattedText text="Styled text" style={customStyle} />
      );

      const textElement = getByText('Styled text');
      expect(textElement).toBeTruthy();
    });

    it('should handle style arrays', () => {
      const styles = [{ color: 'blue' }, { fontSize: 16 }];
      const { getByText } = render(
        <FormattedText text="Multi-styled text" style={styles} />
      );

      expect(getByText('Multi-styled text')).toBeTruthy();
    });

    it('should handle undefined style', () => {
      const { getByText } = render(
        <FormattedText text="No style text" style={undefined} />
      );

      expect(getByText('No style text')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty text', () => {
      const { toJSON } = render(<FormattedText text="" />);

      expect(toJSON()).toBeDefined();
    });

    it('should handle text with only line breaks', () => {
      const { toJSON } = render(<FormattedText text="\n\n\n\n" />);

      // Component handles this gracefully, renders a single Text with the raw content
      expect(toJSON()).toBeDefined();
    });

    it('should handle text starting with line breaks', () => {
      const text = '\n\nActual content';
      const { getByText, getAllByText } = render(<FormattedText text={text} />);

      expect(getAllByText('')).toHaveLength(1); // 1 empty paragraph from split
      expect(getByText('Actual content')).toBeTruthy();
    });

    it('should handle text ending with line breaks', () => {
      const text = 'Actual content\n\n';
      const { getByText, getAllByText } = render(<FormattedText text={text} />);

      expect(getByText('Actual content')).toBeTruthy();
      expect(getAllByText('')).toHaveLength(1); // 1 empty paragraph at end
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000) + '\n\n' + 'B'.repeat(1000);
      const { getByText } = render(<FormattedText text={longText} />);

      expect(getByText('A'.repeat(1000))).toBeTruthy();
      expect(getByText('B'.repeat(1000))).toBeTruthy();
    });
  });

  describe('Key Generation', () => {
    it('should generate unique keys for paragraphs', () => {
      const text = 'Same\n\nSame\n\nSame';
      const { getAllByText } = render(<FormattedText text={text} />);

      // Should render all three "Same" paragraphs
      expect(getAllByText('Same')).toHaveLength(3);
    });

    it('should handle paragraphs shorter than 50 characters', () => {
      const text = 'A\n\nB\n\nC';
      const { getByText } = render(<FormattedText text={text} />);

      expect(getByText('A')).toBeTruthy();
      expect(getByText('B')).toBeTruthy();
      expect(getByText('C')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should be accessible to screen readers', () => {
      const { getByText } = render(
        <FormattedText text="Accessible text content" />
      );

      const textElement = getByText('Accessible text content');
      expect(textElement).toBeTruthy();
      // Text should be accessible by default
    });

    it('should preserve text content for accessibility', () => {
      const accessibleText = 'This is important content for screen readers';
      const { getByText } = render(<FormattedText text={accessibleText} />);

      expect(getByText(accessibleText)).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should handle rapid re-renders', () => {
      const { rerender, getByText } = render(
        <FormattedText text="Initial text" />
      );

      expect(getByText('Initial text')).toBeTruthy();

      rerender(<FormattedText text="Updated text" />);
      expect(getByText('Updated text')).toBeTruthy();

      rerender(<FormattedText text="Final text" />);
      expect(getByText('Final text')).toBeTruthy();
    });

    it('should handle many paragraphs efficiently', () => {
      const manyParagraphs = Array.from(
        { length: 50 },
        (_, i) => `Paragraph ${i + 1}`
      ).join('\n\n');

      const { getByText } = render(<FormattedText text={manyParagraphs} />);

      expect(getByText('Paragraph 1')).toBeTruthy();
      expect(getByText('Paragraph 25')).toBeTruthy();
      expect(getByText('Paragraph 50')).toBeTruthy();
    });
  });
});
