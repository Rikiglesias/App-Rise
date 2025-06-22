import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, View, ViewProps } from 'react-native';

interface PlatformBlurProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  backgroundColor?: string;
}

/**
 * Smart Blur che usa:
 * - iOS: BlurView nativo (mantiene effetto esistente)
 * - Android: Gradient ottimizzato (performance migliore)
 */
export const PlatformBlur: React.FC<PlatformBlurProps> = ({
  children,
  style,
  intensity = 90,
  tint = 'light',
  backgroundColor,
  ...props
}) => {
  // iOS: mantiene BlurView nativo (zero cambiamenti)
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint={tint} style={style} {...props}>
        {children}
      </BlurView>
    );
  }

  // Android: usa gradient ottimizzato per performance
  const getAndroidBackground = () => {
    if (backgroundColor) return backgroundColor;

    switch (tint) {
      case 'dark':
        return 'rgba(0, 0, 0, 0.8)';
      case 'light':
      default:
        return 'rgba(255, 255, 255, 0.95)';
    }
  };

  return (
    <View style={style} {...props}>
      <LinearGradient
        colors={[getAndroidBackground(), getAndroidBackground()]}
        style={gradientStyle}
      />
      {children}
    </View>
  );
};

// Styles
const gradientStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};

export default PlatformBlur;
