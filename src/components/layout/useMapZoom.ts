import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

/**
 * useMapZoom — pinch-zoom + pan per la mappa SVG.
 *
 * Strategia (da ricerca version-safe): la trasformazione (translate+scale) si applica
 * a un Animated.View wrapper ESTERNO all'<Svg> via `animatedStyle`, NON al transform di
 * un <G> (bug noti react-native-svg+reanimated su New Arch). Le callback gesture sono
 * workletizzate automaticamente dal plugin reanimated. Scala clampata [1, 4].
 *
 * `resetKey` (es. gli id-paese del continente attivo): al cambio si azzera zoom/pan,
 * così ogni continente parte dalla vista fittata.
 */
export const useMapZoom = (resetKey: string) => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withTiming(MIN_SCALE);
    savedScale.value = MIN_SCALE;
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    resetKey,
    scale,
    savedScale,
    translateX,
    translateY,
    savedTranslateX,
    savedTranslateY,
  ]);

  const pan = Gesture.Pan()
    .onUpdate(event => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate(event => {
      const next = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(next, MIN_SCALE), MAX_SCALE);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      // Tornati a scala 1 → ricentra (niente pan residuo a vista piena).
      if (scale.value <= MIN_SCALE) {
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const gesture = Gesture.Simultaneous(pan, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return { gesture, animatedStyle };
};
