/**
 * PERFECT TEXT - Sistema Testi Proporzionale a iPhone 15
 *
 * GARANTISCE:
 * - Scaling proporzionale del fontSize su tutti i dispositivi
 * - Dimensioni identiche proporzionalmente a iPhone 15
 * - Consistenza visiva basata su scale()
 * - Controllo preciso con numberOfLines
 *
 * NOTA: Il testo non viene più ridotto iterativamente.
 * Se appare "...", significa che i valori base devono essere aggiustati.
 */

import React, { useEffect, useMemo } from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  View,
  StyleSheet,
  StyleProp,
} from 'react-native';
import {
  scale,
  scaleText,
  LOGICAL_REFERENCE,
} from '../../shared/constants/perfectScale';
import { Typography, Colors } from '../../shared/constants/designTokens';
import {
  getImmuneTextProps,
  debugImmunity,
  warnIfUserScaled,
} from '../../shared/utils/SystemImmunity';

export interface PerfectTextProps
  extends Omit<TextProps, 'numberOfLines' | 'adjustsFontSizeToFit'> {
  /** Font size di riferimento su iPhone 15 (limiti device-aware automatici) */
  size: number;

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
  style?: StyleProp<TextStyle>;

  /** Immunità esplicita (opzionale, default true via SystemImmunity) */
  immunity?: boolean;
}

const LINE_HEIGHT_RATIO = 1.2;

// Font mapping rimosso - ora usa font di sistema

const DEFAULT_REFERENCE_WIDTH = LOGICAL_REFERENCE.width;
const DEFAULT_MULTILINE_CONTAINER = DEFAULT_REFERENCE_WIDTH * 0.7; // 70% per leggibilità ottimale

export const PerfectText: React.FC<PerfectTextProps> = ({
  children,
  size,
  lines,
  containerWidth,
  fontWeight = 'normal',
  color = Colors.neutral[900],
  textAlign = 'left',
  debug = false,
  style,
  immunity: _immunity,
  ...props
}) => {
  // Usa scaleText() che ora è scale() puro - proporzionalità perfetta sempre
  const finalScaledFontSize = useMemo(() => scaleText(size), [size]);

  // ✅ SISTEMA AUTOMATICO: per testi multilinea applica automaticamente width ottimale
  const shouldApplyAutoWidth = useMemo(() => {
    // Se containerWidth è specificato manualmente, usa quello (0 = disabilita)
    if (containerWidth !== undefined) {
      return containerWidth === 0 ? undefined : containerWidth;
    }

    // Se lines > 1 (testo multilinea), applica automaticamente 70% per leggibilità
    if (lines > 1) return DEFAULT_MULTILINE_CONTAINER;

    // Se lines === 1 (titolo singola riga), nessuna limitazione
    return undefined;
  }, [containerWidth, lines]);

  const referenceWidth = useMemo(
    () => shouldApplyAutoWidth,
    [shouldApplyAutoWidth]
  );
  const targetWidth = useMemo(
    () => (referenceWidth ? scale(referenceWidth) : undefined),
    [referenceWidth]
  );

  useEffect(() => {
    if (debug) {
      debugImmunity('PerfectText');
      warnIfUserScaled();
    }
  }, [debug]);

  const immuneProps = getImmuneTextProps();

  const resolvedStyle = useMemo(() => {
    const mergedStyle = style ? StyleSheet.flatten(style) : undefined;

    // Usa famiglia di default del Design System per coerenza visiva/snapshot
    const fontFamily = Typography.families.body;

    const baseStyle: TextStyle = {
      fontSize: finalScaledFontSize,
      color,
      textAlign,
      lineHeight: finalScaledFontSize * LINE_HEIGHT_RATIO,
      includeFontPadding: false,
      textAlignVertical: 'center',
      fontFamily,
      fontWeight,
    };

    return mergedStyle
      ? { ...baseStyle, ...mergedStyle, fontFamily }
      : baseStyle;
  }, [style, finalScaledFontSize, color, textAlign, fontWeight]);

  // Se width è necessario (manuale o automatico) → usa wrapper con width fissa
  // Altrimenti → Text diretto che si adatta al contenuto (flex/row friendly)
  if (referenceWidth && targetWidth) {
    return (
      <View style={{ width: targetWidth, alignSelf: 'center' }}>
        <Text
          {...props}
          numberOfLines={lines}
          {...immuneProps}
          style={resolvedStyle}
        >
          {children}
        </Text>
      </View>
    );
  }

  // Text diretto senza wrapper - per titoli single-line e layout flex/row
  return (
    <Text
      {...props}
      numberOfLines={lines}
      {...immuneProps}
      style={resolvedStyle}
    >
      {children}
    </Text>
  );
};
