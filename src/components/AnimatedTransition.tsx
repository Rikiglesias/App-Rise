import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

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
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onComplete?: () => void;
  trigger?: boolean; // Per ri-attivare l'animazione
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fadeIn',
  duration = 600,
  delay = 0,
  style,
  onComplete,
  trigger = true,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (trigger) {
      const startAnimation = () => {
        animatedValue.setValue(0);

        const animation = getAnimation(type, animatedValue, duration);

        animation.start(() => {
          onComplete?.();
        });
      };

      if (delay > 0) {
        setTimeout(startAnimation, delay);
      } else {
        startAnimation();
      }
    }
  }, [trigger, type, duration, delay, animatedValue, onComplete]);

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

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fadeIn':
        return {
          opacity: animatedValue,
        };
      case 'slideUp':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'slideDown':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateY: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'slideLeft':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      case 'slideRight':
        return {
          opacity: animatedValue,
          transform: [
            {
              translateX: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            },
          ],
        };
      case 'scale':
      case 'bounce':
      case 'elastic':
        return {
          opacity: animatedValue,
          transform: [
            {
              scale: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        };
      default:
        return {
          opacity: animatedValue,
        };
    }
  };

  return (
    <Animated.View style={[getAnimatedStyle(), style]}>
      {children}
    </Animated.View>
  );
};

// Componente per liste animate
interface AnimatedListProps {
  children: React.ReactNode[];
  itemDelay?: number;
  type?: TransitionType;
  duration?: number;
  startDelay?: number;
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
      {React.Children.map(children, (child, index) => (
        <AnimatedTransition
          key={index}
          type={type}
          duration={duration}
          delay={startDelay + index * itemDelay}
        >
          {child}
        </AnimatedTransition>
      ))}
    </>
  );
};

// Hook per animazioni programmatiche
export const useAnimatedValue = (initialValue = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animateTo = (
    toValue: number,
    duration = 300,
    callback?: () => void
  ) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      useNativeDriver: true,
    }).start(callback);
  };

  const springTo = (
    toValue: number,
    config = { tension: 100, friction: 8 },
    callback?: () => void
  ) => {
    Animated.spring(animatedValue, {
      toValue,
      ...config,
      useNativeDriver: true,
    }).start(callback);
  };

  const pulse = (scale = 1.1, duration = 150, callback?: () => void) => {
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
