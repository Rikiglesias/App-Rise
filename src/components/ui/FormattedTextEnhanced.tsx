/**
 * FORMATTED TEXT ENHANCED
 *
 * Estende FormattedText per gestire anche i testi lunghi con strategia mancante:
 * - Titoli e testi brevi: Sistema bi-direzionale con fixedLines
 * - Paragrafi e contenuti lunghi: Flusso naturale senza limitazioni
 */

import React from 'react';
import { FormattedText, type FormattedTextProps } from './FormattedText';

interface FormattedTextEnhancedProps extends FormattedTextProps {
  /**
   * Modalità di rendering del testo
   * - 'controlled': Layout controllato con fixedLines (default per testi brevi)
   * - 'natural': Flusso naturale senza limitazioni (per testi lunghi)
   * - 'adaptive': Decide automaticamente in base alla lunghezza del testo
   */
  renderMode?: 'controlled' | 'natural' | 'adaptive';

  /**
   * Soglia di caratteri per determinare se un testo è "lungo"
   * Usato solo in modalità 'adaptive'
   */
  longTextThreshold?: number;

  /**
   * Per testi lunghi: numero massimo di righe prima di mostrare "read more"
   * undefined = nessun limite
   */
  maxLinesBeforeExpand?: number;

  /**
   * Callback per gestire l'espansione "read more"
   */
  onExpandToggle?: (isExpanded: boolean) => void;
}

/**
 * Determina la strategia di rendering basata sul contenuto
 */
const determineRenderStrategy = (
  children: React.ReactNode,
  renderMode: 'controlled' | 'natural' | 'adaptive',
  longTextThreshold: number
): 'controlled' | 'natural' => {
  if (renderMode !== 'adaptive') {
    return renderMode;
  }

  // Calcola la lunghezza del testo
  const textLength = React.Children.toArray(children)
    .map(child => (typeof child === 'string' ? child : ''))
    .join('').length;

  // Se il testo è lungo, usa flusso naturale
  return textLength > longTextThreshold ? 'natural' : 'controlled';
};

export const FormattedTextEnhanced: React.FC<FormattedTextEnhancedProps> = ({
  renderMode = 'adaptive',
  longTextThreshold = 150, // ~2-3 righe di testo
  maxLinesBeforeExpand,
  onExpandToggle: _onExpandToggle, // Per future implementazioni
  children,
  fixed,
  fixedLines,
  ...rest
}) => {
  const strategy = determineRenderStrategy(
    children,
    renderMode,
    longTextThreshold
  );

  if (strategy === 'natural') {
    // Testi lunghi: flusso naturale senza controlli rigidi
    const naturalProps = {
      ...rest,
      fixed: false,
      ...(maxLinesBeforeExpand !== undefined && {
        numberOfLines: maxLinesBeforeExpand,
      }),
    } as FormattedTextProps;

    return <FormattedText {...naturalProps}>{children}</FormattedText>;
  }

  // Testi brevi: sistema controllato esistente
  const controlledProps: FormattedTextProps = {
    ...rest,
    fixed: fixed ?? true,
    ...(fixedLines !== undefined && { fixedLines }),
  };

  return <FormattedText {...controlledProps}>{children}</FormattedText>;
};

/**
 * Hook per facilitare l'uso con testi dinamici
 */
export const useTextRenderStrategy = (
  text: string,
  threshold: number = 150
) => {
  const strategy = text.length > threshold ? 'natural' : 'controlled';
  const isLongText = strategy === 'natural';

  return {
    strategy,
    isLongText,
    recommendedFixedLines: isLongText
      ? undefined
      : Math.min(Math.ceil(text.length / 50), 3),
  };
};

export default FormattedTextEnhanced;
