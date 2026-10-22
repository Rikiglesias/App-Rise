import React from 'react';
import { Platform, useWindowDimensions } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scale, scaleClamp } from '@/shared/constants/perfectScale';

interface PlatformIconProps {
  name: string;
  /** Size riferimento iPhone 15 (sarà scalato automaticamente) */
  size?: number;
  color?: string;
  style?: object;
  /** Limiti opzionali per clamp del size finale (in px assoluti) */
  minSize?: number;
  maxSize?: number;
}

/**
 * PERFECT ICON (ex PlatformIcon) - Icone Scalate Proporzionalmente
 *
 * GARANTISCE:
 * - Icone scalano proporzionalmente su tutti device
 * - Smart Icon iOS/Android mapping
 * - Size riferimento iPhone 15
 *
 * ESEMPIO:
 * iPhone 15: size={24} → 24px
 * iPad:      size={24} → ~47px (scalato!)
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({
  name,
  size = 24,
  color,
  style,
  minSize,
  maxSize,
}) => {
  // Iscritto alla finestra: le misure qui sotto (`scale*`) leggono quella di adesso, anche quando
  // il genitore è memorizzato e non si ridisegna (C54 del contratto android-play).
  useWindowDimensions();
  // SCALA size usando Perfect Scale con clamp opzionale (px assoluti)
  const scaledSize =
    typeof minSize === 'number' || typeof maxSize === 'number'
      ? scaleClamp(
          size,
          typeof minSize === 'number' ? minSize : -Infinity,
          typeof maxSize === 'number' ? maxSize : Infinity
        )
      : scale(size);

  // Mapping iOS-style → MaterialCommunityIcons (fallback diretto sul nome passato)
  const iconMapping: Record<string, string> = {
    // Navigation
    'house.fill': Platform.OS === 'ios' ? 'home-variant' : 'home',
    'heart.fill': 'heart',
    'plus.circle.fill': 'plus-circle',
    'person.fill': 'account',
    'chart.bar.fill': 'chart-bar',

    // Actions
    'hand.raised.fill': 'hand-heart',
    'gift.fill': 'gift',
    'phone.fill': 'phone',
    'envelope.fill': 'email',
    globe: 'web',

    // Social
    'camera.fill': 'instagram',
    'f.circle.fill': 'facebook',
    'l.circle.fill': 'linkedin',

    // Interface
    'chevron.right': 'chevron-right',
    'chevron.left': 'chevron-left',
    xmark: 'close',
    checkmark: 'check',
  };

  const iconName = iconMapping[name] ?? name;

  return (
    <MaterialCommunityIcons
      name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
      size={scaledSize}
      color={color}
      style={style}
    />
  );
};

// Export con nome Perfect
export const PerfectIcon = PlatformIcon;

export default PlatformIcon;
