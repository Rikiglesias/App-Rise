import React from 'react';
import { Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

interface PlatformIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: object;
}

/**
 * Smart Icon che usa:
 * - iOS: MaterialCommunityIcons con mapping iOS-style
 * - Android: MaterialCommunityIcons standard
 *
 * Nota: Per SF Symbols veri, serve installazione separata.
 * Questo componente fornisce mapping intelligente.
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({
  name,
  size = 24,
  color,
  style,
}) => {
  // Mapping strategico iOS-style -> Android Material
  const iconMapping = {
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

    // Direct mapping fallback
    [name]: name,
  };

  // Get the appropriate icon name
  const iconName = iconMapping[name] ?? name;

  return (
    <MaterialCommunityIcons
      name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default PlatformIcon;
