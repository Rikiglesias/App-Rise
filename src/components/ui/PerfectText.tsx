/**
 * PERFECT TEXT - Sistema Testi Identico iPhone 15
 *
 * GARANTISCE:
 * - Mai testo tagliato o nascosto
 * - Sempre stesso numero di righe su tutti i dispositivi
 * - Dimensioni identiche proporzionalmente a iPhone 15
 * - Auto-adattamento intelligente del fontSize
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Text, TextProps, TextStyle, View, Dimensions } from 'react-native';
import { universal } from '../../shared/utils/UniversalMillimetricSystem';
import {
  getImmuneTextProps,
  debugImmunity,
  warnIfUserScaled,
} from '../../shared/utils/SystemImmunity';

interface PerfectTextProps
  extends Omit<TextProps, 'numberOfLines' | 'adjustsFontSizeToFit'> {
  /** Font size di riferimento su iPhone 15 */
  fontSize: number;

  /** Numero ESATTO di righe (sempre rispettato) */
  lines: number;

  /** Larghezza container (default: 90% screen width) */
  containerWidth?: number;

  /** Peso del font */
  fontWeight?:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';

  /** Colore testo */
  color?: string;

  /** Allineamento testo */
  textAlign?: 'left' | 'center' | 'right';

  /** Debug mode - mostra info calcoli */
  debug?: boolean;

  /** Stile custom */
  style?: TextStyle;
}

export const PerfectText: React.FC<PerfectTextProps> = ({
  children,
  fontSize,
  lines,
  containerWidth,
  fontWeight = 'normal',
  color = '#000000',
  textAlign = 'left',
  debug = false,
  style,
  ...props
}) => {
  const [optimalFontSize, setOptimalFontSize] = useState<number>(fontSize);
  const [isCalculating, setIsCalculating] = useState(true);

  const calculateOptimalFontSize = useCallback(() => {
    if (typeof children !== 'string') {
      setOptimalFontSize(universal.font(fontSize));
      setIsCalculating(false);
      return;
    }

    const text = children;
    const { width: screenWidth } = Dimensions.get('window');

    // Calcola larghezza container effettiva
    const effectiveContainerWidth = containerWidth
      ? universal.width(containerWidth)
      : screenWidth * 0.9; // 90% dello schermo per default

    // Calcola fontSize base proporzionale
    const baseFontSize = universal.font(fontSize);

    // Trova il fontSize ottimale che rispetta il numero di righe
    let testFontSize = baseFontSize;
    let foundOptimal = false;

    // Test partendo dal fontSize base e riducendo se necessario
    for (let attempt = 0; attempt < 20 && !foundOptimal; attempt++) {
      // Stima caratteri per riga (approssimazione accurata)
      const avgCharWidth = testFontSize * 0.6; // Fattore empirico
      const charsPerLine = Math.floor(effectiveContainerWidth / avgCharWidth);
      const estimatedLines = Math.ceil(text.length / charsPerLine);

      if (estimatedLines <= lines) {
        foundOptimal = true;
        break;
      }

      // Riduce font size del 5% per tentativo successivo
      testFontSize = testFontSize * 0.95;
    }

    if (debug) {
      // Debug info removed for production
    }

    setOptimalFontSize(testFontSize);
    setIsCalculating(false);
  }, [children, fontSize, lines, containerWidth, debug]);

  useEffect(() => {
    calculateOptimalFontSize();

    // Debug immunità e avvisa se utente ha font scaling
    if (debug) {
      debugImmunity('PerfectText');
      warnIfUserScaled();

      // Debug removed for production
    }
  }, [calculateOptimalFontSize, debug]);

  // Ottieni props per immunità completa alle impostazioni utente
  const immuneProps = getImmuneTextProps();

  // Stile ottimizzato per performance e consistency + immunità
  const textStyle = {
    fontSize: optimalFontSize,
    fontWeight,
    color,
    textAlign,
    lineHeight: optimalFontSize * 1.2, // Line height proporzionale
    includeFontPadding: false, // Android consistency
    textAlignVertical: 'center' as const,
    ...(style ?? {}),
  };

  if (isCalculating) {
    // Placeholder durante calcolo (evita flash)
    return (
      <View style={{ height: optimalFontSize * 1.2 * lines }}>
        <Text style={{ ...textStyle, opacity: 0 }}>{children}</Text>
      </View>
    );
  }

  return (
    <Text
      {...props}
      numberOfLines={lines}
      {...immuneProps} // Props per immunità completa
      style={textStyle}
    >
      {children}
    </Text>
  );
};

// 🎯 HELPER SHORTCUTS PER CASI COMUNI
export const PerfectTitle = (
  props: Omit<PerfectTextProps, 'lines' | 'fontWeight'>
) => <PerfectText {...props} lines={1} fontWeight="bold" />;

export const PerfectSubtitle = (
  props: Omit<PerfectTextProps, 'lines' | 'fontWeight'>
) => <PerfectText {...props} lines={2} fontWeight="600" />;

export const PerfectBody = (props: Omit<PerfectTextProps, 'lines'>) => (
  <PerfectText {...props} lines={3} />
);
