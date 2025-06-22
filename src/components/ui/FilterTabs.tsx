import { useTheme } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { PlatformScrollView } from './PlatformComponents';
import { Text, TouchableRipple } from 'react-native-paper';
import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';

interface FilterTab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface FilterTabsProps {
  readonly tabs: FilterTab[];
  readonly activeTab: string;
  readonly onTabPress: (tabId: string) => void;
  readonly showCounts?: boolean;
}

// Stili di layout base
const createBaseStyles = () =>
  StyleSheet.create({
    container: { marginBottom: Spacing[4] },
    scrollView: { paddingHorizontal: Spacing[4] },
    scrollContent: { paddingRight: Spacing[4] },
    tabContainer: { marginRight: Spacing[3] },
    tabContent: { flexDirection: 'row', alignItems: 'center' },
  });

// Stili con colori dinamici - tipizzazione corretta
/* eslint-disable react-native/no-unused-styles */
const createColorStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente TabItem
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    tab: {
      borderRadius: BorderRadius.full,
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[3],
      minHeight: 44,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      borderWidth: 1,
    },
    activeTab: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    inactiveTab: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    tabIcon: {
      fontSize: 16,
      marginRight: Spacing[2],
    },
    tabLabel: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.semibold,
    },
    activeTabLabel: { color: colors.card },
    inactiveTabLabel: { color: colors.text },
    tabCount: {
      marginLeft: Spacing[2],
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      backgroundColor: colors.card,
      color: colors.primary,
      paddingHorizontal: Spacing[2],
      paddingVertical: 1,
      borderRadius: BorderRadius.full,
      minWidth: 20,
      textAlign: 'center',
    },
    activeTabCount: {
      backgroundColor: colors.card,
      color: colors.primary,
    },
    inactiveTabCount: {
      backgroundColor: colors.border,
      color: colors.text,
    },
    shadowContainer: {
      shadowColor: colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
  });
/* eslint-enable react-native/no-unused-styles */

// Hook combinato
const useTabStyles = () => {
  const { colors } = useTheme();
  const baseStyles = createBaseStyles();
  const colorStyles = createColorStyles(colors);

  return { ...baseStyles, ...colorStyles };
};

// Componente singolo tab
interface TabItemProps {
  tab: FilterTab;
  isActive: boolean;
  onPress: () => void;
  showCounts: boolean;
  styles: ReturnType<typeof useTabStyles>;
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isActive,
  onPress,
  showCounts,
  styles,
}) => (
  <View style={styles.tabContainer}>
    <TouchableRipple
      onPress={onPress}
      borderless
      style={[
        styles.tab,
        isActive ? styles.activeTab : styles.inactiveTab,
        styles.shadowContainer,
      ]}
      accessible
      accessibilityRole="tab"
      accessibilityLabel={tab.label || 'Categoria senza nome'}
      accessibilityState={{
        selected: isActive,
      }}
    >
      <View style={styles.tabContent}>
        {tab.icon && (
          <Text
            style={[
              styles.tabIcon,
              isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {tab.icon}
          </Text>
        )}

        <Text
          style={[
            styles.tabLabel,
            isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          {tab.label}
        </Text>

        {showCounts && tab.count !== undefined && (
          <Text
            style={[
              styles.tabCount,
              isActive ? styles.activeTabCount : styles.inactiveTabCount,
            ]}
          >
            {tab.count}
          </Text>
        )}
      </View>
    </TouchableRipple>
  </View>
);

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  showCounts = true,
}) => {
  const styles = useTabStyles();

  const createTabPressHandler = useCallback(
    (tabId: string) => () => onTabPress(tabId),
    [onTabPress]
  );

  return (
    <View style={styles.container}>
      <PlatformScrollView>
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onPress={createTabPressHandler(tab.id)}
            showCounts={showCounts}
            styles={styles}
          />
        ))}
      </PlatformScrollView>
    </View>
  );
};

export default FilterTabs;
