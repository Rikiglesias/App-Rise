import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Platform-specific components
import { PlatformBlur, PlatformTouchable } from '../components/ui';

// Screens
import { ContributeTabScreen } from '../screens/ContributeTabScreen';
import { HomeScreen } from '../features/home';
import ImpactStackNavigator from './ImpactStackNavigator';

// Design Tokens & Hooks
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../shared/constants/designTokens';

import type { BottomTabParamList } from './types';

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

const AdvancedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();

  const tabContainerStyle = useMemo(
    () => [
      styles.tabBarContainer,
      {
        bottom: Math.max(insets.bottom, Spacing[4]),
      },
    ],
    [insets.bottom]
  );

  return (
    <View style={tabContainerStyle}>
      <PlatformBlur intensity={90} tint="light" style={styles.blurView} />
      <View style={styles.tabBarContent}>
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
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
      </View>
    </View>
  );
};

// =================================================================
// ✨ ADVANCED TAB BUTTON COMPONENT
// =================================================================

const ICON_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  ImpactTab: 'chart-line', // CAMBIATO: da 'chart-donut' a 'chart-line' - stessa icona del bottone impatto
  HomeTab: 'home',
  InfoTab: 'hand-heart',
};

const AdvancedTabButton: React.FC<TabButtonProps> = ({
  isFocused,
  isCentral,
  options,
  onPress,
  onLongPress,
  routeName,
}) => {
  const buttonContainerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(isCentral && isFocused ? -18 : 0, {
          damping: 15,
        }),
      },
    ],
  }));

  // COLORI STATICI - CALCOLO DIRETTO SENZA ANIMAZIONI (risolve bug timing)
  const getTabColors = () => {
    switch (routeName) {
      case 'ImpactTab':
        return {
          backgroundColor: '#DC2626', // ROSSO FISSO sempre
          shadowColor: '#DC2626',
          iconColor: Colors.neutral[0], // Bianco sempre
          labelColor: '#DC2626',
        };
      case 'InfoTab':
        return {
          backgroundColor: '#059669', // VERDE FISSO sempre
          shadowColor: '#059669',
          iconColor: Colors.neutral[0], // Bianco sempre
          labelColor: '#059669',
        };
      case 'HomeTab':
      default:
        return {
          backgroundColor: isFocused ? '#6B7280' : '#FFFFFF', // GRIGIO quando attivo, BIANCO quando inattivo
          shadowColor: '#6B7280',
          iconColor: isFocused ? Colors.neutral[0] : Colors.neutral[700],
          labelColor: '#6B7280',
        };
    }
  };

  const tabColors = getTabColors();

  // ANIMAZIONI SOLO PER SCALA E OPACITY (non per colori)
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(isFocused ? 1 : 0.9, { mass: 0.5 }) }],
    shadowOpacity: withTiming(isFocused ? 0.3 : 0.05),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0),
    transform: [{ translateY: withTiming(isFocused ? 0 : 5) }],
  }));

  const iconName = ICON_MAP[routeName] ?? 'circle';
  const iconSize = isCentral ? 32 : 26;

  return (
    <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
      <PlatformTouchable
        activeOpacity={0.7}
        rippleColor="transparent"
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        onLongPress={onLongPress}
        style={styles.touchable}
      >
        <View style={styles.touchableContent}>
          <Animated.View
            style={[
              isCentral ? styles.centralIconContainer : styles.iconContainer,
              iconContainerStyle,
              {
                backgroundColor: tabColors.backgroundColor,
                shadowColor: tabColors.shadowColor,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={iconName}
              size={iconSize}
              color={tabColors.iconColor}
            />
          </Animated.View>
          <Animated.Text
            style={[
              styles.labelText,
              labelStyle,
              { color: tabColors.labelColor },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {options.tabBarAccessibilityLabel?.split(' ')[0]}
          </Animated.Text>
        </View>
      </PlatformTouchable>
    </Animated.View>
  );
};

// =================================================================
// 🚀 MAIN NAVIGATOR
// =================================================================

const renderTabBar = (props: BottomTabBarProps) => (
  <AdvancedTabBar {...props} />
);

const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    initialRouteName="HomeTab"
    screenOptions={{ headerShown: false }}
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
    left: Spacing[6],
    right: Spacing[6],
    height: 95, // AUMENTATO: da 85 a 95 per spazio animazione icona Home
    borderRadius: BorderRadius['3xl'],
    ...Shadows.lg,
    shadowColor: Colors.neutral[900],
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius['3xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // AGGIUNTO: leggero tint per evitare artefatti
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[2],
  },
  // --- Tab Button ---
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    minHeight: 80, // AUMENTATO: da 70 a 80 per spazio animazione
  },
  touchable: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing[2],
    width: '100%',
    minHeight: 80, // AUMENTATO: da 70 a 80 per spazio animazione
  },
  touchableContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  // --- Icon ---
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  centralIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2, // RIDOTTO: da 4 a 2 per bordo più sottile
    borderColor: 'rgba(255, 255, 255, 0.9)', // SEMI-TRASPARENTE: meno visibile ma presente
    ...Shadows.xl,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  // --- Label ---
  labelText: {
    fontSize: Typography.sizes.sm, // INGRANDITO: da xs a sm per maggiore leggibilità
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing[1],
    textAlign: 'center',
    maxWidth: 60,
  },
});

export default BottomTabNavigator;
