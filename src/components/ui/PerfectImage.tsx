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
import { universal } from '../../shared/utils/UniversalMillimetricSystem';

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
  hero: { width: 350, aspectRatio: 16/9, borderRadius: 12, shadow: 'medium' },
  card: { width: 280, aspectRatio: 4/3, borderRadius: 8, shadow: 'light' },
  thumbnail: { width: 80, aspectRatio: 1, borderRadius: 8, shadow: false },
  avatar: { width: 60, aspectRatio: 1, borderRadius: 30, shadow: 'light' },
  banner: { width: 380, aspectRatio: 3/1, borderRadius: 6, shadow: false }
} as const;

// 🎭 SHADOW STYLES
const SHADOW_STYLES = {
  light: {
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
  }
} as const;

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
  
  const finalWidth = universal.width(config?.width ?? width);
  const finalAspectRatio = config?.aspectRatio ?? aspectRatio ?? (height ? width / height : 4/3);
  const finalHeight = height ? universal.height(height) : finalWidth / finalAspectRatio;
  const finalBorderRadius = universal.spacing(config?.borderRadius ?? borderRadius ?? 0);
  const finalShadow = config?.shadow ?? shadow ?? false;

  // 🎨 CALCOLA STILI
  const shadowStyle = (() => {
    if (finalShadow && typeof finalShadow === 'string') {
      return SHADOW_STYLES[finalShadow];
    }
    if (finalShadow === true) {
      return SHADOW_STYLES.medium;
    }
    return {};
  })();

  const containerStyleCalculated: ViewStyle = {
    width: finalWidth,
    height: finalHeight,
    borderRadius: finalBorderRadius,
    overflow: 'hidden',
    ...shadowStyle,
    ...containerStyle
  };

  const imageStyleCalculated: ImageStyle = {
    width: '100%',
    height: '100%',
    ...imageStyle
  };

  // Debug info removed for production

  return (
    <View style={containerStyleCalculated}>
      <Image
        {...imageProps}
        style={imageStyleCalculated}
        resizeMode="cover"
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