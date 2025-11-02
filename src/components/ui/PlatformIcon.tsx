import React from 'react';
import { Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scale } from '@/shared/constants/perfectScale';

interface PlatformIconProps {
  name: string;
  /** Size riferimento iPhone 15 (sarà scalato automaticamente) */
  size?: number;
  color?: string;
  style?: object;
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
 * iPad:      size={24} → 47px (scalato!)
 */
export const PlatformIcon: React.FC<PlatformIconProps> = ({
  name,
  size = 24,
  color,
  style,
}) => {
  // 🎯 SCALA size usando sistema Perfect Scale centralizzato
  const scaledSize = scale(size);
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
      size={scaledSize} // ✅ USA SIZE SCALATO
      color={color}
      style={style}
    />
  );
};

// Export con nome Perfect
export const PerfectIcon = PlatformIcon;

export default PlatformIcon;
