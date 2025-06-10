import React, { useMemo } from 'react';
import { LayoutRectangle, StyleSheet, View } from 'react-native';
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

export const HomeImpactSection: React.FC<HomeImpactSectionProps> = React.memo(
  ({ onNavigateToImpatto, onSectionLayout, isVisible }) => {
    const { colors } = useTheme();

    // Memoize expensive style calculations
    const styles = useMemo(
      () =>
        StyleSheet.create({
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
        }),
      [colors]
    );

    const formatValue = useMemo(
      () => (value: number) => {
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(1)}M`;
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
      },
      []
    );

    return (
      <SectionContainer spacing="compact">
        <Surface
          style={styles.impactSection}
          elevation={1}
          onLayout={event => {
            if (onSectionLayout) {
              onSectionLayout(event.nativeEvent.layout);
            }
          }}
          accessible={true}
          accessibilityRole="summary"
          accessibilityLabel="Sezione impatto Rise Against Hunger Italia 2024"
        >
          <Text
            variant="displaySmall"
            style={styles.sectionTitlePrimary}
            accessible={true}
            accessibilityRole="header"
          >
            📊 Impatto 2024
          </Text>

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

          <Button
            mode="text"
            onPress={onNavigateToImpatto}
            style={styles.detailsButton}
            labelStyle={{ fontSize: Typography.sizes.sm }}
            accessible={true}
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
