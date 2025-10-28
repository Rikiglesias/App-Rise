import React, { useCallback } from 'react';
import { Platform, View, StyleSheet } from 'react-native';

import { TouchableRipple } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import {
  getAndroidMaterialProps,
  MaterialColors,
} from '../../shared/constants/materialDesignTokens';
import { PerfectText } from './PerfectText';

interface NavigationItem {
  key: string;
  title: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  badge?: number;
}

interface MaterialBottomNavigationProps {
  items: NavigationItem[];
  activeKey: string;
  onItemPress: (key: string) => void;
  variant?: 'primary' | 'surface';
  showLabels?: boolean;
}

/**
 * Material Design 3 Bottom Navigation
 * Android: implementa specifiche Material Design complete con ripple, elevation e motion
 * iOS: fallback al BottomTabNavigator esistente (zero cambiamenti)
 */
export const MaterialBottomNavigation: React.FC<
  MaterialBottomNavigationProps
> = ({
  items,
  activeKey,
  onItemPress,
  variant = 'surface',
  showLabels = true,
}) => {
  const insets = useSafeAreaInsets();
  const { buttonPress } = useHapticFeedback();

  const handleItemPress = useCallback(
    (key: string) => {
      void buttonPress();
      onItemPress(key);
    },
    [buttonPress, onItemPress]
  );

  // iOS: non renderizzare nulla (usa BottomTabNavigator esistente)
  if (Platform.OS === 'ios') {
    return null;
  }

  // Android: Material Design 3 Navigation Bar
  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor:
        variant === 'primary'
          ? MaterialColors.brand.primary
          : MaterialColors.surface.container,
      paddingBottom: Math.max(insets.bottom, 12),
      paddingTop: 12,
      paddingHorizontal: 8,
      ...getAndroidMaterialProps('level2'),
    };

    return baseStyle;
  };

  return (
    <View style={[styles.container, getContainerStyle()]}>
      <View style={styles.itemsContainer}>
        {items.map(item => (
          <MaterialNavigationItem
            key={item.key}
            item={item}
            isActive={item.key === activeKey}
            onItemPress={handleItemPress}
            variant={variant}
            showLabel={showLabels}
          />
        ))}
      </View>
    </View>
  );
};

interface MaterialNavigationItemProps {
  item: NavigationItem;
  isActive: boolean;
  onItemPress: (key: string) => void;
  variant: 'primary' | 'surface';
  showLabel: boolean;
}

const MaterialNavigationItem: React.FC<MaterialNavigationItemProps> = ({
  item,
  isActive,
  onItemPress,
  variant: _variant, // RINOMINATO: non utilizzato nella nuova logica di colori specifici
  showLabel,
}) => {
  // Rimosso: tutte le animazioni scale e indicator

  const handlePress = useCallback(() => {
    onItemPress(item.key);
  }, [onItemPress, item.key]);

  // COLORI SPECIFICI PER OGNI TAB - come iOS
  const getColors = () => {
    switch (item.key) {
      case 'ImpactTab':
        return {
          activeIcon: '#FFFFFF',
          inactiveIcon: '#DC2626',
          activeLabel: '#DC2626',
          inactiveLabel: '#DC2626',
          indicator: 'rgba(220, 38, 38, 0.12)',
          ripple: 'transparent',
          backgroundColor: '#DC2626', // ROSSO FISSO sempre
        };
      case 'InfoTab':
        return {
          activeIcon: '#FFFFFF',
          inactiveIcon: '#059669',
          activeLabel: '#059669',
          inactiveLabel: '#059669',
          indicator: 'rgba(5, 150, 105, 0.12)',
          ripple: 'transparent',
          backgroundColor: '#059669', // VERDE FISSO sempre
        };
      case 'HomeTab':
      default:
        return {
          activeIcon: '#FFFFFF',
          inactiveIcon: '#6B7280',
          activeLabel: '#6B7280',
          inactiveLabel: '#6B7280',
          indicator: 'rgba(107, 114, 128, 0.12)',
          ripple: 'transparent',
          backgroundColor: isActive ? '#6B7280' : '#FFFFFF', // GRIGIO quando attivo, BIANCO quando inattivo
        };
    }
  };

  const colors = getColors();

  // Rimosso: animazioni indicator
  const indicatorStyle = {
    backgroundColor: colors.backgroundColor, // USA IL COLORE SPECIFICO DEL TAB
    opacity: isActive ? 1 : 0,
    transform: [{ scaleX: isActive ? 1 : 0.6 }],
  };

  return (
    <View style={styles.itemContainer}>
      <TouchableRipple
        style={styles.itemTouchable}
        onPress={handlePress}
        rippleColor="transparent"
        borderless={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        accessibilityLabel={item.title}
      >
        <View style={styles.itemContent}>
          {/* Material Design 3 State Layer/Indicator */}
          <View style={[styles.stateIndicator, indicatorStyle]} />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={item.icon}
              size={24}
              color={isActive ? colors.activeIcon : colors.inactiveIcon}
            />
            {item.badge && item.badge > 0 && (
              <View style={styles.badge}>
                <PerfectText size={12} lines={1} style={styles.badgeText}>
                  {item.badge > 99 ? '99+' : item.badge.toString()}
                </PerfectText>
              </View>
            )}
          </View>

          {/* Label */}
          {showLabel && (
            <PerfectText
              size={14}
              lines={1}
              style={[
                styles.label,
                isActive ? styles.activeLabel : styles.inactiveLabel,
                { color: isActive ? colors.activeLabel : colors.inactiveLabel },
              ]}
            >
              {item.title}
            </PerfectText>
          )}
        </View>
      </TouchableRipple>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 0,
  },
  itemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  itemContainer: {
    flex: 1,
    maxWidth: 100,
    minHeight: 64,
  },
  itemTouchable: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  itemContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    position: 'relative',
  },
  stateIndicator: {
    position: 'absolute',
    top: 6,
    left: 12,
    right: 12,
    bottom: 6,
    borderRadius: 16,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: MaterialColors.brand.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  label: {
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
    letterSpacing: 0.5,
    fontFamily: 'Inter_500Medium',
  },
  activeLabel: {
    opacity: 1,
  },
  inactiveLabel: {
    opacity: 0.7,
  },
});

export default MaterialBottomNavigation;
