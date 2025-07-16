/**
 * TEST AGGIORNATI: FormattedText BEST PRACTICES ALIGNED
 *
 * Comportamento corretto come grandi aziende:
 * - fixedLines opzionale, utilizzato solo quando necessario
 * - numberOfLines presente SOLO quando fixedLines è specificato
 * - Testo fluisce naturalmente quando non serve controllo preciso
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { FormattedText } from '../../../components/ui/FormattedText';

describe('FormattedText - A Capo con \\n', () => {
  describe('A Capo Obbligatorio con \\n - CON fixedLines', () => {
    it('should handle single \\n with fixed lines', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Prima riga{'\n'}Seconda riga
        </FormattedText>
      );

      const textElement = getByText('Prima riga\nSeconda riga');
      expect(textElement.props.numberOfLines).toBe(2);
      expect(textElement.props.ellipsizeMode).toBe('clip');
    });

    it('should handle multiple \\n with fixed lines', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={3}>
          Riga 1{'\n'}Riga 2{'\n'}Riga 3
        </FormattedText>
      );

      const textElement = getByText('Riga 1\nRiga 2\nRiga 3');
      expect(textElement.props.numberOfLines).toBe(3);
    });

    it('should handle \\n at the beginning', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          {'\n'}Seconda riga
        </FormattedText>
      );

      const textElement = getByText('\nSeconda riga');
      expect(textElement.props.numberOfLines).toBe(2);
    });

    it('should handle \\n at the end', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Prima riga{'\n'}
        </FormattedText>
      );

      const textElement = getByText('Prima riga\n');
      expect(textElement.props.numberOfLines).toBe(2);
    });
  });

  describe('Ridimensionamento Automatico Font', () => {
    it('should apply font scaling for text with \\n and fixed lines', () => {
      const { getByText } = render(
        <FormattedText wrapMode="fixed" fixedLines={2}>
          Rise Against Hunger Italia{'\n'}Combattiamo la Fame Insieme per un
          Mondo Migliore
        </FormattedText>
      );

      const textElement = getByText(
        'Rise Against Hunger Italia\nCombattiamo la Fame Insieme per un Mondo Migliore'
      );
      expect(textElement.props.numberOfLines).toBe(2);
    });
  });

  describe('Proprietà Ereditate', () => {
    it('should maintain all fixed mode properties with \\n', () => {
      const { getByText } = render(
        <FormattedText
          wrapMode="fixed"
          fixedLines={2}
          style={{ color: 'red', fontWeight: 'bold' }}
        >
          Testo rosso{'\n'}In grassetto
        </FormattedText>
      );

      const textElement = getByText('Testo rosso\nIn grassetto');
      expect(textElement.props.numberOfLines).toBe(2);
      expect(textElement.props.ellipsizeMode).toBe('clip');
      expect(textElement.props.adjustsFontSizeToFit).toBe(false);
      expect(textElement.props.allowFontScaling).toBe(false);
    });
  });
});

describe('FormattedText - Natural Flow', () => {
  describe('Testo Naturale - SENZA fixedLines (best practice)', () => {
    it('should flow naturally without fixedLines', () => {
      const { getByText } = render(
        <FormattedText>Prima riga{'\n'}Seconda riga</FormattedText>
      );

      const textElement = getByText('Prima riga\nSeconda riga');
      // BEST PRACTICE: numberOfLines NON presente quando fixedLines non specificato
      expect(textElement.props.numberOfLines).toBeUndefined();
      expect(textElement.props.ellipsizeMode).toBeUndefined();
    });

    it('should respect \\n naturally without constraints', () => {
      const { getByText } = render(
        <FormattedText variant="body-large">
          Testo lungo che può andare a capo{'\n'}Seconda riga{'\n'}Terza riga
        </FormattedText>
      );

      const textElement = getByText(
        'Testo lungo che può andare a capo\nSeconda riga\nTerza riga'
      );
      expect(textElement.props.numberOfLines).toBeUndefined();
    });
  });

  describe('Comportamento Natural Flow', () => {
    it('should work naturally with variants without constraints', () => {
      const { getByText } = render(
        <FormattedText variant="headline-large">
          Titolo che fluisce naturalmente
        </FormattedText>
      );

      const textElement = getByText('Titolo che fluisce naturalmente');
      expect(textElement.props.numberOfLines).toBeUndefined();
      expect(textElement.props.ellipsizeMode).toBeUndefined();
    });

    it('should handle long text naturally without fixedLines', () => {
      const { getByText } = render(
        <FormattedText variant="body-medium">
          Questo è un testo lungo che dovrebbe fluire naturalmente senza vincoli
          artificiali di righe quando non è necessario un controllo preciso del
          layout
        </FormattedText>
      );

      const textElement = getByText(
        'Questo è un testo lungo che dovrebbe fluire naturalmente senza vincoli artificiali di righe quando non è necessario un controllo preciso del layout'
      );
      expect(textElement.props.numberOfLines).toBeUndefined();
    });
  });
});
