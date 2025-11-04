import React from 'react';
import {
  Platform,
  ScrollView,
  ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { Surface } from 'react-native-paper';
import { PlatformBlur } from './PlatformBlur';
import { PlatformTouchable } from './PlatformTouchable';

// ===================================================================
// PLATFORM SCROLL VIEW - Ottimizzato per Android
// ===================================================================

interface PlatformScrollViewProps extends ScrollViewProps {
  optimizeAndroid?: boolean;
}

const PlatformScrollViewComponent: React.FC<PlatformScrollViewProps> = ({
  children,
  optimizeAndroid = true,
  ...props
}) => {
  // iOS: comportamento standard (identico)
  if (Platform.OS === 'ios') {
    return <ScrollView {...props}>{children}</ScrollView>;
  }

  // Android: ottimizzazioni specifiche (solo props valide per ScrollView)
  const androidOptimizations = optimizeAndroid
    ? {
        // Performance optimizations
        removeClippedSubviews: true,
        // Gesture ottimizzazioni
        nestedScrollEnabled: true,
        overScrollMode: 'auto' as const,
      }
    : {};

  return (
    <ScrollView {...androidOptimizations} {...props}>
      {children}
    </ScrollView>
  );
};

// ===================================================================
// PLATFORM SURFACE - Material vs iOS Cards
// ===================================================================

interface PlatformSurfaceProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
  variant?: 'card' | 'modal' | 'elevated';
}

const PlatformSurfaceComponent: React.FC<PlatformSurfaceProps> = ({
  children,
  style,
  elevation = 4,
  variant = 'card',
}) => {
  // iOS: usa Surface standard
  if (Platform.OS === 'ios') {
    return (
      <Surface style={style} elevation={0}>
        {children}
      </Surface>
    );
  }

  // Android: usa Material Surface con elevation nativa
  const elevationMap = {
    card: 2,
    modal: 8,
    elevated: elevation,
  };

  const androidElevation = elevationMap[variant];

  return (
    <Surface style={style} elevation={androidElevation as never}>
      {children}
    </Surface>
  );
};

// ===================================================================
// EXPORTS
// ===================================================================

export const PlatformScrollView = PlatformScrollViewComponent;
export const PlatformSurface = PlatformSurfaceComponent;

export { PlatformTouchable, PlatformBlur };
