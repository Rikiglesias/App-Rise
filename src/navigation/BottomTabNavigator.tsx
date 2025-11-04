import React, { useMemo } from 'react';
import { Platform, StyleSheet, PixelRatio } from 'react-native';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import type { BottomTabParamList } from './types';
import ImpactStackNavigator from './ImpactStackNavigator';
import {
  PerfectIcon,
  PlatformBlur,
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '@/components/ui';

// Design Tokens & Hooks
import {
  BorderRadius,
  Colors,
  Typography,
} from '@/shared/constants/designTokens';
import { getPerfectShadow } from '@/shared/constants/perfectShadow';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

// Lazy Screens (only for HomeScreen due to export issues)
// Direct imports (no lazy loading to avoid spinner)
import { ContributeTabScreen } from '@/features/actions';
import HomeScreen from '@/features/home/screens/HomeScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

// =================================================================
// 🎯 TYPES
// =================================================================

interface TabButtonProps {
  isFocused: boolean;
  isCentral: boolean;
  options: {
    tabBarAccessibilityLabel?: string;
  };
  onPress: () => void;
  onLongPress: () => void;
  routeName: string;
}

// =================================================================
// 🎨 ADVANCED TAB BAR COMPONENT
// =================================================================

const AdvancedTabBarComponent: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const tabContainerStyle = useMemo(() => {
    const radius = scale(32);
    const extra =
      (Constants.expoConfig?.extra as Record<string, unknown> | undefined) ??
      (Updates as unknown as { manifest?: { extra?: Record<string, unknown> } })
        .manifest?.extra;
    const unlock = (() => {
      const v = extra?.['fontScaleUnlockThreshold'] as number | undefined;
      return typeof v === 'number' && isFinite(v) && v > 0 ? v : 1.3;
    })();
    const fontScale = PixelRatio.getFontScale();
    const isHighZoom = fontScale > unlock;
    const baseHeight = scale(95);
    const highZoomHeight = scale(136);
    return [
      styles.tabBarContainer,
      {
        bottom: Math.max(insets.bottom, PerfectSpacing.base),
        height: isHighZoom ? highZoomHeight : baseHeight,
        left: PerfectSpacing.lg,
        right: PerfectSpacing.lg,
        borderRadius: radius,
        overflow: 'hidden' as const,
      },
    ];
  }, [insets.bottom]);

  const blurBackground = Platform.select({
    ios: 'rgba(255, 255, 255, 0.35)',
    android: 'rgba(255, 255, 255, 0.97)',
    default: 'rgba(255, 255, 255, 0.97)',
  });

  return (
    <PerfectContainer style={tabContainerStyle}>
      <PlatformBlur
        intensity={90}
        tint="light"
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
            <AdvancedTabButton
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

const AdvancedTabBar = React.memo(AdvancedTabBarComponent);

// =================================================================
// ✨ ADVANCED TAB BUTTON COMPONENT
// =================================================================

const ICON_MAP: Record<string, string> = {
  ImpactTab: 'chart-line',
  HomeTab: 'home',
  InfoTab: 'hand-heart',
};

// Helper tipizzato per ottenere il threshold
const getFontScaleThreshold = (): number => {
  const expoExtra = Constants.expoConfig?.extra as
    | Record<string, unknown>
    | undefined;
  const updatesExtra = (
    Updates as unknown as { manifest?: { extra?: Record<string, unknown> } }
  ).manifest?.extra;

  return (
    (expoExtra?.fontScaleUnlockThreshold as number | undefined) ??
    (updatesExtra?.fontScaleUnlockThreshold as number | undefined) ??
    1.3
  );
};

const AdvancedTabButtonComponent: React.FC<TabButtonProps> = ({
  isFocused,
  isCentral,
  options,
  onPress,
  onLongPress,
  routeName,
}) => {
  const fontScale = PixelRatio.getFontScale();
  const threshold = getFontScaleThreshold();
  const isLargeFontScale = fontScale > threshold;
  const tabColors = useMemo(() => {
    switch (routeName) {
      case 'ImpactTab':
        return {
          backgroundColor: Colors.primary[500],
          shadowColor: Colors.primary[500],
          iconColor: Colors.neutral[0],
          labelColor: Colors.primary[500],
        };
      case 'InfoTab':
        return {
          backgroundColor: Colors.semantic.success.main,
          shadowColor: Colors.semantic.success.main,
          iconColor: Colors.neutral[0],
          labelColor: Colors.semantic.success.main,
        };
      case 'HomeTab':
      default:
        return {
          backgroundColor: isFocused ? Colors.neutral[500] : Colors.neutral[0],
          shadowColor: Colors.neutral[500],
          iconColor: isFocused ? Colors.neutral[0] : Colors.neutral[700],
          labelColor: Colors.neutral[500],
        };
    }
  }, [routeName, isFocused]);

  const iconName = useMemo(() => ICON_MAP[routeName] ?? 'circle', [routeName]);
  const iconSize = useMemo(
    () => (isCentral ? scale(32) : scale(26)),
    [isCentral]
  );

  return (
    <PerfectContainer
      style={[
        styles.buttonContainer,
        ...(isLargeFontScale ? [{ minHeight: scale(96) }] : []),
      ]}
    >
      <PlatformTouchable
        activeOpacity={0.7}
        rippleColor="transparent"
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[
          styles.touchable,
          ...(isLargeFontScale ? [{ minHeight: scale(96) }] : []),
        ]}
      >
        <PerfectContainer style={styles.touchableContent}>
          <PerfectContainer
            style={[
              isCentral ? styles.centralIconContainer : styles.iconContainer,
              {
                backgroundColor: tabColors.backgroundColor,
                shadowColor: tabColors.shadowColor,
              },
            ]}
          >
            <PerfectIcon
              name={iconName}
              size={iconSize}
              color={tabColors.iconColor}
            />
          </PerfectContainer>
          <PerfectContainer>
            <PerfectText
              size={16}
              lines={1}
              color={tabColors.labelColor}
              style={[
                styles.labelText,
                ...(isLargeFontScale ? [{ maxWidth: scale(96) }] : []),
              ]}
            >
              {options.tabBarAccessibilityLabel?.split(' ')[0] ?? 'Tab'}
            </PerfectText>
          </PerfectContainer>
        </PerfectContainer>
      </PlatformTouchable>
    </PerfectContainer>
  );
};

const AdvancedTabButton = React.memo(AdvancedTabButtonComponent);

// Export per testing
export { AdvancedTabButton, AdvancedTabButtonComponent };

// =================================================================
// 🚀 MAIN NAVIGATOR
// =================================================================

const renderTabBar = (props: BottomTabBarProps) => (
  <AdvancedTabBar {...props} />
);

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="HomeTab"
    screenOptions={{
      headerShown: false,
      lazy: true, // Lazy loading: migliora cold start; preloading mirato se serve
    }}
    tabBar={renderTabBar}
  >
    <Tab.Screen
      name="ImpactTab"
      component={ImpactStackNavigator}
      options={{
        tabBarAccessibilityLabel: 'Impatto Globale',
      }}
    />
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{
        tabBarAccessibilityLabel: 'Home Principale',
      }}
    />
    <Tab.Screen
      name="InfoTab"
      component={ContributeTabScreen}
      options={{
        tabBarAccessibilityLabel: 'Azioni Utili',
      }}
    />
  </Tab.Navigator>
);

// =================================================================
// 🎨 MODERN STYLES
// =================================================================

const styles = StyleSheet.create({
  // --- Tab Bar ---
  tabBarContainer: {
    position: 'absolute',
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
  // --- Tab Button ---
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    minHeight: scale(80),
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: PerfectSpacing.sm,
    width: '100%',
    minHeight: scale(80),
  },
  touchableContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // --- Icon ---
  iconContainer: {
    width: scale(52),
    height: scale(52),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...getPerfectShadow('medium'),
    elevation: scale(8),
  },
  centralIconContainer: {
    width: scale(64),
    height: scale(64),
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: scale(2),
    borderColor: Colors.neutral[0],
    ...getPerfectShadow('strong'),
    elevation: scale(12),
  },
  // --- Label ---
  labelText: {
    fontWeight: Typography.weights.semibold,
    marginTop: PerfectSpacing.xs,
    textAlign: 'center',
    maxWidth: scale(80),
  },
});

export default BottomTabNavigator;
