import React, { useCallback, useMemo } from 'react';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';

import { BorderRadius, Spacing, Typography } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

import ProgressStat from './ProgressStat';
import SectionContainer from './SectionContainer';

interface HomeImpactSectionProps {
  onNavigateToImpatto: () => void;
  onSectionLayout?: (layout: LayoutRectangle) => void;
  isVisible: boolean;
}

// Extracted value formatter function
const formatValue = (value: number): string => {
  if (value >= 1000000 !== null) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000 !== null) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};

// Extracted styles function
const createImpactSectionStyles = (
  colors: ReturnType<typeof useTheme>['colors']
) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    // Tutti questi stili sono utilizzati nel componente ImpactStatsSection e nel componente principale
    // ma ESLint non riesce a rilevarlo perché vengono passati tramite props
    impactSection: {
      borderRadius: BorderRadius.lg,
      padding: Spacing[3],
      backgroundColor: colors.neutral[0],
      borderWidth: 1,
      borderColor: colors.neutral[100],
      shadowColor: colors.neutral[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
    },
    sectionTitlePrimary: {
      color: colors.primary[700],
      textAlign: 'center',
      marginBottom: Spacing[2],
      fontWeight: Typography.weights.bold,
      fontSize: Typography.sizes.xl,
      letterSpacing: -0.3,
      lineHeight: Typography.sizes.xl * 1.1,
    },
    statsContainer: {
      flexDirection: 'row',
      gap: Spacing[2],
      marginBottom: Spacing[3],
    },
    statsPage: {
      flex: 1,
      backgroundColor: colors.neutral[50],
      borderRadius: BorderRadius.md,
      padding: Spacing[2],
    },
    statsPageLeft: {
      marginRight: Spacing[1],
    },
    statsPageRight: {
      marginLeft: Spacing[1],
    },
    detailsButton: {
      alignSelf: 'center',
      paddingHorizontal: Spacing[4],
      height: 36,
    },
  });
/* eslint-enable react-native/no-unused-styles */

// Extracted stats section component
const ImpactStatsSection: React.FC<{
  colors: ReturnType<typeof useTheme>['colors'];
  styles: ReturnType<typeof createImpactSectionStyles>;
  isVisible: boolean;
}> = ({ colors, styles, isVisible }) => (
  <View style={styles.statsContainer}>
    <View style={[styles.statsPage, styles.statsPageLeft]}>
      <ProgressStat
        current={3100000}
        target={4000000}
        label="Pasti"
        sublabel="4M/2025"
        color={colors.primary[500]}
        size="compact"
        startAnimation={isVisible}
        formatter={formatValue}
        accessibilityLabel="Tre milioni di pasti distribuiti"
      />
    </View>

    <View style={[styles.statsPage, styles.statsPageRight]}>
      <ProgressStat
        current={13000}
        target={20000}
        label="Volontari"
        sublabel="20K target"
        color={colors.semantic.success.main}
        size="compact"
        startAnimation={isVisible}
        formatter={formatValue}
        accessibilityLabel="Tredicimila volontari attivi"
      />
    </View>
  </View>
);

export const HomeImpactSection: React.FC<HomeImpactSectionProps> = React.memo(
  ({ onNavigateToImpatto, onSectionLayout, isVisible }) => {
    const { colors } = useTheme();

    // Handler per layout event
    const handleLayout = useCallback(
      (event: LayoutChangeEvent) => {
        onSectionLayout?.(event.nativeEvent.layout);
      },
      [onSectionLayout]
    );

    // Handler per navigazione
    const handleNavigateToImpatto = useCallback(() => {
      onNavigateToImpatto();
    }, [onNavigateToImpatto]);

    // Memoize expensive style calculations
    const styles = useMemo(() => createImpactSectionStyles(colors), [colors]);

    return (
      <SectionContainer spacing="compact">
        <Surface
          style={styles.impactSection}
          elevation={1}
          onLayout={handleLayout}
          accessible
          accessibilityRole="summary"
          accessibilityLabel="Sezione impatto Rise Against Hunger Italia 2024"
        >
          <Text
            variant="displaySmall"
            style={styles.sectionTitlePrimary}
            accessible
            accessibilityRole="header"
          >
            📊 Impatto 2024
          </Text>

          <ImpactStatsSection
            colors={colors}
            styles={styles}
            isVisible={isVisible}
          />

          <Button
            mode="text"
            onPress={handleNavigateToImpatto}
            style={styles.detailsButton}
            labelStyle={{ fontSize: Typography.sizes.sm }}
            accessible
            accessibilityRole="button"
            accessibilityLabel="Vedi tutti i dettagli"
          >
            Dettagli
          </Button>
        </Surface>
      </SectionContainer>
    );
  }
);

HomeImpactSection.displayName = 'HomeImpactSection';

export default HomeImpactSection;
