import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Platform-specific components
import {
  PlatformBlur,
  PlatformTouchable,
  FormattedText,
} from '../components/ui';

// Screens
import { ContributeTabScreen } from '../features/actions';
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
import { useResponsive } from '../shared/hooks';

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
  const { spacing, scale } = useResponsive();

  const tabContainerStyle = useMemo(
    () => [
      styles.tabBarContainer,
      {
        bottom: Math.max(insets.bottom, spacing[4]),
        height: scale(95),
        left: spacing[6],
        right: spacing[6],
        borderRadius: scale(32),
      },
    ],
    [insets.bottom, spacing, scale]
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
  const { scale } = useResponsive();
  // Rimosso: animazioni button container
  const buttonContainerStyle = {
    transform: [{ translateY: isCentral && isFocused ? -18 : 0 }],
  };

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

  // Rimosso: animazioni icon e label
  const iconContainerStyle = {
    transform: [{ scale: isFocused ? 1 : 0.9 }],
    shadowOpacity: isFocused ? 0.3 : 0.05,
  };

  const labelStyle = {
    opacity: isFocused ? 1 : 0,
    transform: [{ translateY: isFocused ? 0 : 5 }],
  };

  const iconName = ICON_MAP[routeName] ?? 'circle';
  const iconSize = isCentral ? scale(32) : scale(26);

  return (
    <View style={[styles.buttonContainer, buttonContainerStyle]}>
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
          <View
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
          </View>
          <View style={labelStyle}>
            <FormattedText
              variant="body-large"
              style={[styles.labelText, { color: tabColors.labelColor }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {options.tabBarAccessibilityLabel?.split(' ')[0]}
            </FormattedText>
          </View>
        </View>
      </PlatformTouchable>
    </View>
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
    // Dynamic values moved to tabContainerStyle
    ...Shadows.lg,
    shadowColor: Colors.neutral[900],
    shadowOpacity: 0.1,
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
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing[1],
    textAlign: 'center',
    maxWidth: 80, // AUMENTATO: da 60 a 80 per contenere "Impatto" completo
  },
});

export default BottomTabNavigator;
