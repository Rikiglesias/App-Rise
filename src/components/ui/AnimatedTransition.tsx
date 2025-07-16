import React, { useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated } from 'react-native';

export type TransitionType =
  | 'fadeIn'
  | 'slideUp'
  | 'slideDown'
  | 'slideLeft'
  | 'slideRight'
  | 'scale'
  | 'bounce'
  | 'elastic';

interface AnimatedTransitionProps {
  readonly children: React.ReactNode;
  readonly type?: TransitionType;
  readonly duration?: number;
  readonly delay?: number;
  readonly style?: ViewStyle;
  readonly onComplete?: () => void;
  readonly trigger?: boolean; // Per ri-attivare l'animazione
}

// Hook for animation logic - Separated to reduce function length
const useAnimationValue = (
  type: TransitionType,
  duration: number,
  delay: number,
  trigger: boolean,
  onComplete?: () => void
) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger !== null) {
      animatedValue.setValue(0);

      const startAnimation = () => {
        const animation = getAnimation(type, animatedValue, duration);

        if (animation) {
          animation.start(() => {
            onComplete?.();
          });
        }
      };

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }
  }, [trigger, type, duration, delay, animatedValue, onComplete]);

  return animatedValue;
};

// Animation factory - Separated to reduce function length
const getAnimation = (
  animationType: TransitionType,
  value: Animated.Value,
  animationDuration: number
) => {
  switch (animationType) {
    case 'bounce':
      return Animated.spring(value, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      });
    case 'elastic':
      return Animated.spring(value, {
        toValue: 1,
        tension: 120,
        friction: 6,
        useNativeDriver: true,
      });
    default:
      return Animated.timing(value, {
        toValue: 1,
        duration: animationDuration,
        useNativeDriver: true,
      });
  }
};

// Individual animation style generators - Extracted to reduce function length
const getFadeInStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
});

const getSlideUpStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }),
    },
  ],
});

const getSlideDownStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateY: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
      }),
    },
  ],
});

const getSlideLeftStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [50, 0],
      }),
    },
  ],
});

const getSlideRightStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      translateX: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-50, 0],
      }),
    },
  ],
});

const getScaleStyle = (animatedValue: Animated.Value) => ({
  opacity: animatedValue,
  transform: [
    {
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 1],
      }),
    },
  ],
});

// Style generator - Now simplified with extracted functions
const getAnimatedStyle = (
  type: TransitionType,
  animatedValue: Animated.Value
) => {
  switch (type) {
    case 'fadeIn':
      return getFadeInStyle(animatedValue);
    case 'slideUp':
      return getSlideUpStyle(animatedValue);
    case 'slideDown':
      return getSlideDownStyle(animatedValue);
    case 'slideLeft':
      return getSlideLeftStyle(animatedValue);
    case 'slideRight':
      return getSlideRightStyle(animatedValue);
    case 'scale':
    case 'bounce':
    case 'elastic':
      return getScaleStyle(animatedValue);
    default:
      return getFadeInStyle(animatedValue);
  }
};

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fadeIn',
  duration = 600,
  delay = 0,
  style,
  onComplete,
  trigger = true,
}) => {
  const animatedValue = useAnimationValue(
    type,
    duration,
    delay,
    trigger,
    onComplete
  );

  return (
    <Animated.View style={[getAnimatedStyle(type, animatedValue), style]}>
      {children}
    </Animated.View>
  );
};

// Componente per liste animate
interface AnimatedListProps {
  readonly children: React.ReactNode[];
  readonly itemDelay?: number;
  readonly type?: TransitionType;
  readonly duration?: number;
  readonly startDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  itemDelay = 100,
  type = 'slideUp',
  duration = 600,
  startDelay = 0,
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => {
        const uniqueKey = `animated-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}-${index}`;
        return (
          <AnimatedTransition
            key={uniqueKey}
            type={type}
            duration={duration}
            delay={startDelay + index * itemDelay}
          >
            {child}
          </AnimatedTransition>
        );
      })}
    </>
  );
};

// Hook per animazioni programmatiche
export const useAnimatedValue = (initialValue = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animateTo = (
    toValue: number,
    callback?: () => void,
    duration = 300
  ) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(callback);
  };

  const springTo = (
    toValue: number,
    callback?: () => void,
    config = { tension: 100, friction: 8 }
  ) => {
    Animated.spring(animatedValue, {
      toValue,
      ...config,
      useNativeDriver: true,
    }).start(callback);
  };

  const pulse = (callback?: () => void, scale = 1.1, duration = 150) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: scale,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration,
        useNativeDriver: true,
      }),
    ]).start(callback);
  };

  return {
    value: animatedValue,
    animateTo,
    springTo,
    pulse,
  };
};

export default AnimatedTransition;
