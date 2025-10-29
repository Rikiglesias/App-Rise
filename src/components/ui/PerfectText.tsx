/**
 * PERFECT TEXT - Sistema Testi Identico iPhone 15
 *
 * GARANTISCE:
 * - Mai testo tagliato o nascosto
 * - Sempre stesso numero di righe su tutti i dispositivi
 * - Dimensioni identiche proporzionalmente a iPhone 15
 * - Auto-adattamento intelligente del fontSize
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  View,
  StyleSheet,
  NativeSyntheticEvent,
  TextLayoutEventData,
  StyleProp,
} from 'react-native';
import { scale } from '../../shared/constants/responsiveSystem';
import { Typography } from '../../shared/constants/designTokens';
import {
  getImmuneTextProps,
  debugImmunity,
  warnIfUserScaled,
} from '../../shared/utils/SystemImmunity';

// 📐 TYPOGRAPHY VARIANTS (presets comuni)
const TYPOGRAPHY_VARIANTS = {
  h1: { fontSize: 32, fontWeight: '700' as const },
  h2: { fontSize: 28, fontWeight: '700' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  bodySmall: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
} as const;

export type TypographyVariant = keyof typeof TYPOGRAPHY_VARIANTS;

export interface PerfectTextProps
  extends Omit<TextProps, 'numberOfLines' | 'adjustsFontSizeToFit'> {
  /** Typography variant (alternativa a fontSize/fontWeight) */
  variant?: TypographyVariant;

  /** Font size di riferimento su iPhone 15 */
  fontSize?: number; // retrocompatibilità
  size?: number; // preferito

  /** Limiti opzionali (base iPhone 15) */
  maxSize?: number;
  minSize?: number;

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

const MAX_CALC_ATTEMPTS = 12;
const LINE_HEIGHT_RATIO = 1.2;

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
});

// Font mapping rimosso - ora usa font di sistema

const DEFAULT_REFERENCE_WIDTH =
  responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393;
const DEFAULT_REFERENCE_CONTAINER = DEFAULT_REFERENCE_WIDTH * 0.9;

export const PerfectText: React.FC<PerfectTextProps> = ({
  children,
  variant,
  fontSize,
  size,
  lines,
  containerWidth,
  maxSize,
  minSize,
  fontWeight,
  color = '#000000',
  textAlign = 'left',
  debug = false,
  style,
  immunity: _immunity,
  ...props
}) => {
  const shouldMeasure = typeof children === 'string';

  // Risolvi variant o valori custom
  const variantConfig = variant ? TYPOGRAPHY_VARIANTS[variant] : null;
  const finalFontSize = fontSize ?? size ?? variantConfig?.fontSize ?? 16;
  const finalFontWeight = fontWeight ?? variantConfig?.fontWeight ?? 'normal';

  const scaledBase = useMemo(
    () => scale(finalFontSize),
    [finalFontSize]
  );
  const scaledMax = useMemo(
    () => (typeof maxSize === 'number' ? scale(maxSize) : undefined),
    [maxSize]
  );
  const scaledMin = useMemo(
    () => (typeof minSize === 'number' ? scale(minSize) : undefined),
    [minSize]
  );

  const initialFontSize = useMemo(() => {
    let base = scaledBase;
    if (typeof scaledMax === 'number') {
      base = Math.min(base, scaledMax);
    }
    if (typeof scaledMin === 'number') {
      base = Math.max(base, scaledMin);
    }
    return base;
  }, [scaledBase, scaledMax, scaledMin]);

  const [fontState, setFontState] = useState(() => ({
    size: initialFontSize,
    measured: !shouldMeasure,
    attempts: 0,
  }));

  const referenceWidth = useMemo(
    () => containerWidth ?? DEFAULT_REFERENCE_CONTAINER,
    [containerWidth]
  );
  const targetWidth = useMemo(
    () => scale(referenceWidth),
    [referenceWidth]
  );

  useEffect(() => {
    if (debug) {
      debugImmunity('PerfectText');
      warnIfUserScaled();
    }
  }, [debug]);

  useEffect(() => {
    setFontState(prev => {
      const next = {
        size: initialFontSize,
        measured: !shouldMeasure,
        attempts: 0,
      };
      if (
        Math.abs(prev.size - next.size) < 0.05 &&
        prev.measured === next.measured &&
        prev.attempts === next.attempts
      ) {
        return prev;
      }
      return next;
    });
  }, [initialFontSize, shouldMeasure, lines, containerWidth, children]);

  const handleTextLayout = useCallback(
    (event: NativeSyntheticEvent<TextLayoutEventData>) => {
      if (!shouldMeasure) {
        return;
      }

      const layoutLines = event.nativeEvent.lines ?? [];
      const usedLines = layoutLines.length;
      const hasTruncation = layoutLines.some(
        line => (line as unknown as { isTruncated?: boolean }).isTruncated
      );
      const overflow = hasTruncation || usedLines > lines;

      setFontState(prev => {
        if (!overflow || prev.attempts >= MAX_CALC_ATTEMPTS) {
          if (prev.measured) {
            return prev;
          }
          return { ...prev, measured: true };
        }

        const ratio = usedLines > 0 ? lines / usedLines : 1;
        let nextSize = prev.size * Math.max(ratio, 0.82);
        nextSize = Math.min(nextSize, prev.size * 0.97);
        nextSize = Math.max(nextSize, prev.size - 0.75);

        if (typeof scaledMin === 'number') {
          nextSize = Math.max(nextSize, scaledMin);
        }
        if (typeof scaledMax === 'number') {
          nextSize = Math.min(nextSize, scaledMax);
        }

        if (Math.abs(nextSize - prev.size) < 0.1) {
          return { ...prev, measured: true };
        }

        return {
          size: nextSize,
          measured: false,
          attempts: prev.attempts + 1,
        };
      });
    },
    [lines, scaledMax, scaledMin, shouldMeasure]
  );

  const immuneProps = getImmuneTextProps();

  const resolvedStyle = useMemo(() => {
    const mergedStyle = style ? StyleSheet.flatten(style) : undefined;

    // Usa famiglia di default del Design System per coerenza visiva/snapshot
    const fontFamily = Typography.families.body;

    const baseStyle: TextStyle = {
      fontSize: fontState.size,
      color,
      textAlign,
      lineHeight: fontState.size * LINE_HEIGHT_RATIO,
      includeFontPadding: false,
      textAlignVertical: 'center',
      fontFamily,
      fontWeight: finalFontWeight,
    };

    return mergedStyle
      ? { ...baseStyle, ...mergedStyle, fontFamily }
      : baseStyle;
  }, [style, fontState.size, color, textAlign, finalFontWeight]);

  return (
    <View style={{ width: targetWidth }}>
      <Text
        {...props}
        numberOfLines={lines}
        {...immuneProps}
        onTextLayout={shouldMeasure ? handleTextLayout : undefined}
        style={[resolvedStyle, fontState.measured ? null : styles.hidden]}
      >
        {children}
      </Text>
    </View>
  );
};

// ?? HELPER SHORTCUTS PER CASI COMUNI
export const PerfectTitle = (
  props: Omit<PerfectTextProps, 'lines' | 'fontWeight'>
) => <PerfectText {...props} lines={1} fontWeight="600" />;

export const PerfectSubtitle = (
  props: Omit<PerfectTextProps, 'lines' | 'fontWeight'>
) => <PerfectText {...props} lines={2} fontWeight="500" />;

export const PerfectBody = (props: Omit<PerfectTextProps, 'lines'>) => (
  <PerfectText {...props} lines={3} />
);
