import React, { useEffect } from 'react';
import { StyleSheet, Pressable } from 'react-native';
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
  onPress: () => void;
  accessibilityLabel: string;
}

/**
 * MapPin — pin destinazione a livello-città, come overlay (NON SVG) per animare con
 * reanimated (parità web + evita i bug noti di animatedProps su react-native-svg).
 * Dot pieno brand + bordo bianco (statico) e un alone "radar" che si espande e svanisce
 * in loop → il marker comunica una sede ATTIVA. Posizionato centrato su (x, y).
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
    // Radar: 0→1 in loop (restart, non reverse). Cleanup obbligatorio (no leak UI-thread).
    pulse.value = withRepeat(
      withTiming(1, { duration: 1900, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );
    return () => cancelAnimation(pulse);
  }, [pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.35 + pulse.value * 0.95 }],
    opacity: 0.35 * (1 - pulse.value),
  }));

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={[
        styles.wrap,
        {
          left: x - haloSize / 2,
          top: y - haloSize / 2,
          width: haloSize,
          height: haloSize,
        },
      ]}
    >
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
      <Animated.View
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
  dot: {
    borderWidth: 2,
  },
});

const MapPin = React.memo(MapPinComponent);
MapPin.displayName = 'MapPin';

export default MapPin;
