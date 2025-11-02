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
}

// 🎨 PRESET DIMENSIONI (riferimento iPhone 15)
const IMAGE_PRESETS = {
  hero: {
    width: scale(350),
    aspectRatio: 16 / 9,
    borderRadius: scale(12),
    shadow: 'medium',
  },
  card: {
    width: scale(280),
    aspectRatio: 4 / 3,
    borderRadius: scale(8),
    shadow: 'light',
  },
  thumbnail: {
    width: scale(80),
    aspectRatio: 1,
    borderRadius: scale(8),
    shadow: false,
  },
  avatar: {
    width: scale(60),
    aspectRatio: 1,
    borderRadius: scale(30),
    shadow: 'light',
  },
  banner: {
    width: scale(380),
    aspectRatio: 3 / 1,
    borderRadius: scale(6),
    shadow: false,
  },
} as const;

// 🎭 SHADOW STYLES - Usa getPerfectShadow per shadows scalati

export const PerfectImage: React.FC<PerfectImageProps> = ({
  width,
  height,
  aspectRatio,
  preset,
  borderRadius,
  shadow,
  containerStyle,
  imageStyle,
  ...imageProps
}) => {
  // 🎯 RISOLVI PRESET O VALORI CUSTOM
  const config = preset ? IMAGE_PRESETS[preset] : null;

  const finalWidth = config?.width ?? scale(width);
  const finalAspectRatio =
    config?.aspectRatio ?? aspectRatio ?? (height ? width / height : 4 / 3);
  const finalHeight = height ? scale(height) : finalWidth / finalAspectRatio;
  const finalBorderRadius = config?.borderRadius ?? scale(borderRadius ?? 0);
  const finalShadow = config?.shadow ?? shadow ?? false;

  // 🎨 CALCOLA STILI
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

// 🎯 HELPER SHORTCUTS PER PRESET
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
