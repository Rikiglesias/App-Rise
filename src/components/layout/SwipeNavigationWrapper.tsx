import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { BottomTabParamList } from '../../navigation/types';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';

// =================================================================
// 🎯 TYPES & CONSTANTS
// =================================================================

type TabName = keyof BottomTabParamList;

interface SwipeNavigationWrapperProps {
  children: React.ReactNode;
  currentTab: TabName;
}

const SWIPE_THRESHOLD = 80;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Ordine logico dei tab per la navigazione swipe
const TAB_ORDER: TabName[] = ['ImpactTab', 'HomeTab', 'InfoTab'];

// Configurazioni spring fluide e naturali
const SMOOTH_SPRING = {
  damping: 22,
  stiffness: 280,
  mass: 0.7,
};

// Configurazioni per transizioni ultra-fluide e morbide
const PAGE_TRANSITION_SPRING = {
  damping: 18,
  stiffness: 250,
  mass: 0.6,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const ULTRA_SMOOTH_TIMING = {
  duration: 400,
  easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // Curva ultra-morbida
};

const GENTLE_FADE = {
  duration: 350,
  easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design smooth
};

const ELASTIC_SCALE = {
  damping: 15,
  stiffness: 200,
  mass: 0.5,
};

// =================================================================
// 🚀 MAIN COMPONENT
// =================================================================

export const SwipeNavigationWrapper: React.FC<SwipeNavigationWrapperProps> = ({
  children,
  currentTab,
}) => {
  const navigation =
    useNavigation<BottomTabNavigationProp<BottomTabParamList>>();
  const { triggerHaptic } = useHapticFeedback();

  // Valori per fluidità gesture
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Valori per transizioni di pagina fluide
  const pageTransition = useSharedValue(1);
  const pageOpacity = useSharedValue(1);
  const pageScale = useSharedValue(1);

  // Calcolo dell'indice corrente del tab
  const currentTabIndex = useMemo(() => {
    return TAB_ORDER.indexOf(currentTab);
  }, [currentTab]);

  // Animazione di entrata fluida per cambio pagina
  useEffect(() => {
    // Reset iniziale per transizione fluida
    pageTransition.value = 0.95;
    pageOpacity.value = 0.8;
    pageScale.value = 0.96;

    // Animazione di entrata coordinata ultra-fluida
    pageTransition.value = withSpring(1, PAGE_TRANSITION_SPRING);
    pageOpacity.value = withTiming(1, ULTRA_SMOOTH_TIMING);
    pageScale.value = withSequence(
      withTiming(0.98, { duration: 200, easing: Easing.out(Easing.quad) }),
      withSpring(1, ELASTIC_SCALE)
    );

    // Reset gesture values con curve morbide
    scale.value = withSpring(1, SMOOTH_SPRING);
    opacity.value = withTiming(1, GENTLE_FADE);
  }, [currentTab, pageTransition, pageOpacity, pageScale, scale, opacity]);

  // Logica di navigazione con transizione ultra-fluida
  const navigateToTab = useCallback(
    (direction: 'left' | 'right') => {
      const currentIndex = TAB_ORDER.indexOf(currentTab);
      let targetIndex: number;

      if (direction === 'left') {
        targetIndex = currentIndex - 1;
      } else {
        targetIndex = currentIndex + 1;
      }

      if (targetIndex < 0 || targetIndex >= TAB_ORDER.length) {
        triggerHaptic('light');
        return;
      }

      const targetTab = TAB_ORDER[targetIndex];
      if (targetTab) {
        // Animazione di uscita ultra-fluida prima della navigazione
        pageTransition.value = withTiming(0.94, {
          duration: 200,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        });
        pageOpacity.value = withTiming(0.85, {
          duration: 180,
          easing: Easing.out(Easing.quad),
        });
        pageScale.value = withTiming(0.97, {
          duration: 190,
          easing: Easing.out(Easing.cubic),
        });

        triggerHaptic('light');
        navigation.navigate(targetTab);
      }
    },
    [
      currentTab,
      navigation,
      triggerHaptic,
      pageTransition,
      pageOpacity,
      pageScale,
    ]
  );

  // Gesture semplificato e fluido
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate(event => {
          'worklet';
          try {
            const { translationX } = event;

            // Protezione contro valori non validi
            if (!translationX || isNaN(translationX)) {
              return;
            }

            // Resistenza naturale ai bordi
            let resistance = 1;
            const isAtLeftBorder = currentTabIndex === 0 && translationX > 0;
            const isAtRightBorder =
              currentTabIndex === TAB_ORDER.length - 1 && translationX < 0;

            if (isAtLeftBorder || isAtRightBorder) {
              const distance = Math.abs(translationX);
              const normalizedDistance = distance / (SCREEN_WIDTH * 0.5);
              resistance = Math.max(0.3, 1 - normalizedDistance * 0.7);
            }

            translateX.value = translationX * resistance;

            // Effetti ultra-sottili per fluidità durante gesture
            const progress = Math.abs(translationX) / (SCREEN_WIDTH * 0.3);
            const clampedProgress = Math.min(progress, 1);

            // Opacity ultra-sottile con curva morbida
            opacity.value = interpolate(
              clampedProgress,
              [0, 0.5, 1],
              [1, 0.98, 0.94],
              Extrapolate.CLAMP
            );

            // Scale quasi impercettibile ma fluido
            scale.value = interpolate(
              clampedProgress,
              [0, 0.3, 1],
              [1, 0.995, 0.985],
              Extrapolate.CLAMP
            );

            // Effetto di preparazione ultra-fluida alla transizione
            pageOpacity.value = interpolate(
              clampedProgress,
              [0, 0.4, 0.8, 1],
              [1, 0.99, 0.96, 0.92],
              Extrapolate.CLAMP
            );

            // Preparazione scale per transizione morbida
            pageScale.value = interpolate(
              clampedProgress,
              [0, 0.6, 1],
              [1, 0.998, 0.994],
              Extrapolate.CLAMP
            );
          } catch (error) {
            // Gestione silenziosa errori
          }
        })
        .onEnd(event => {
          'worklet';
          try {
            const { translationX, velocityX } = event;

            // Protezione contro valori non validi
            if (
              !translationX ||
              !velocityX ||
              isNaN(translationX) ||
              isNaN(velocityX)
            ) {
              return;
            }

            // Reset fluido con animazioni coordinate
            translateX.value = withSpring(0, SMOOTH_SPRING);
            opacity.value = withTiming(1, GENTLE_FADE);
            scale.value = withSpring(1, SMOOTH_SPRING);
            pageOpacity.value = withTiming(1, ULTRA_SMOOTH_TIMING);

            // Determinazione swipe semplificata
            const swipeDistance = Math.abs(translationX);
            const swipeVelocity = Math.abs(velocityX);
            const velocityThreshold = swipeVelocity > 800;
            const distanceThreshold = swipeDistance > SWIPE_THRESHOLD;
            const shouldNavigate = velocityThreshold || distanceThreshold;

            if (shouldNavigate) {
              if (translationX > 0) {
                runOnJS(navigateToTab)('left');
              } else {
                runOnJS(navigateToTab)('right');
              }
            }
          } catch (error) {
            // Gestione silenziosa errori
          }
        })
        .minDistance(5)
        .failOffsetY([-50, 50])
        .activeOffsetX([-8, 8])
        .shouldCancelWhenOutside(true)
        .enableTrackpadTwoFingerGesture(false),
    [
      currentTabIndex,
      navigateToTab,
      translateX,
      opacity,
      scale,
      pageOpacity,
      pageScale,
    ]
  );

  // Stili animati fluidi con transizioni di pagina
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value * pageScale.value * pageTransition.value },
    ],
    opacity: opacity.value * pageOpacity.value,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureArea}>
          <Animated.View style={[styles.contentWrapper, animatedStyle]}>
            {children}
          </Animated.View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

// =================================================================
// 🎨 STYLES SEMPLICI
// =================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gestureArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
  },
});

export default SwipeNavigationWrapper;
