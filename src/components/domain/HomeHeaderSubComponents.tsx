import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { PlatformTouchable, FormattedText } from '../ui';

import {
  Colors,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import {
  type HeaderImageSectionProps,
  type HeaderMissionSectionProps,
  type HeaderTextSectionProps,
} from '../../features/home/types/HomeHeaderTypes';

// 🎨 DESIGN TOKENS CENTRALIZZATI - ELIMINANO DUPLICAZIONI
const DesignTokens = {
  // Colori centralizzati
  colors: {
    primary: '#DC2626',
    primaryLight: 'rgba(220, 38, 38, 0.2)',
    primaryShadow: 'rgba(220, 38, 38, 0.25)',
    secondary: '#1F2937',
    secondaryLight: 'rgba(31, 41, 55, 0.2)',
    dark: '#171717',
    transparent: 'transparent',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    gradientOverlay: 'rgba(0,0,0,0.1)',
  },

  // Gradient patterns centralizzati
  gradients: {
    dark: ['#1F2937', '#374151', '#111827'] as const,
    primary: ['#DC2626', '#B91C1C', '#991B1B'] as const,
    header: ['transparent', 'rgba(0,0,0,0.1)'] as const,
  },

  // Border radius centralizzato
  borderRadius: {
    small: 16,
    medium: 21,
    large: 24,
    round: 20,
  },

  // Shadow patterns centralizzati
  shadows: {
    light: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    large: {
      shadowColor: '#1F2937',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
  },

  // Dimensioni centralizzate
  dimensions: {
    logoSmall: 40,
    logoMedium: 56,
    separatorWidth: 80,
    separatorLineWidth: 110,
    separatorHeight: 2,
    modalMaxWidth: 340,
  },

  // Gradient configuration centralizzata
  gradientConfig: {
    diagonal: {
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },

  // Platform-specific styles centralizzati
  platformStyles: {
    android: {
      paddingTop: Spacing[8],
      paddingBottom: Spacing[2],
      marginTop: Spacing[2],
    },
    ios: {
      paddingTop: Spacing[6],
      paddingBottom: 0,
    },
  } as const,
};

// ✨ TITLE STYLES ELEGANTI - UTILIZZANO DESIGN TOKENS
const createModernTitleStyles = () =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[0],
      paddingTop: Platform.OS === 'android' ? Spacing[8] : Spacing[0],
    },

    titleContainer: {
      alignItems: 'center',
      paddingVertical: Spacing[0],
      paddingHorizontal: Spacing[4],
      ...(Platform.OS === 'android' && DesignTokens.platformStyles.android),
      ...(Platform.OS === 'ios' && DesignTokens.platformStyles.ios),
      position: 'relative',
    },

    titleText: {
      fontWeight: Typography.weights.black,
      textAlign: 'center',
      letterSpacing: -1.5,
      lineHeight: 45 * 1.15, // Aggiornato per fontSize={45}
      marginBottom: 0,
    },

    titleSeparator: {
      alignItems: 'center',
      marginTop: Spacing[2],
      marginBottom: Spacing[1],
      justifyContent: 'center',
      flexDirection: 'row',
    },

    separatorLogo: {
      width: DesignTokens.dimensions.logoMedium,
      height: DesignTokens.dimensions.logoMedium,
      marginHorizontal: Spacing[4],
      opacity: 1,
    },

    separatorLine: {
      height: DesignTokens.dimensions.separatorHeight,
      width: DesignTokens.dimensions.separatorLineWidth,
      backgroundColor: DesignTokens.colors.primaryLight,
      marginHorizontal: 0,
      borderRadius: 1,
      ...DesignTokens.shadows.light,
    },
  });
/* eslint-enable react-native/no-unused-styles */

