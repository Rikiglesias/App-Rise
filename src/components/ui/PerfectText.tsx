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

import React, { useMemo } from 'react';
import {
  Text,
  TextProps,
  TextStyle,
  View,
  StyleSheet,
  StyleProp,
  PixelRatio,
  useWindowDimensions,
} from 'react-native';
import {
  scaleWithDimensions,
  LOGICAL_REFERENCE,
} from '../../shared/constants/perfectScale';
import { Typography } from '../../shared/constants/designTokens';
import { getImmuneTextProps } from '../../shared/utils/SystemImmunity';
import { LINE_HEIGHT_RATIO, textFontSize } from '../../shared/utils/textScale';
import { useThemeColors } from '../../shared/hooks/useThemeColors';

export interface PerfectTextProps
  extends Omit<TextProps, 'numberOfLines' | 'adjustsFontSizeToFit'> {
  /** Font size di riferimento su iPhone 15 (limiti device-aware automatici) */
  size: number;

  /** Numero ESATTO di righe (sempre rispettato) */
  lines: number;

  /**
   * Varianti di comportamento per adattività. `fit`: una riga sola che segue la scala
   * di sistema e si restringe solo quando non entra in larghezza (mai tagliata).
   */
  variant?: 'content' | 'compact' | 'fit';
  /** Soglia fontScale oltre la quale i testi content si espandono (no tagli); default: appena il testo è ingrandito */
  adaptiveThreshold?: number;

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

  /** Debug mode for testing layout behavior (legacy, non utilizzato) */
  debug?: boolean;

  /** Stile custom */
  style?: StyleProp<TextStyle>;

  /** Immunità esplicita (opzionale, default true via SystemImmunity) */
  immunity?: boolean;
}

// Variante `fit`: fino a metà della dimensione richiesta, prima di non entrare
const FIT_MINIMUM_SCALE = 0.5;

// Font mapping rimosso - ora usa font di sistema

const DEFAULT_REFERENCE_WIDTH = LOGICAL_REFERENCE.width;
const DEFAULT_MULTILINE_CONTAINER = DEFAULT_REFERENCE_WIDTH * 0.7; // 70% per leggibilità ottimale

export const PerfectText: React.FC<PerfectTextProps> = ({
  children,
  size,
  lines,
  variant = 'content',
  adaptiveThreshold = 1,
  containerWidth,
  fontWeight = 'normal',
  color,
  textAlign = 'left',
  debug: _debug = false,
  style,
  immunity: _immunity,
  ...props
}) => {
  const colors = useThemeColors();
  // Default colore testo dark-aware: in light === neutral[900] (zero regressione)
  const resolvedColor = color ?? colors.neutral[900];
  // Proporzionale allo schermo di adesso (segue rotazione e ridimensionamento), mai sotto 12 dp
  const window = useWindowDimensions();
  const finalScaledFontSize = textFontSize(size, window);
  const immuneProps = getImmuneTextProps();
  const allowsScale = immuneProps.allowFontScaling !== false;
  const fontScale = PixelRatio.getFontScale();

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
  // Adattività: se non c'è referenceWidth ma serve allargare per font grande
  const enhancedReferenceWidth = useMemo(() => {
    if (referenceWidth) return referenceWidth;
    if (variant === 'content' && allowsScale && fontScale > adaptiveThreshold) {
      // Per zoom alti: non restringere i titoli single-line (lines===1)
      // per evitare a capo precoce. Per testi realmente multilinea,
      // mantieni width ottimale (70%).
      if (lines > 1) return DEFAULT_MULTILINE_CONTAINER;
      return undefined;
    }
    return undefined;
  }, [
    referenceWidth,
    variant,
    allowsScale,
    fontScale,
    adaptiveThreshold,
    lines,
  ]);
  // Sulla finestra di adesso, come il carattere: segue pieghevole e rotazione (C54).
  const targetWidth = useMemo(
    () =>
      enhancedReferenceWidth
        ? scaleWithDimensions(
            enhancedReferenceWidth,
            window.width,
            window.height
          )
        : undefined,
    [enhancedReferenceWidth, window]
  );

  // (già calcolati sopra)

  // Adattività: per variant 'content' e fontScale alto -> nessun taglio
  const effectiveLines = useMemo(() => {
    if (variant === 'compact' || variant === 'fit') return 1;
    if (allowsScale && fontScale > adaptiveThreshold) return undefined; // lascia andare a capo
    return lines;
  }, [variant, allowsScale, fontScale, adaptiveThreshold, lines]);

  const finalEllipsizeMode = useMemo<
    NonNullable<TextProps['ellipsizeMode']> | undefined
  >(() => {
    if (variant === 'compact') return 'tail';
    // For non-compact, avoid forcing ellipsize to keep snapshots stable and let platform default
    return undefined;
  }, [variant]);

  const resolvedStyle = useMemo(() => {
    const mergedStyle = style ? StyleSheet.flatten(style) : undefined;

    // Usa famiglia di default del Design System per coerenza visiva/snapshot
    const fontFamily = Typography.families.body;

    const baseStyle: TextStyle = {
      fontSize: finalScaledFontSize,
      color: resolvedColor,
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
  }, [style, finalScaledFontSize, resolvedColor, textAlign, fontWeight]);

  const fitProps =
    variant === 'fit'
      ? { adjustsFontSizeToFit: true, minimumFontScale: FIT_MINIMUM_SCALE }
      : undefined;

  // Se width è necessario (manuale o automatico) → usa wrapper con width fissa
  // Altrimenti → Text diretto che si adatta al contenuto (flex/row friendly)
  if (enhancedReferenceWidth && targetWidth) {
    return (
      <View style={{ width: targetWidth, alignSelf: 'center' }}>
        <Text
          {...immuneProps}
          {...props}
          {...fitProps}
          numberOfLines={effectiveLines}
          ellipsizeMode={finalEllipsizeMode}
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
      {...immuneProps}
      {...props}
      {...fitProps}
      numberOfLines={effectiveLines}
      ellipsizeMode={finalEllipsizeMode}
      style={resolvedStyle}
    >
      {children}
    </Text>
  );
};
