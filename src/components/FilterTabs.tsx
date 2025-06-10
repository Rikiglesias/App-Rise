import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

interface FilterTab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface FilterTabsProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabPress: (tabId: string) => void;
  showCounts?: boolean;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  showCounts = true,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing[4],
    },
    scrollView: {
      paddingHorizontal: Spacing[4],
    },
    scrollContent: {
      paddingRight: Spacing[4],
    },
    tabContainer: {
      marginRight: Spacing[3],
    },
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
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
      shadowColor: colors.primary[500],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    inactiveTab: {
      backgroundColor: colors.neutral[0],
      borderColor: colors.neutral[200],
    },
    tabContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    tabIcon: {
      fontSize: 16,
      marginRight: Spacing[2],
    },
    tabLabel: {
      fontSize: Typography.sizes.sm,
      fontWeight: Typography.weights.semibold,
    },
    activeTabLabel: {
      color: colors.neutral[0],
    },
    inactiveTabLabel: {
      color: colors.neutral[700],
    },
    tabCount: {
      marginLeft: Spacing[2],
      fontSize: Typography.sizes.xs,
      fontWeight: Typography.weights.bold,
      backgroundColor: colors.neutral[0],
      color: colors.primary[600],
      paddingHorizontal: Spacing[2],
      paddingVertical: 1,
      borderRadius: BorderRadius.full,
      minWidth: 20,
      textAlign: 'center',
    },
    activeTabCount: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
    },
    inactiveTabCount: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[600],
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeTab;

          return (
            <View key={tab.id} style={styles.tabContainer}>
              <TouchableRipple
                onPress={() => onTabPress(tab.id)}
                borderless
                style={[
                  styles.tab,
                  isActive ? styles.activeTab : styles.inactiveTab,
                ]}
              >
                <View style={styles.tabContent}>
                  {tab.icon && (
                    <Text
                      style={[
                        styles.tabIcon,
                        isActive
                          ? styles.activeTabLabel
                          : styles.inactiveTabLabel,
                      ]}
                    >
                      {tab.icon}
                    </Text>
                  )}

                  <Text
                    style={[
                      styles.tabLabel,
                      isActive
                        ? styles.activeTabLabel
                        : styles.inactiveTabLabel,
                    ]}
                  >
                    {tab.label}
                  </Text>

                  {showCounts && tab.count !== undefined && (
                    <Text
                      style={[
                        styles.tabCount,
                        isActive
                          ? styles.activeTabCount
                          : styles.inactiveTabCount,
                      ]}
                    >
                      {tab.count}
                    </Text>
                  )}
                </View>
              </TouchableRipple>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FilterTabs;