// ✨ CLEAN & MODERN TITLE COMPONENT
const ModernSmartTitle: React.FC<{
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}> = React.memo(({ titleAnim, titleOpacity, titleTransform }) => {
  const modernTitleStyles = React.useMemo(() => createModernTitleStyles(), []);

  // Animazione semplice e professionale
  const mainTitleDelay = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const titleAnimation = Animated.timing(mainTitleDelay, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    });

    titleAnimation.start();
  }, [mainTitleDelay]);

  return (
    <View style={modernTitleStyles.container}>
      <Animated.View
        style={{
          opacity: Animated.multiply(
            Animated.multiply(titleAnim, titleOpacity as Animated.Value),
            mainTitleDelay
          ),
          transform: [
            {
              translateY: Animated.add(
                titleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
                titleTransform as Animated.Value
              ),
            },
          ],
        }}
      >
        <View style={modernTitleStyles.titleContainer}>
          {/* Titolo con Container Professionale - Layout Consistency Guaranteed */}
          <View style={{ width: '100%', alignItems: 'center' }}>
            <View style={{ alignItems: 'center' }}>
              <FormattedText
                fontSize={45}
                fontWeight="black"
                color={DesignTokens.colors.primary}
                lineBreakStrategyIOS="push-out"
                breakStrategyAndroid="highQuality"
                hyphenationFrequencyAndroid="full"
                style={{
                  textAlign: 'center',
                  fontWeight: '900',
                  lineHeight: 50,
                }}
              >
                Rise Against
              </FormattedText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FormattedText
                  fontSize={45}
                  fontWeight="black"
                  color={DesignTokens.colors.primary}
                  lineBreakStrategyIOS="push-out"
                  breakStrategyAndroid="highQuality"
                  hyphenationFrequencyAndroid="full"
                  style={{
                    fontWeight: '900',
                  }}
                >
                  Hunger{' '}
                </FormattedText>
                <FormattedText
                  fontSize={45}
                  fontWeight="black"
                  color={DesignTokens.colors.dark}
                  lineBreakStrategyIOS="push-out"
                  breakStrategyAndroid="highQuality"
                  hyphenationFrequencyAndroid="full"
                  style={{
                    fontWeight: '900',
                  }}
                >
                  Italia
                </FormattedText>
              </View>
            </View>
          </View>

          {/* Separatore elegante con logo simbolico centrale */}
          <View style={modernTitleStyles.titleSeparator}>
            <View style={modernTitleStyles.separatorLine} />
            <Image
              source={require('../../../assets/icons/app/logo.png')}
              style={modernTitleStyles.separatorLogo}
              resizeMode="contain"
            />
            <View style={modernTitleStyles.separatorLine} />
          </View>
        </View>
      </Animated.View>
    </View>
  );
});

ModernSmartTitle.displayName = 'ModernSmartTitle';

