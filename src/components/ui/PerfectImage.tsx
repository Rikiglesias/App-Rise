/**
 * PERFECT IMAGE - Sistema Immagini Identiche iPhone 15
 *
 * GARANTISCE:
 * - Dimensioni identiche proporzionalmente su tutti i dispositivi
 * - Mai troppo grandi o troppo piccole
 * - Aspect ratio sempre rispettato
 * - Preset per casi comuni (hero, card, thumbnail)
 */

import React from 'react';
import { Image, ImageProps, View, ImageStyle, ViewStyle } from 'react-native';
import { scale } from '../../shared/constants/perfectScale';
import { getPerfectShadow } from '../../shared/constants/perfectShadow';

interface PerfectImageProps extends Omit<ImageProps, 'style'> {
  /** Larghezza di riferimento su iPhone 15 */
  width: number;

  /** Altezza di riferimento su iPhone 15 (opzionale - usa aspect ratio) */
  height?: number;

  /** Aspect ratio (width/height) - usato se height non specificato */
  aspectRatio?: number;

  /** Preset per casi comuni */
  preset?: 'hero' | 'card' | 'thumbnail' | 'avatar' | 'banner';

  /** Border radius */
  borderRadius?: number;

  /** Ombra */
  shadow?: boolean | 'light' | 'medium' | 'strong';

  /** Stile container */
  containerStyle?: ViewStyle;

  /** Stile immagine custom */
  imageStyle?: ImageStyle;

  /**
   * Usa dimensioni assolute (px schermo) senza scaling.
   * Utile quando width/height sono calcolati da Dimensions per riempire container.
   * Default: false -> scala in base a iPhone 15.
   */
  absoluteDimensions?: boolean;
}

// Preset dimensioni calcolati a runtime (no valori scalati all'import)
const getImagePreset = (preset: NonNullable<PerfectImageProps['preset']>) => {
  switch (preset) {
    case 'hero':
      return {
        width: scale(350),
        aspectRatio: 16 / 9,
        borderRadius: scale(12),
        shadow: 'medium' as const,
      };
    case 'card':
      return {
        width: scale(280),
        aspectRatio: 4 / 3,
        borderRadius: scale(8),
        shadow: 'light' as const,
      };
    case 'thumbnail':
      return {
        width: scale(80),
        aspectRatio: 1,
        borderRadius: scale(8),
        shadow: false as const,
      };
    case 'avatar':
      return {
        width: scale(60),
        aspectRatio: 1,
        borderRadius: scale(30),
        shadow: 'light' as const,
      };
    case 'banner':
      return {
        width: scale(380),
        aspectRatio: 3 / 1,
        borderRadius: scale(6),
        shadow: false as const,
      };
  }
};

export const PerfectImage: React.FC<PerfectImageProps> = ({
  width,
  height,
  aspectRatio,
  preset,
  borderRadius,
  shadow,
  containerStyle,
  imageStyle,
  absoluteDimensions = false,
  ...imageProps
}) => {
  // Risolvi preset o valori custom (runtime)
  const config = preset ? getImagePreset(preset) : null;

  const finalWidth =
    config?.width ?? (absoluteDimensions ? width : scale(width));
  const finalAspectRatio =
    config?.aspectRatio ?? aspectRatio ?? (height ? width / height : 4 / 3);
  const finalHeight = height
    ? absoluteDimensions
      ? height
      : scale(height)
    : finalWidth / finalAspectRatio;
  const finalBorderRadius = config?.borderRadius ?? scale(borderRadius ?? 0);
  const finalShadow = config?.shadow ?? shadow ?? false;

  // Calcola stili (shadow scalati)
  const shadowStyle = (() => {
    if (finalShadow && typeof finalShadow === 'string') {
      return getPerfectShadow(finalShadow as 'light' | 'medium' | 'strong');
    }
    if (finalShadow === true) {
      return getPerfectShadow('medium');
    }
    return {};
  })();

  const containerStyleCalculated: ViewStyle = {
    width: finalWidth,
    height: finalHeight,
    borderRadius: finalBorderRadius,
    overflow: 'hidden',
    ...shadowStyle,
    ...containerStyle,
  };

  const imageStyleCalculated: ImageStyle = {
    width: '100%',
    height: '100%',
    ...imageStyle,
  };

  // Estrai resizeMode da imageStyle se presente, altrimenti usa 'cover'
  const resizeMode = imageStyle?.resizeMode ?? 'cover';

  return (
    <View style={containerStyleCalculated}>
      <Image
        {...imageProps}
        style={imageStyleCalculated}
        resizeMode={resizeMode}
      />
    </View>
  );
};

// Shortcuts per preset
export const HeroImage = (props: Omit<PerfectImageProps, 'preset'>) => (
  <PerfectImage {...props} preset="hero" />
);

export const CardImage = (props: Omit<PerfectImageProps, 'preset'>) => (
  <PerfectImage {...props} preset="card" />
);

export const ThumbnailImage = (props: Omit<PerfectImageProps, 'preset'>) => (
  <PerfectImage {...props} preset="thumbnail" />
);

export const AvatarImage = (props: Omit<PerfectImageProps, 'preset'>) => (
  <PerfectImage {...props} preset="avatar" />
);

export const BannerImage = (props: Omit<PerfectImageProps, 'preset'>) => (
  <PerfectImage {...props} preset="banner" />
);
