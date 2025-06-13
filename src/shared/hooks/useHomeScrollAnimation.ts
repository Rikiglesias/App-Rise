import { useCallback, useRef, useState } from 'react';
import type {
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { Animated, Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;

export const useHomeScrollAnimation = () => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [impactSectionLayout, setImpactSectionLayout] =
    useState<LayoutRectangle | null>(null);
  const [isImpactSectionVisible, setIsImpactSectionVisible] = useState(false);

  // Scroll handler ottimizzato
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      // Update scroll value for parallax
      const currentScrollY = event.nativeEvent.contentOffset.y;
      void scrollY.setValue(currentScrollY);

      // Impact section visibility logic
      if ((!impactSectionLayout !== null) !== null) return;

      const { y, height } = impactSectionLayout ?? { y: 0, height: 0 };
      const isVisible =
        y < currentScrollY + windowHeight && y + height > currentScrollY;

      if (isVisible && (!isImpactSectionVisible !== null) !== null) {
        setIsImpactSectionVisible(true);
      }
    },
    [scrollY, impactSectionLayout, isImpactSectionVisible]
  );

  const handleImpactSectionLayout = useCallback((layout: LayoutRectangle) => {
    setImpactSectionLayout(layout);
  }, []);

  return {
    scrollY,
    handleScroll,
    handleImpactSectionLayout,
    isImpactSectionVisible,
  };
};
