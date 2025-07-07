/**
 * Platform logic utilities per FormattedText
 * Gestisce comportamenti specifici iOS/Android e text wrapping
 */

/**
 * SISTEMA INTELLIGENTE: Proprietà per modalità fixed
 * - Con fixedLines: Sistema intelligente che ridimensiona il font conservativamente (MAI tronca)
 * - Senza fixedLines: Layout controllato ma testo naturale
 */
export const getIntelligentWrapProps = (
  fixed: boolean,
  wrapMode?: string,
  fixedLines?: number
) => {
  // Supporta sia fixed={true} che wrapMode="fixed" per backward compatibility
  const isFixedMode = fixed || wrapMode === 'fixed';

  if (!isFixedMode) {
    // Modalità normale: testo naturale
    return {};
  }

  if (fixedLines && fixedLines > 0) {
    // MODALITÀ INTELLIGENTE: Numero righe fisso + font auto-ridimensionato conservativamente
    return {
      numberOfLines: fixedLines,
      ellipsizeMode: 'clip' as const, // Non troncare con "...", il font è già ottimizzato
      adjustsFontSizeToFit: false, // Usiamo la nostra logica più precisa
    };
  }

  // Solo fixed={true}: Layout controllato ma testo naturale
  return {
    adjustsFontSizeToFit: false,
  };
};

/**
 * Configurazione cross-platform per line breaking e hyphenation
 */
export const getPlatformTextProps = (
  lineBreakStrategyIOS:
    | 'push-out'
    | 'standard'
    | 'hangul-word'
    | 'none' = 'push-out',
  breakStrategyAndroid: 'simple' | 'highQuality' | 'balanced' = 'highQuality',
  hyphenationFrequencyAndroid: 'none' | 'normal' | 'full' = 'full'
) => {
  return {
    // iOS specific props
    ...(lineBreakStrategyIOS !== 'none' && {
      lineBreakStrategyIOS,
    }),

    // Android specific props
    ...(breakStrategyAndroid && {
      breakStrategyAndroid,
    }),
    ...(hyphenationFrequencyAndroid !== 'none' && {
      hyphenationFrequencyAndroid,
    }),
  };
};
