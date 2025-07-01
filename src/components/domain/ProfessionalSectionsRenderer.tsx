import React from 'react';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { PlatformTouchable } from '../ui';
import { useProfessionalTokens } from '../../features/actions/hooks/useProfessionalTokens';
import { useResponsive } from '../../shared/hooks/useResponsive';
import {
  BorderRadius,
  Shadows,
  Spacing,
} from '../../shared/constants/designTokens';
import type {
  CategorySection,
  InfoAction,
} from '../../features/actions/types/ContributeScreenTypes';

interface ProfessionalSectionsRendererProps {
  sections: CategorySection[];
  contentReveal: Animated.Value;
  onActionPress: (action: InfoAction) => void;
}

export const ProfessionalSectionsRenderer: React.FC<
  ProfessionalSectionsRendererProps
> = ({ sections, contentReveal, onActionPress }) => {
  const { professionalColors, professionalTypography } =
    useProfessionalTokens();
  const { scaleFont } = useResponsive();

  const handleActionPress = (action: InfoAction) => () => {
    onActionPress(action);
  };

  const styles = StyleSheet.create({
    sectionsContainer: {
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[6],
      paddingBottom: Spacing[8],
    },
    section: {
      marginBottom: Spacing[6],
    },
    sectionHeader: {
      marginBottom: Spacing[5],
      paddingHorizontal: Spacing[2],
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing[2],
    },
    sectionTitleGroup: {
      flex: 1,
    },
    sectionTitle: {
      fontSize: professionalTypography.headline.fontSize,
      fontWeight: professionalTypography.headline.fontWeight,
      color: professionalColors.text.primary,
      letterSpacing: professionalTypography.headline.letterSpacing,
      lineHeight: professionalTypography.headline.lineHeight,
      marginBottom: Spacing[1],
    },
    sectionSubtitle: {
      fontSize: professionalTypography.caption.fontSize,
      fontWeight: professionalTypography.caption.fontWeight,
      color: professionalColors.text.tertiary,
      letterSpacing: professionalTypography.caption.letterSpacing,
    },
    actionsGrid: {
      gap: Spacing[3],
    },
    actionCard: {
      backgroundColor: professionalColors.surface.primary,
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      borderColor: professionalColors.border.light,
      overflow: 'hidden',
      ...Shadows.sm,
      shadowOpacity: 0.05,
      elevation: 2,
    },
    actionCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Spacing[4],
    },
    actionIconContainer: {
      width: 50,
      height: 50,
      borderRadius: BorderRadius.lg,
      backgroundColor: professionalColors.surface.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 1,
    },
    actionIconText: {},
    actionTextContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: professionalTypography.title.fontSize,
      fontWeight: professionalTypography.title.fontWeight,
      color: professionalColors.text.primary,
      letterSpacing: professionalTypography.title.letterSpacing,
      lineHeight: professionalTypography.title.lineHeight,
      marginBottom: Spacing[1],
    },
    actionSubtitle: {
      fontSize: professionalTypography.caption.fontSize,
      fontWeight: professionalTypography.caption.fontWeight,
      color: professionalColors.text.tertiary,
      letterSpacing: professionalTypography.caption.letterSpacing,
      lineHeight: professionalTypography.caption.lineHeight,
    },
    actionArrow: {
      padding: Spacing[2],
    },
    arrowIcon: {
      color: professionalColors.text.tertiary,
      fontWeight: '600',
    },
  });

  return (
    <Animated.View
      style={[
        styles.sectionsContainer,
        {
          opacity: contentReveal,
          transform: [
            {
              translateY: contentReveal.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
    >
      {sections.map((section, sectionIndex) => (
        <Animated.View
          key={section.id}
          style={[
            styles.section,
            {
              opacity: contentReveal,
              transform: [
                {
                  translateY: contentReveal.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20 + sectionIndex * 10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleGroup}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsGrid}>
            {section.actions.map(action => (
              <PlatformTouchable
                key={action.id}
                style={styles.actionCard}
                onPress={handleActionPress(action)}
                activeOpacity={0.7}
              >
                <View style={styles.actionCardContent}>
                  <View style={styles.actionIconContainer}>
                    <Text
                      style={[
                        { fontSize: scaleFont(22) },
                        styles.actionIconText,
                      ]}
                    >
                      {action.icon}
                    </Text>
                  </View>
                  <View style={styles.actionTextContent}>
                    <Text style={styles.actionTitle}>{action.title}</Text>
                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                  </View>
                  <View style={styles.actionArrow}>
                    <Text
                      style={[{ fontSize: scaleFont(16) }, styles.arrowIcon]}
                    >
                      →
                    </Text>
                  </View>
                </View>
              </PlatformTouchable>
            ))}
          </View>
        </Animated.View>
      ))}
    </Animated.View>
  );
};
