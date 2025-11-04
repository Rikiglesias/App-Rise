import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, type ViewProps, type ViewStyle } from 'react-native';
import { PerfectContainer } from './PerfectContainer';

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
  // Usa BlurView nativo anche su Android per parità visiva.
  // Su Android limitiamo leggermente l'intensità per performance.
  const effectiveIntensity =
    Platform.OS === 'android' ? Math.min(intensity, 75) : intensity;

  // Fallback minimale in caso di problemi di runtime
  const fallback = (
    <PerfectContainer style={style as ViewStyle} {...props}>
      <LinearGradient
        colors={[
          // rgba necessario per fallback gradient blur semi-trasparente
          backgroundColor ??
            (tint === 'dark'
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(255, 255, 255, 0.9)'),
          backgroundColor ??
            (tint === 'dark'
              ? 'rgba(0, 0, 0, 0.7)'
              : 'rgba(255, 255, 255, 0.9)'),
        ]}
        style={gradientStyle}
      />
      {children}
    </PerfectContainer>
  );

  try {
    const combinedStyle = backgroundColor
      ? [style, { backgroundColor }]
      : style;

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
  } catch {
    return fallback;
  }
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
