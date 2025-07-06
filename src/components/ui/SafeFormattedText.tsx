/**
 * SAFE FORMATTED TEXT - NEW ARCHITECTURE COMPATIBLE
 *
 * Wrapper che risolve il bug "minimumFontScale ignorato" su RN 0.77+ New Architecture
 */

import React from 'react';
import { Platform } from 'react-native';
import { FormattedText, FormattedTextProps } from './FormattedText';

/**
 * Interface per il package.json di React Native
 */
interface ReactNativePackageInfo {
  version: string;
}

/**
 * Detecta se siamo su New Architecture (versione semplificata)
 */
const isNewArchitecture = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const packageInfo =
      require('react-native/package.json') as ReactNativePackageInfo;
    const versionParts = packageInfo.version.split('.');
    const majorVersion = parseInt(versionParts[0] ?? '0');
    const minorVersion = parseInt(versionParts[1] ?? '0');

    // RN 0.77+ ha New Architecture come default
    return majorVersion > 0 || (majorVersion === 0 && minorVersion >= 77);
  } catch {
    return false;
  }
};

/**
 * Calcola fontSize ottimale per New Architecture
 */
const calculateOptimalFontSize = (
  text: string,
  fontSize: number,
  targetLines: number,
  maxWidth: number = 350
): number => {
  if (!text || targetLines <= 0) return fontSize;

  const estimatedCharsPerLine = Math.floor(maxWidth / (fontSize * 0.55));
  const estimatedLines = Math.ceil(text.length / estimatedCharsPerLine);

  if (estimatedLines <= targetLines) {
    return fontSize;
  }

  // Riduci fontSize conservativamente
  const reductionFactor = Math.max(0.85, targetLines / estimatedLines);
  return Math.max(fontSize * 0.85, fontSize * reductionFactor);
};

/**
 * SAFE FORMATTED TEXT COMPONENT
 *
 * Wrapper intelligente che detecta New Architecture
 */
export const SafeFormattedText: React.FC<FormattedTextProps> = props => {
  const {
    fixed,
    fixedLines,
    children,
    fontSize: manualFontSize,
    ...otherProps
  } = props;

  const isNewArch = isNewArchitecture();
  const text = typeof children === 'string' ? children : '';

  // Su New Architecture con fixed + fixedLines, usa fontSize ottimizzato
  if (isNewArch && fixed && fixedLines && text && manualFontSize) {
    const optimizedFontSize = calculateOptimalFontSize(
      text,
      manualFontSize,
      fixedLines,
      350 // Container width fallback
    );

    return (
      <FormattedText
        {...otherProps}
        fixed={fixed}
        fixedLines={fixedLines}
        fontSize={optimizedFontSize}
      >
        {children}
      </FormattedText>
    );
  }

  // Altrimenti usa FormattedText normale
  return <FormattedText {...props}>{children}</FormattedText>;
};

/**
 * Hook per detectare New Architecture
 */
export const useNewArchitectureDetection = () => {
  const isNewArch = isNewArchitecture();

  return {
    isNewArchitecture: isNewArch,
    platform: Platform.OS,
    shouldUseFallback: isNewArch,
  };
};

/**
 * Utility per logging New Architecture info
 */
export const logNewArchitectureInfo = (): void => {
  if (!__DEV__) return;

  const isNewArch = isNewArchitecture();

  // eslint-disable-next-line no-console
  console.log('🏗️ New Architecture Detection:', {
    isNewArchitecture: isNewArch,
    platform: Platform.OS,
    version: Platform.Version,
    recommendation: isNewArch
      ? 'Use SafeFormattedText'
      : 'FormattedText is fine',
  });
};

export default SafeFormattedText;
