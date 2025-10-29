import React, { useCallback } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { TouchableRipple } from 'react-native-paper';
import { BorderRadius, Spacing, Typography } from '../../shared/constants';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
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
      marginRight: Spacing[2],
    },
    tabLabel: {
      fontSize: TypographyTokens.styles.body.small,
      fontWeight: Typography.weights.semibold,
    },
    activeTabLabel: { color: colors.card },
    inactiveTabLabel: { color: colors.text },
    tabCount: {
      marginLeft: Spacing[2],
      fontSize: TypographyTokens.styles.label.small,
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
  <PerfectContainer style={styles.tabContainer}>
    <TouchableRipple
      onPress={onPress}
      borderless
      rippleColor="transparent"
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
            styles={styles}
          />
        ))}
      </ScrollView>
    </PerfectContainer>
  );
};

export default FilterTabs;
