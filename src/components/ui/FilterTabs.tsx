import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { TouchableRipple } from 'react-native-paper';
import { BorderRadius, Colors, PerfectSpacing, Typography, Shadows } from '../../shared/constants';
import { scale } from '../../shared/constants/perfectScale';
import { PerfectText } from './PerfectText';
import { PerfectContainer } from './PerfectContainer';

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

// Stili statici con Colors tokens interni
const styles = StyleSheet.create({
  container: {
    marginBottom: PerfectSpacing.base,
  },
  scrollView: {
    paddingHorizontal: PerfectSpacing.base,
  },
  scrollContent: {
    paddingRight: PerfectSpacing.base,
  },
  tabContainer: {
    marginRight: PerfectSpacing.md,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: PerfectSpacing.base,
    paddingVertical: PerfectSpacing.md,
    minHeight: scale(44),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderWidth: scale(1),
  },
  activeTab: {
    backgroundColor: Colors.primary[600],
    borderColor: Colors.primary[600],
    ...Shadows.sm,
  },
  inactiveTab: {
    backgroundColor: Colors.neutral[0],
    borderColor: Colors.neutral[200],
  },
  tabIcon: {
    marginRight: PerfectSpacing.sm,
  },
  tabLabel: {
    fontWeight: Typography.weights.semibold,
  },
  activeTabLabel: {
    color: Colors.neutral[0],
  },
  inactiveTabLabel: {
    color: Colors.neutral[900],
  },
  tabCount: {
    marginLeft: PerfectSpacing.sm,
    fontWeight: Typography.weights.bold,
    paddingHorizontal: PerfectSpacing.sm,
    paddingVertical: scale(1),
    borderRadius: BorderRadius.full,
    minWidth: scale(20),
    textAlign: 'center',
  },
  activeTabCount: {
    backgroundColor: Colors.neutral[0],
    color: Colors.primary[600],
  },
  inactiveTabCount: {
    backgroundColor: Colors.neutral[200],
    color: Colors.neutral[900],
  },
});

// Componente singolo tab
interface TabItemProps {
  tab: FilterTab;
  isActive: boolean;
  onPress: () => void;
  showCounts: boolean;
}

const TabItem: React.FC<TabItemProps> = React.memo(
  ({ tab, isActive, onPress, showCounts }) => (
  <PerfectContainer style={styles.tabContainer}>
    <TouchableRipple
      onPress={onPress}
      borderless
      rippleColor="transparent"
      style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
      accessible
      accessibilityRole="tab"
      accessibilityLabel={tab.label || 'Categoria senza nome'}
      accessibilityState={{
        selected: isActive,
      }}
    >
      <PerfectContainer style={styles.tabContent}>
        {tab.icon && (
          <PerfectText
            size={14}
            lines={1}
            fontWeight="400"
            style={[
              styles.tabIcon,
              isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
            ]}
          >
            {tab.icon}
          </PerfectText>
        )}

        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          style={[
            styles.tabLabel,
            isActive ? styles.activeTabLabel : styles.inactiveTabLabel,
          ]}
        >
          {tab.label}
        </PerfectText>

        {showCounts && tab.count !== undefined && (
          <PerfectText
            size={12}
            lines={1}
            fontWeight="400"
            style={[
              styles.tabCount,
              isActive ? styles.activeTabCount : styles.inactiveTabCount,
            ]}
          >
            {tab.count}
          </PerfectText>
        )}
      </PerfectContainer>
    </TouchableRipple>
  </PerfectContainer>
  )
);

TabItem.displayName = 'TabItem';

export const FilterTabs: React.FC<FilterTabsProps> = ({
  tabs,
  activeTab,
  onTabPress,
  showCounts = true,
}) => {

  const createTabPressHandler = useCallback(
    (tabId: string) => () => onTabPress(tabId),
    [onTabPress]
  );

  return (
    <PerfectContainer style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map(tab => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTab}
            onPress={createTabPressHandler(tab.id)}
            showCounts={showCounts}
          />
        ))}
      </ScrollView>
    </PerfectContainer>
  );
};

export default FilterTabs;
