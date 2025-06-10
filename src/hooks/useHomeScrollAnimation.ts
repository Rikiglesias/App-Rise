import { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';

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
      scrollY.setValue(currentScrollY);

      // Impact section visibility logic
      if (!impactSectionLayout) return;

      const { y, height } = impactSectionLayout;
      const isVisible =
        y < currentScrollY + windowHeight && y + height > currentScrollY;

      if (isVisible && !isImpactSectionVisible) {
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
