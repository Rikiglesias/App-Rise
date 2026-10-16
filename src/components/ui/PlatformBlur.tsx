import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, type ViewProps } from 'react-native';

interface PlatformBlurProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  backgroundColor?: string;
}

/**
 * iOS: blur nativo. Android: ripiego semitrasparente di expo-blur SDK 54
 * (experimentalBlurMethod resta al default `none`, senza blur sperimentale).
 */
export const PlatformBlur: React.FC<PlatformBlurProps> = ({
  children,
  style,
  intensity = 90,
  tint = 'light',
  backgroundColor,
  ...props
}) => {
  // Mantiene l'intensità esistente anche per il ripiego Android.
  const effectiveIntensity =
    Platform.OS === 'android' ? Math.min(intensity, 75) : intensity;

  const combinedStyle = backgroundColor ? [style, { backgroundColor }] : style;
  return (
    <BlurView
      intensity={effectiveIntensity}
      tint={tint}
      style={combinedStyle}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default PlatformBlur;
