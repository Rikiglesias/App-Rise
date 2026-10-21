import React, {
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import {
  Platform,
  StyleSheet,
  PixelRatio,
  useWindowDimensions,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomTabBarProps,
  BottomTabBarHeightCallbackContext,
} from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { tabBarHeight } from './tabBarLayout';
import { TabBarButton } from './TabBarButton';
import { PlatformBlur, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';
import { useUniversalTheme } from '@/shared/theme/UniversalTheme';

const TabBarComponent: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const window = useWindowDimensions();
  const { isDark } = useUniversalTheme();
  const onHeightChange = useContext(BottomTabBarHeightCallbackContext);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const bottomOffset = Math.max(insets.bottom, PerfectSpacing.base);
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setMeasuredHeight(event.nativeEvent.layout.height);
  }, []);

  // Il navigator deve conoscere tutto lo spazio occupato dalla barra flottante,
  // inclusa la distanza dal bordo sicuro, anche dopo rotazione/zoom.
  useLayoutEffect(() => {
    if (measuredHeight > 0) onHeightChange?.(measuredHeight + bottomOffset);
  }, [measuredHeight, bottomOffset, onHeightChange]);

  // Alta quanto il contenuto alla scala del testo di adesso: cresce con l'etichetta (C44).
  const height = tabBarHeight(PixelRatio.getFontScale(), window);

  const blurBackground = isDark
    ? Platform.select({
        ios: 'rgba(28, 28, 30, 0.55)',
        android: 'rgba(20, 20, 22, 0.97)',
        default: 'rgba(20, 20, 22, 0.97)',
      })
    : Platform.select({
        ios: 'rgba(255, 255, 255, 0.35)',
        android: 'rgba(255, 255, 255, 0.97)',
        default: 'rgba(255, 255, 255, 0.97)',
      });

  return (
    <PerfectContainer
      style={[styles.tabBarContainer, { bottom: bottomOffset, height }]}
      onLayout={handleLayout}
      testID="bottom-tab-bar"
    >
      <PlatformBlur
        intensity={90}
        tint={isDark ? 'dark' : 'light'}
        backgroundColor={blurBackground}
        style={styles.blurView}
      />
      <PerfectContainer style={styles.tabBarContent}>
        {state.routes.map((route, index: number) => {
          const descriptor = descriptors[route.key];
          if (!descriptor) return null;

          const { options } = descriptor;
          const isFocused = state.index === index;
          const isCentral = route.name === 'HomeTab';

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
              void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabBarButton
              key={route.key}
              isFocused={isFocused}
              isCentral={isCentral}
              options={options}
              onPress={onPress}
              onLongPress={onLongPress}
              routeName={route.name}
            />
          );
        })}
      </PerfectContainer>
    </PerfectContainer>
  );
};

export const TabBar = React.memo(TabBarComponent);

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    left: PerfectSpacing.lg,
    right: PerfectSpacing.lg,
    borderRadius: scale(32),
    overflow: 'hidden',
    ...getPerfectShadow('strong'),
    shadowColor: Colors.neutral[900],
    shadowOpacity: 0.1,
    elevation: scale(10),
    borderWidth: scale(1),
    borderColor: Colors.neutral[200],
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: PerfectSpacing.sm,
    paddingVertical: PerfectSpacing.sm,
  },
});
