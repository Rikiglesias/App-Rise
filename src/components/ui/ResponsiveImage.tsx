/**
 * RESPONSIVE IMAGE COMPONENT
 *
 * Risolve la lacuna critica delle immagini responsive in React Native
 * Implementa le best practices trovate su internet per gestire:
 * - Aspect ratio automatico
 * - Sizing responsive
 * - Performance optimization
 * - Cross-platform consistency
 */

import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  Dimensions,
  ImageProps,
  ViewStyle,
  ImageStyle,
} from 'react-native';
import { useResponsiveLayout } from '../../shared/hooks/useResponsiveLayout';

interface ResponsiveImageProps extends Omit<ImageProps, 'style'> {
  /**
   * Preset responsive per casi comuni
   */
  preset?: 'hero' | 'card' | 'thumbnail' | 'banner' | 'fullscreen';

  /**
   * Aspect ratio fisso (opzionale)
   * Esempi: 16/9, 4/3, 1/1 (quadrata)
   */
  aspectRatio?: number;

  /**
   * Modalità responsive width
   */
  responsiveWidth?: 'container' | 'screen' | 'auto';

  /**
   * Altezza massima (previene immagini troppo grandi)
   */
  maxHeight?: number;

  /**
   * Altezza minima (garantisce visibilità)
   */
  minHeight?: number;

  /**
   * Stile del container
   */
  containerStyle?: ViewStyle;

  /**
   * Stile dell'immagine
   */
  imageStyle?: ImageStyle;

  /**
   * Bordi arrotondati automatici
   */
  rounded?: boolean | number;

  /**
   * Ombra automatica
   */
  shadow?: boolean | 'soft' | 'medium' | 'strong';
}

/**
 * Preset predefiniti per casi comuni
 */
const RESPONSIVE_PRESETS = {
  hero: {
    aspectRatio: 16 / 9,
    responsiveWidth: 'screen' as const,
    maxHeight: 400,
    minHeight: 200,
  },
  card: {
    aspectRatio: 4 / 3,
    responsiveWidth: 'container' as const,
    maxHeight: 250,
    minHeight: 150,
  },
  thumbnail: {
    aspectRatio: 1,
    responsiveWidth: 'auto' as const,
    maxHeight: 100,
    minHeight: 60,
  },
  banner: {
    aspectRatio: 3 / 1,
    responsiveWidth: 'screen' as const,
    maxHeight: 200,
    minHeight: 100,
  },
  fullscreen: {
    aspectRatio: undefined, // Usa dimensioni originali
    responsiveWidth: 'screen' as const,
    maxHeight: undefined,
    minHeight: 300,
  },
};

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  preset,
  aspectRatio,
  responsiveWidth = 'container',
  maxHeight,
  minHeight,
  containerStyle,
  imageStyle,
  rounded = false,
  shadow = false,
  source,
  resizeMode = 'cover',
  ...imageProps
}) => {
  const { responsive } = useResponsiveLayout();
  const [imageDimensions, setImageDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Applica preset se specificato
  const presetConfig = preset ? RESPONSIVE_PRESETS[preset] : null;
  const finalAspectRatio = aspectRatio ?? presetConfig?.aspectRatio;
  const finalResponsiveWidth =
    responsiveWidth ?? presetConfig?.responsiveWidth ?? 'container';
  const finalMaxHeight = maxHeight ?? presetConfig?.maxHeight;
  const finalMinHeight = minHeight ?? presetConfig?.minHeight;

  // Ottieni dimensioni originali dell'immagine per calcoli intelligenti
  useEffect(() => {
    if (source && typeof source === 'object' && 'uri' in source && source.uri) {
      Image.getSize(
        source.uri,
        (width, height) => setImageDimensions({ width, height }),
        () => setImageDimensions(null)
      );
    }
  }, [source]);

  // Calcola dimensioni responsive
  const calculateDimensions = () => {
    const screenWidth = Dimensions.get('window').width;

    // Determina larghezza base
    let baseWidth: number;
    switch (finalResponsiveWidth) {
      case 'screen':
        baseWidth = screenWidth;
        break;
      case 'container':
        // Usa larghezze responsive dal sistema esistente
        const containerWidth =
          responsive({
            compact: screenWidth * 0.95,
            standard: screenWidth * 0.9,
            large: screenWidth * 0.85,
            xlarge: screenWidth * 0.8,
          }) ?? screenWidth * 0.9;
        baseWidth =
          typeof containerWidth === 'string'
            ? screenWidth * (parseFloat(containerWidth) / 100)
            : containerWidth;
        break;
      case 'auto':
      default:
        baseWidth = imageDimensions?.width ?? 300;
        break;
    }

    // Calcola altezza
    let height: number;
    if (finalAspectRatio) {
      // Usa aspect ratio specificato
      height = baseWidth / finalAspectRatio;
    } else if (imageDimensions) {
      // Usa proporzioni originali dell'immagine
      const originalRatio = imageDimensions.width / imageDimensions.height;
      height = baseWidth / originalRatio;
    } else {
      // Fallback: aspect ratio 16:9
      height = baseWidth / (16 / 9);
    }

    // Applica limiti min/max height
    if (finalMaxHeight && height > finalMaxHeight) {
      height = finalMaxHeight;
      baseWidth =
        height *
        (finalAspectRatio ??
          (imageDimensions
            ? imageDimensions.width / imageDimensions.height
            : 16 / 9));
    }

    if (finalMinHeight && height < finalMinHeight) {
      height = finalMinHeight;
      baseWidth =
        height *
        (finalAspectRatio ??
          (imageDimensions
            ? imageDimensions.width / imageDimensions.height
            : 16 / 9));
    }

    return { width: baseWidth, height };
  };

  const { width, height } = calculateDimensions();

  // Calcola stili responsive
  const getBorderRadius = () => {
    if (typeof rounded === 'number') return rounded;
    if (rounded === true) {
      return (
        responsive({
          compact: 8,
          standard: 12,
          large: 16,
          xlarge: 20,
        }) ?? 12
      );
    }
    return 0;
  };

  const getShadowStyle = () => {
    if (!shadow) return {};

    const shadowPresets = {
      soft: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      strong: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
      },
    };

    const shadowType = typeof shadow === 'string' ? shadow : 'medium';
    return shadowPresets[shadowType] || shadowPresets.medium;
  };

  const borderRadius = getBorderRadius();
  const shadowStyle = getShadowStyle();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
          ...shadowStyle,
        },
        containerStyle,
      ]}
    >
      <Image
        source={source}
        resizeMode={resizeMode}
        style={[
          {
            width: '100%',
            height: '100%',
          },
          imageStyle,
        ]}
        {...imageProps}
      />
    </View>
  );
};

export default ResponsiveImage;
