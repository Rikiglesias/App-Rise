import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

interface MapPinProps {
  /** Centro del pin nel viewport (px), dalla proiezione. */
  x: number;
  y: number;
  /** Diametro del dot pieno. */
  dotSize: number;
  /** Diametro massimo dell'alone radar. */
  haloSize: number;
  color: string;
  ringColor: string;
  /**
   * Assente = pin DECORATIVO (preview): nessun bottone, escluso dall'albero
   * a11y — il tap vive sul container che apre la mappa fullscreen.
   */
  onPress?: (() => void) | undefined;
  accessibilityLabel: string;
}

/**
 * MapPin — pin destinazione a livello-città, come overlay (NON SVG) per animare con
 * reanimated (parità web + evita i bug noti di animatedProps su react-native-svg).
 * Gerarchia su 3 strati: glow statico morbido (ancora il pin alla mappa) → alone
 * "radar" lento che si espande e svanisce (sede ATTIVA, senza durezza) → dot pieno
 * brand con bordo. Posizionato centrato su (x, y).
 */
const MapPinComponent: React.FC<MapPinProps> = ({
  x,
  y,
  dotSize,
  haloSize,
  color,
  ringColor,
  onPress,
  accessibilityLabel,
}) => {
  const pulse = useSharedValue(0);

  useEffect(() => {
    // Radar: 0→1 in loop (restart, non reverse), lento e con easing dolce in
    // uscita → respiro, non lampeggio. Cleanup obbligatorio (no leak UI-thread).
    pulse.value = withRepeat(
      withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.4 + pulse.value * 0.9 }],
    opacity: 0.26 * (1 - pulse.value),
  }));

  const glowSize = dotSize * 2.2;

  const layers = (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: haloSize,
            height: haloSize,
            borderRadius: haloSize / 2,
            backgroundColor: color,
          },
          haloStyle,
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.glow,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: color,
          },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.dot,
          {
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: color,
            borderColor: ringColor,
          },
        ]}
      />
    </>
  );

  const frame = {
    left: x - haloSize / 2,
    top: y - haloSize / 2,
    width: haloSize,
    height: haloSize,
  };

  if (!onPress) {
    return (
      <View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.wrap, frame]}
      >
        {layers}
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={[styles.wrap, frame]}
    >
      {layers}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
  },
  glow: {
    position: 'absolute',
    opacity: 0.14,
  },
  dot: {
    borderWidth: 2,
  },
});

const MapPin = React.memo(MapPinComponent);
MapPin.displayName = 'MapPin';

export default MapPin;
