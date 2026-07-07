import { useEffect } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 4;

// Con transform [translate, scale] e origine al centro, il contenuto scalato
// sborda di (extent·(scale−1))/2 per lato: oltre quel limite si vedrebbe il
// vuoto fuori mappa. Clamp simmetrico attorno allo zero.
const clampTranslate = (
  value: number,
  scaleValue: number,
  extent: number
): number => {
  'worklet';
  const max = Math.max(0, (extent * (scaleValue - 1)) / 2);
  return Math.min(Math.max(value, -max), max);
};

/**
 * useMapZoom — pinch-zoom + pan per la mappa SVG.
 *
 * Strategia (da ricerca version-safe): la trasformazione (translate+scale) si applica
 * a un Animated.View wrapper ESTERNO all'<Svg> via `animatedStyle`, NON al transform di
 * un <G> (bug noti react-native-svg+reanimated su New Arch). Le callback gesture sono
 * workletizzate automaticamente dal plugin reanimated. Scala clampata [1, 4].
 *
 * Solidità (feedback device "instabile"):
 * - il PAN è attivo solo a zoom>1 e clampato ai bordi del contenuto (mai vuoto
 *   fuori mappa, niente trascinamenti a vista piena che "rimbalzano");
 * - il PINCH zooma verso il punto medio delle dita (focale), non verso il centro:
 *   il translate compensa così il punto sotto le dita resta fermo.
 *
 * `resetKey` (es. gli id-paese del continente attivo): al cambio si azzera zoom/pan,
 * così ogni continente parte dalla vista fittata. `width`/`height` = viewport della
 * mappa (per i limiti di pan); a 0 (pre-layout) il clamp degenera a 0 senza errori.
 */
export const useMapZoom = (resetKey: string, width: number, height: number) => {
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
      // A vista piena non c'è nulla da trascinare: pan inerte (niente jank).
      if (scale.value <= MIN_SCALE) return;
      translateX.value = clampTranslate(
        savedTranslateX.value + event.translationX,
        scale.value,
        width
      );
      translateY.value = clampTranslate(
        savedTranslateY.value + event.translationY,
        scale.value,
        height
      );
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const pinch = Gesture.Pinch()
    .onUpdate(event => {
      const next = Math.min(
        Math.max(savedScale.value * event.scale, MIN_SCALE),
        MAX_SCALE
      );
      // Zoom focale: il punto del contenuto sotto le dita resta fermo.
      // Con origine al centro: p = (f − t₀)/s₀ → t₁ = f − (s₁/s₀)·(f − t₀),
      // dove f = focale relativa al centro del viewport.
      const focalX = event.focalX - width / 2;
      const focalY = event.focalY - height / 2;
      const ratio = next / savedScale.value;
      scale.value = next;
      translateX.value = clampTranslate(
        focalX - ratio * (focalX - savedTranslateX.value),
        next,
        width
      );
      translateY.value = clampTranslate(
        focalY - ratio * (focalY - savedTranslateY.value),
        next,
        height
      );
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
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
