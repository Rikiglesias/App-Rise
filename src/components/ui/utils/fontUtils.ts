import { Platform, TextStyle } from 'react-native';

/**
 * Font utilities per FormattedText
 * Gestisce fallback, detection e mapping font weights
 */

/**
 * Mapping font weights a valori numerici/string
 */
export const getFontWeight = (
  weight?:
    | 'light'
    | 'regular'
    | 'medium'
    | 'semibold'
    | 'bold'
    | 'extrabold'
    | 'black'
): TextStyle['fontWeight'] => {
  const weights: Record<string, TextStyle['fontWeight']> = {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  };

  return weight ? weights[weight] : '400';
};

/**
 * Detecta il tipo di contenuto del testo per font fallback
 */
export const detectTextContent = (
  text: string
): 'emoji' | 'cjk' | 'arabic' | 'latin' => {
  // Emoji detection (Unicode ranges)
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
  if (emojiRegex.test(text)) return 'emoji';

  // CJK detection (Chinese, Japanese, Korean)
  const cjkRegex =
    /[\u4e00-\u9fff]|[\u3400-\u4dbf]|[\u3040-\u309f]|[\u30a0-\u30ff]|[\uac00-\ud7af]/;
  if (cjkRegex.test(text)) return 'cjk';

  // Arabic detection
  const arabicRegex =
    /[\u0600-\u06ff]|[\u0750-\u077f]|[\u08a0-\u08ff]|[\ufb50-\ufdff]|[\ufe70-\ufeff]/;
  if (arabicRegex.test(text)) return 'arabic';

  return 'latin';
};

/**
 * Catena di fallback font per diversi tipi di contenuto
 */
export const getFallbackFontFamily = (
  textContent: string,
  customFontFamily?: string
): string => {
  const contentType = detectTextContent(textContent);
  const customFont = customFontFamily ?? '';

  const fontChains = Platform.select({
    ios: {
      emoji: `${customFont}, "Apple Color Emoji", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`,
      cjk: `${customFont}, "Noto Sans CJK SC", "PingFang SC", "Hiragino Sans GB", -apple-system, BlinkMacSystemFont`,
      arabic: `${customFont}, "Noto Sans Arabic", "Geeza Pro", -apple-system, BlinkMacSystemFont`,
      latin: `${customFont}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
    android: {
      emoji: `${customFont}, "Noto Color Emoji", "Segoe UI Emoji", "Segoe UI", Roboto, sans-serif`,
      cjk: `${customFont}, "Noto Sans CJK SC", "Source Han Sans", "Droid Sans Fallback", Roboto, sans-serif`,
      arabic: `${customFont}, "Noto Sans Arabic", "Droid Arabic Naskh", Roboto, sans-serif`,
      latin: `${customFont}, Roboto, "Helvetica Neue", Arial, sans-serif`,
    },
    default: {
      emoji: `${customFont}, "Segoe UI Emoji", "Segoe UI", "Helvetica Neue", Arial, sans-serif`,
      cjk: `${customFont}, "Noto Sans CJK SC", "Helvetica Neue", Arial, sans-serif`,
      arabic: `${customFont}, "Noto Sans Arabic", "Helvetica Neue", Arial, sans-serif`,
      latin: `${customFont}, "Helvetica Neue", Arial, sans-serif`,
    },
  });

  return fontChains[contentType] || fontChains.latin;
};
