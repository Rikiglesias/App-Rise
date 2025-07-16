/**
 * TEST FormattedText - Fixed Lines Behavior
 *
 * Test specifici per il comportamento con fixedLines
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { FormattedText } from '../../../components/ui/FormattedText';

describe('FormattedText - Fixed Lines Basic', () => {
  describe('Gestione Intelligente Righe Multiple - CON fixedLines', () => {
    it('should handle more \\n than fixedLines gracefully', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Riga 1{'\n'}Riga 2{'\n'}Riga 3{'\n'}Riga 4
        </FormattedText>
      );

      const textElement = getByText('Riga 1\nRiga 2\nRiga 3\nRiga 4');
      expect(textElement.props.numberOfLines).toBe(2);
    });

    it('should handle fewer \\n than fixedLines', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={4}>
          Solo una riga{'\n'}E una seconda
        </FormattedText>
      );

      const textElement = getByText('Solo una riga\nE una seconda');
      expect(textElement.props.numberOfLines).toBe(4);
    });

    it('should handle empty lines with \\n', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={3}>
          Prima riga{'\n'}
          {'\n'}Terza riga
        </FormattedText>
      );

      const textElement = getByText('Prima riga\n\nTerza riga');
      expect(textElement.props.numberOfLines).toBe(3);
    });
  });

  describe('Edge Cases - CON fixedLines', () => {
    it('should handle empty string with fixedLines', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          {''}
        </FormattedText>
      );

      const textElement = getByText('');
      expect(textElement.props.numberOfLines).toBe(2);
    });

    it('should handle single character with \\n', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          A{'\n'}B
        </FormattedText>
      );

      const textElement = getByText('A\nB');
      expect(textElement.props.numberOfLines).toBe(2);
    });
  });
});

describe('FormattedText - Fixed Lines Advanced', () => {
  describe('Combinazioni Avanzate - CON fixedLines', () => {
    it('should handle mixed content with emojis and \\n', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={3}>
          🌍 IMPATTO GLOBALE{'\n'}📈 CRESCITA COSTANTE{'\n'}❤️ MISSIONE SOCIALE
        </FormattedText>
      );

      const textElement = getByText(
        '🌍 IMPATTO GLOBALE\n📈 CRESCITA COSTANTE\n❤️ MISSIONE SOCIALE'
      );
      expect(textElement.props.numberOfLines).toBe(3);
    });

    it('should handle very long single line with \\n', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Questa è una riga estremamente lunga che potrebbe causare problemi di
          layout{'\n'}Seconda riga normale
        </FormattedText>
      );

      const textElement = getByText(
        'Questa è una riga estremamente lunga che potrebbe causare problemi di layout\nSeconda riga normale'
      );
      expect(textElement.props.numberOfLines).toBe(2);
    });

    it('should handle special characters with \\n', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Caratteri speciali: àèìòù{'\n'}Simboli: @#$%^&*()
        </FormattedText>
      );

      const textElement = getByText(
        'Caratteri speciali: àèìòù\nSimboli: @#$%^&*()'
      );
      expect(textElement.props.numberOfLines).toBe(2);
    });
  });

  describe('Typography Variants - CON fixedLines', () => {
    it('should work with representative typography variants', () => {
      const representativeVariants = [
        'display-large',
        'headline-medium',
        'body-medium',
        'label-small',
      ] as const;

      representativeVariants.forEach(variant => {
        const { getByText } = render(
          <FormattedText variant={variant} wrapMode="fixed" fixedLines={2}>
            Variant {variant}
            {'\n'}Test line
          </FormattedText>
        );

        const textElement = getByText(`Variant ${variant}\nTest line`);
        expect(textElement.props.numberOfLines).toBe(2);
      });
    });
  });
});