// Sub-components for max-lines-per-function compliance
export const HeaderTextSection: React.FC<HeaderTextSectionProps> = React.memo(
  ({ colors, titleAnim, titleOpacity, titleTransform, styles }) => (
    <View style={styles.headerSection}>
      <LinearGradient
        colors={[colors.primary[100], colors.primary[50], colors.neutral[50]]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <View style={styles.textContainer}>
        <ModernSmartTitle
          titleAnim={titleAnim}
          titleOpacity={titleOpacity}
          titleTransform={titleTransform}
        />
      </View>
    </View>
  )
);

HeaderTextSection.displayName = 'HeaderTextSection';

export const HeaderImageSection: React.FC<HeaderImageSectionProps> = React.memo(
  ({
    imageAnim,
    imageParallax,
    imageScale,
    gradientOpacity,
    imageRotation,
    styles,
  }) => {
    // Android: Rendering completamente statico per evitare artefatti
    if (Platform.OS === 'android') {
      return (
        <View style={styles.imageSection}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../assets/images/hero-banner.png')}
              style={styles.image as ImageStyle}
              resizeMode="cover"
            />
          </View>
        </View>
      );
    }

    // iOS: Mantiene tutte le animazioni
    return (
      <View style={styles.imageSection}>
        <Animated.View
          style={[
            styles.imageContainer,
            {
              opacity: imageAnim,
              transform: [
                { translateY: imageParallax },
                { scale: imageScale },
                { rotate: imageRotation },
              ],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/hero-banner.png')}
            style={styles.image as ImageStyle}
            resizeMode="cover"
          />

          <Animated.View
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          >
            <LinearGradient
              colors={DesignTokens.gradients.header}
              style={styles.flexOne}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';

// Stili per il modal dei pasti e sezione impatto - CON DESIGN TOKENS
const baseMissionStyles = StyleSheet.create({
  // Gradient Container Pattern del Design System
  outerGradientContainer: {
    marginTop: Spacing[4],
    marginHorizontal: Spacing[4],
    borderRadius: DesignTokens.borderRadius.large,
    ...DesignTokens.shadows.large,
  },
  gradientBorder: {
    borderRadius: DesignTokens.borderRadius.large,
    padding: 3,
  },
  missionContainer: {
    backgroundColor: Colors.neutral[0],
    borderRadius: DesignTokens.borderRadius.medium,
    padding: Spacing[5],
  },
  // Titolo principale "Il nostro impatto sul mondo" - ROSSO

  // 🎨 NUOVI STILI GRADIENT TITLE - DESIGN SYSTEM 2025
  titleGradientContainer: {
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  // CORREZIONE UX: Stile titolo NON cliccabile - Design System
  titleContent: {
    backgroundColor: DesignTokens.colors.transparent,
    borderRadius: DesignTokens.borderRadius.small,
    borderWidth: 1,
    borderColor: DesignTokens.colors.primaryLight,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2] + 2,
    alignItems: 'center',
    ...DesignTokens.shadows.medium,
  },
  // Underline decorativo per separazione - DESIGN SYSTEM
  titleUnderline: {
    marginTop: Spacing[2],
    height: 3,
    width: DesignTokens.dimensions.separatorWidth,
    backgroundColor: DesignTokens.colors.primary,
    borderRadius: 2,
    ...DesignTokens.shadows.light,
  },
  impactTitleGradient: {
    fontWeight: Typography.weights.black,
    color: DesignTokens.colors.primary,
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 30,
    textShadowColor: DesignTokens.colors.primaryShadow,
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  // Typography Smart per il testo descrittivo - RESPONSIVE
  missionText: {
    fontWeight: Typography.weights.bold,
    color: DesignTokens.colors.secondary,
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: Spacing[5],
    textShadowColor: DesignTokens.colors.secondaryLight,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  statsBox: {
    flex: 1,
    backgroundColor: Colors.neutral[50],
    borderRadius: DesignTokens.borderRadius.small,
    borderWidth: 2,
    padding: Spacing[3],
    alignItems: 'center',
    ...DesignTokens.shadows.card,
  },
  mealsBox: {
    borderColor: DesignTokens.colors.primary,
    shadowColor: DesignTokens.colors.primary,
  },
  volunteersBox: {
    borderColor: DesignTokens.colors.secondary,
    shadowColor: DesignTokens.colors.secondary,
  },
  statNumber: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.black,
    color: Colors.neutral[900],
    marginBottom: Spacing[1],
  },
  statLabel: {
    // fontSize gestito da FormattedText variant="body-small"
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  infoIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // Stili per il modal
  modalOverlay: {
    flex: 1,
    backgroundColor: DesignTokens.colors.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[4],
  },
  modalContainer: {
    width: '100%',
    maxWidth: DesignTokens.dimensions.modalMaxWidth,
    borderRadius: DesignTokens.borderRadius.large,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 3,
  },
  modalContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: DesignTokens.borderRadius.medium,
    padding: Spacing[5],
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  modalTitle: {
    // fontSize gestito da FormattedText variant="title-medium"
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  closeButton: {
    padding: Spacing[1],
  },
  breakdownContainer: {
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  breakdownBadge: {
    width: DesignTokens.dimensions.logoSmall,
    height: DesignTokens.dimensions.logoSmall,
    borderRadius: DesignTokens.borderRadius.round,
    backgroundColor: Colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DesignTokens.colors.primary,
  },
  breakdownText: {
    flex: 1,
  },
  breakdownNumber: {
    // fontSize gestito da FormattedText variant="body-large"
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
  },
  breakdownLabel: {
    // fontSize gestito da FormattedText variant="body-medium"
    color: Colors.neutral[700],
    marginTop: 2,
  },
  breakdownDescription: {
    // fontSize gestito da FormattedText variant="body-small"
    color: Colors.neutral[500],
    marginTop: 1,
  },
  totalContainer: {
    paddingTop: Spacing[3],
  },
  totalLine: {
    height: 1,
    backgroundColor: Colors.neutral[200],
    marginBottom: Spacing[3],
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    // fontSize gestito da FormattedText variant="body-medium"
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
  },
  totalNumber: {
    fontWeight: Typography.weights.black,
    color: DesignTokens.colors.primary,
  },
});

export const HeaderMissionSection: React.FC<HeaderMissionSectionProps> = ({
  styles: _styles,
  scrollY: _scrollY,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMealsPress = React.useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const missionText =
    'Combattiamo la fame nel mondo attraverso programmi alimentari concreti, coinvolgendo comunità locali e volontari per creare un impatto duraturo.';

  return (
    <>
      {/* Container con Gradient Pattern del Design System */}
      <View style={baseMissionStyles.outerGradientContainer}>
        <LinearGradient
          colors={DesignTokens.gradients.dark}
          {...DesignTokens.gradientConfig.diagonal}
          style={baseMissionStyles.gradientBorder}
        >
          <View style={baseMissionStyles.missionContainer}>
            {/* CORREZIONE UX: Titolo principale SENZA GRADIENT - NON CLICCABILE */}
            <View style={baseMissionStyles.titleGradientContainer}>
              <View style={baseMissionStyles.titleContent}>
                <FormattedText
                  variant="title-large"
                  style={baseMissionStyles.impactTitleGradient}
                >
                  Il nostro impatto sul mondo
                </FormattedText>
                {/* Underline decorativo per separazione - DESIGN SYSTEM */}
                <View style={baseMissionStyles.titleUnderline} />
              </View>
            </View>

            {/* Testo descrittivo con Typography Smart - RESPONSIVE */}
            <FormattedText
              variant="body-large"
              style={baseMissionStyles.missionText}
              fixed={true}
              fixedLines={3}
            >
              {missionText}
            </FormattedText>

            {/* Statistiche container */}
            <View style={baseMissionStyles.statsContainer}>
              {/* Container pasti - CLICKABLE */}
              <PlatformTouchable
                style={[baseMissionStyles.statsBox, baseMissionStyles.mealsBox]}
                onPress={handleMealsPress}
                activeOpacity={0.8}
              >
                <FormattedText
                  variant="title-large"
                  style={baseMissionStyles.statNumber}
                >
                  3.14M
                </FormattedText>
                <FormattedText
                  variant="body-small"
                  style={baseMissionStyles.statLabel}
                >
                  Pasti distribuiti
                </FormattedText>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={DesignTokens.colors.primary}
                  style={baseMissionStyles.infoIcon}
                />
              </PlatformTouchable>

              {/* Container volontari - STATICO */}
              <View
                style={[
                  baseMissionStyles.statsBox,
                  baseMissionStyles.volunteersBox,
                ]}
              >
                <FormattedText
                  variant="title-large"
                  style={baseMissionStyles.statNumber}
                >
                  13K
                </FormattedText>
                <FormattedText
                  variant="body-small"
                  style={baseMissionStyles.statLabel}
                >
                  Volontari attivi
                </FormattedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Modal per la breakdown dei pasti */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}
      >
        <View style={baseMissionStyles.modalOverlay}>
          <View style={baseMissionStyles.modalContainer}>
            <LinearGradient
              colors={DesignTokens.gradients.primary}
              style={baseMissionStyles.modalGradient}
            >
              <View style={baseMissionStyles.modalContent}>
                {/* Header del modal */}
                <View style={baseMissionStyles.modalHeader}>
                  <FormattedText
                    variant="title-medium"
                    style={baseMissionStyles.modalTitle}
                  >
                    Pasti Distribuiti
                  </FormattedText>
                  <PlatformTouchable
                    onPress={closeModal}
                    style={baseMissionStyles.closeButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={Colors.neutral[700]}
                    />
                  </PlatformTouchable>
                </View>

                {/* Breakdown dei pasti */}
                <View style={baseMissionStyles.breakdownContainer}>
                  <View style={baseMissionStyles.breakdownItem}>
                    <View style={baseMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="rice"
                        size={20}
                        color={DesignTokens.colors.primary}
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <FormattedText
                        variant="body-large"
                        style={baseMissionStyles.breakdownNumber}
                      >
                        2.5M
                      </FormattedText>
                      <FormattedText
                        variant="body-medium"
                        style={baseMissionStyles.breakdownLabel}
                      >
                        Pasti completi
                      </FormattedText>
                      <FormattedText
                        variant="body-small"
                        style={baseMissionStyles.breakdownDescription}
                      >
                        Programmi Africa
                      </FormattedText>
                    </View>
                  </View>

                  <View style={baseMissionStyles.breakdownItem}>
                    <View style={baseMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={20}
                        color={DesignTokens.colors.primary}
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <FormattedText
                        variant="body-large"
                        style={baseMissionStyles.breakdownNumber}
                      >
                        600K
                      </FormattedText>
                      <FormattedText
                        variant="body-medium"
                        style={baseMissionStyles.breakdownLabel}
                      >
                        Kit di emergenza
                      </FormattedText>
                      <FormattedText
                        variant="body-small"
                        style={baseMissionStyles.breakdownDescription}
                      >
                        Situazioni di crisi
                      </FormattedText>
                    </View>
                  </View>
                </View>

                {/* Totale */}
                <View style={baseMissionStyles.totalContainer}>
                  <View style={baseMissionStyles.totalLine} />
                  <View style={baseMissionStyles.totalRow}>
                    <FormattedText
                      variant="body-medium"
                      style={baseMissionStyles.totalLabel}
                    >
                      Totale distribuito
                    </FormattedText>
                    <FormattedText
                      variant="title-large"
                      style={baseMissionStyles.totalNumber}
                    >
                      3.14M
                    </FormattedText>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </>
  );
};

HeaderMissionSection.displayName = 'HeaderMissionSection';
