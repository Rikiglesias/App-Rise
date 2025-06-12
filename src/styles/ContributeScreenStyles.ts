import { StyleSheet } from 'react-native';
import { BorderRadius, Spacing } from '../constants/designTokens';
import { useProfessionalTokens } from '../hooks/useProfessionalTokens';

export const useProfessionalLayoutStyles = () => {
  const { professionalColors, professionalTypography, colors, isLargeScreen } =
    useProfessionalTokens();

  return StyleSheet.create({
    // 🏗️ LAYOUT FOUNDATION
    container: {
      flex: 1,
      backgroundColor: professionalColors.surface.secondary,
    },

    // 🎯 PROFESSIONAL HEADER
    header: {
      backgroundColor: professionalColors.surface.primary,
      paddingTop: Spacing[12],
      paddingBottom: Spacing[10],
      paddingHorizontal: Spacing[6],
      borderBottomWidth: 1,
      borderBottomColor: professionalColors.border.light,
      position: 'relative',
    },

    headerPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.03,
    },

    titleGroup: {
      alignItems: 'center',
      marginBottom: Spacing[6],
      zIndex: 1,
    },

    pageTitle: {
      fontSize: isLargeScreen ? 32 : 28,
      fontWeight: '800',
      color: professionalColors.text.primary,
      letterSpacing: -0.5,
      lineHeight: isLargeScreen ? 38 : 34,
      textAlign: 'center',
      marginBottom: Spacing[4],
    },

    pageTitleAccent: {
      color: colors.primary[600],
    },

    pageSubtitle: {
      fontSize: professionalTypography.body.fontSize,
      fontWeight: '400',
      color: professionalColors.text.secondary,
      letterSpacing: 0.2,
      lineHeight: 24,
      textAlign: 'center',
      maxWidth: '88%',
    },

    // 🎛️ CLEAN SECTIONS
    sectionsContainer: {
      paddingHorizontal: Spacing[4],
      paddingTop: Spacing[6],
      paddingBottom: Spacing[8],
    },
  });
};

export const useProfessionalUtilityStyles = () => {
  const { colors, isLargeScreen } = useProfessionalTokens();

  return StyleSheet.create({
    // 🎭 VISUAL EFFECTS
    cardHoverEffect: {
      backgroundColor: 'rgba(0,0,0,0.02)',
    },

    // 📱 RESPONSIVE ADAPTATIONS
    responsiveSpacing: {
      paddingHorizontal: isLargeScreen ? Spacing[6] : Spacing[4],
    },

    compactLayout: {
      paddingHorizontal: Spacing[3],
    },

    // ℹ️ PROFESSIONAL INFO BUTTON
    titleWithInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    infoButton: {
      marginLeft: Spacing[3],
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primary[100],
      borderWidth: 2,
      borderColor: colors.primary[300],
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.primary[400],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    infoIcon: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.primary[700],
    },

    // 🎨 HEADER PATTERN STYLES
    scrollContentStyle: {
      flexGrow: 1,
    },

    headerPatternLarge: {
      position: 'absolute',
      top: 20,
      right: 20,
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.primary[600],
      opacity: 0.1,
    },

    headerPatternSmall: {
      position: 'absolute',
      bottom: 30,
      left: 30,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary[500],
      opacity: 0.08,
    },

    // 📊 HEADER STATISTICS
    headerStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing[8],
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[4],
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: BorderRadius.lg,
      marginHorizontal: Spacing[4],
      borderWidth: 1,
      borderColor: colors.primary[100],
    },

    statItem: {
      alignItems: 'center',
      paddingHorizontal: Spacing[3],
    },

    statNumber: {
      fontSize: 20,
      fontWeight: '800',
      color: colors.primary[600],
      letterSpacing: -0.5,
    },

    statLabel: {
      fontSize: 12,
      fontWeight: '500',
      color: '#374151',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: 2,
    },

    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.primary[200],
      opacity: 0.5,
    },
  });
};
