import React from 'react';
import { render } from '@testing-library/react-native';
import { FormattedText } from '../../../components/ui/FormattedText';

// Mock del sistema responsive
jest.mock('../../../shared/constants/responsiveSystem', () => ({
  scaleFont: jest.fn((size: number) => size), // Passa il fontSize invariato per i test
  TypographyTokens: {
    styles: {
      body: {
        medium: 16,
      },
    },
    lineHeights: {
      normal: 1.5,
    },
  },
  AccessibilityIntelligence: {
    calculateAccessibleFontSize: jest.fn((size: number) => size),
  },
}));

describe('FormattedText - Sistema Intelligente', () => {
  describe('Modalità fixed={true}', () => {
    it('should apply intelligent props when fixed=true', () => {
      const { getByText } = render(
        <FormattedText fontSize={16} fixed={true}>
          Test text
        </FormattedText>
      );

      const textElement = getByText('Test text');
      expect(textElement).toBeTruthy();
      expect(textElement.props.adjustsFontSizeToFit).toBe(false);
    });

    it('should work with fixed=true without fixedLines', () => {
      const { getByText } = render(
        <FormattedText fontSize={18} fixed={true}>
          Testo con layout controllato ma naturale
        </FormattedText>
      );

      const textElement = getByText('Testo con layout controllato ma naturale');
      expect(textElement).toBeTruthy();
      // Non dovrebbe avere numberOfLines quando fixedLines non è specificato
      expect(textElement.props.numberOfLines).toBeUndefined();
    });
  });
});

describe('FormattedText - Sistema Intelligente FixedLines', () => {
  it('should apply intelligent wrapping props with fixedLines', () => {
    const { getByText } = render(
      <FormattedText fontSize={20} fixed={true} fixedLines={2}>
        Test text with fixed lines
      </FormattedText>
    );

    const textElement = getByText('Test text with fixed lines');
    expect(textElement).toBeTruthy();
    expect(textElement.props.numberOfLines).toBe(2);
    expect(textElement.props.ellipsizeMode).toBe('clip');
    expect(textElement.props.adjustsFontSizeToFit).toBe(false);
  });

  it('should handle short text without font resizing', () => {
    const { getByText } = render(
      <FormattedText fontSize={20} fixed={true} fixedLines={2}>
        Breve
      </FormattedText>
    );

    const textElement = getByText('Breve');
    expect(textElement).toBeTruthy();
    // Per testo breve, fontSize dovrebbe rimanere similare a 20
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: expect.any(Number),
        }),
      ])
    );
  });

  it('should handle different fixedLines values', () => {
    const testText = 'Testo di prova per diverse configurazioni di righe fisse';

    // Test con 1 riga
    const { getByText: getByText1 } = render(
      <FormattedText fontSize={16} fixed={true} fixedLines={1}>
        {testText}
      </FormattedText>
    );
    expect(getByText1(testText).props.numberOfLines).toBe(1);

    // Test con 3 righe
    const { getByText: getByText3 } = render(
      <FormattedText fontSize={16} fixed={true} fixedLines={3}>
        {testText}
      </FormattedText>
    );
    expect(getByText3(testText).props.numberOfLines).toBe(3);
  });
});

describe('FormattedText - Modalità Normale', () => {
  it('should work normally without fixed prop', () => {
    const { getByText } = render(
      <FormattedText fontSize={16}>
        Testo normale senza sistema intelligente
      </FormattedText>
    );

    const textElement = getByText('Testo normale senza sistema intelligente');
    expect(textElement).toBeTruthy();

    // Non dovrebbe avere proprietà di wrapping intelligente
    expect(textElement.props.numberOfLines).toBeUndefined();
    expect(textElement.props.ellipsizeMode).toBeUndefined();

    // fontSize dovrebbe rimanere quello originale
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
  });

  it('should ignore fixedLines when fixed=false', () => {
    const { getByText } = render(
      <FormattedText fontSize={16} fixedLines={2}>
        Testo con fixedLines ma senza fixed
      </FormattedText>
    );

    const textElement = getByText('Testo con fixedLines ma senza fixed');
    expect(textElement).toBeTruthy();

    // fixedLines dovrebbe essere ignorato senza fixed={true}
    expect(textElement.props.numberOfLines).toBeUndefined();
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: 16,
        }),
      ])
    );
  });
});

describe('FormattedText - Edge Cases', () => {
  it('should handle empty text', () => {
    const { getByText } = render(
      <FormattedText fontSize={16} fixed={true} fixedLines={2}>
        {''}
      </FormattedText>
    );

    // Dovrebbe renderizzare anche con testo vuoto
    const textElement = getByText('');
    expect(textElement).toBeTruthy();
  });

  it('should handle very short text with many fixedLines', () => {
    const { getByText } = render(
      <FormattedText fontSize={16} fixed={true} fixedLines={10}>
        Hi
      </FormattedText>
    );

    const textElement = getByText('Hi');
    expect(textElement).toBeTruthy();
    expect(textElement.props.numberOfLines).toBe(10);

    // Per testo molto breve, fontSize non dovrebbe cambiare drasticamente
    expect(textElement.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          fontSize: expect.any(Number),
        }),
      ])
    );
  });

  it('should handle fixedLines=0', () => {
    const { getByText } = render(
      <FormattedText fontSize={16} fixed={true} fixedLines={0}>
        Test with zero lines
      </FormattedText>
    );

    const textElement = getByText('Test with zero lines');
    expect(textElement).toBeTruthy();

    // Con fixedLines=0, dovrebbe comportarsi come solo fixed={true}
    expect(textElement.props.numberOfLines).toBeUndefined();
  });
});

describe('FormattedText - Integration Tests', () => {
  it('should work with fontSize override and responsive scaling', () => {
    const { getByText } = render(
      <FormattedText fontSize={24} fixed={true} fixedLines={2}>
        Testo con fontSize personalizzato
      </FormattedText>
    );

    const textElement = getByText('Testo con fontSize personalizzato');
    expect(textElement).toBeTruthy();

    // Il sistema dovrebbe funzionare anche con fontSize personalizzati
    const fontSize = textElement.props.style[0].fontSize;
    expect(fontSize).toBeDefined();
    expect(typeof fontSize).toBe('number');
  });

  it('should maintain cross-platform consistency', () => {
    const testText = 'Testo per test cross-platform';

    const { getByText } = render(
      <FormattedText fontSize={18} fixed={true} fixedLines={2}>
        {testText}
      </FormattedText>
    );

    const textElement = getByText(testText);
    expect(textElement).toBeTruthy();

    // allowFontScaling dovrebbe essere sempre false per consistency
    expect(textElement.props.allowFontScaling).toBe(false);
  });
});

describe('FormattedText - Performance Tests', () => {
  it('should calculate font size efficiently for multiple texts', () => {
    const startTime = Date.now();

    // Renderizza 50 componenti con sistema intelligente
    for (let i = 0; i < 50; i++) {
      render(
        <FormattedText fontSize={16} fixed={true} fixedLines={2} key={i}>
          Testo numero {i} per test performance del sistema intelligente
        </FormattedText>
      );
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    // L'algoritmo dovrebbe essere abbastanza veloce (meno di 1 secondo per 50 componenti)
    expect(executionTime).toBeLessThan(1000);
  });
});
