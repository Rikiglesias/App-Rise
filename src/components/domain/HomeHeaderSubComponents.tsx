import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  Modal,
  Platform,
  View,
} from 'react-native';
import { PlatformTouchable, PerfectText } from '../ui';

import { Colors } from '../../shared/constants/designTokens';
import {
  type HeaderImageSectionProps,
  type HeaderMissionSectionProps,
  type HeaderTextSectionProps,
} from '../../features/home/types/HomeHeaderTypes';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';
import { baseMissionStyles } from './styles/HeaderMissionStyles';
import { ModernSmartTitle } from './ModernSmartTitle';

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
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              source={require('../../../assets/images/hero-banner.png')}
              style={styles.image as ImageStyle}
              resizeMode="contain"
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            source={require('../../../assets/images/hero-banner.png')}
            style={styles.image as ImageStyle}
            resizeMode="contain"
          />

          <Animated.View
            style={[styles.imageGradientOverlay, { opacity: gradientOpacity }]}
          >
            <LinearGradient
              colors={HomeHeaderDesignTokens.gradients.header}
              style={styles.flexOne}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }
);

HeaderImageSection.displayName = 'HeaderImageSection';

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
          colors={HomeHeaderDesignTokens.gradients.dark}
          {...HomeHeaderDesignTokens.gradientConfig.diagonal}
          style={baseMissionStyles.gradientBorder}
        >
          <View style={baseMissionStyles.missionContainer}>
            {/* CORREZIONE UX: Titolo principale SENZA GRADIENT - NON CLICCABILE */}
            <View style={baseMissionStyles.titleGradientContainer}>
              <View style={baseMissionStyles.titleContent}>
                <PerfectText
                  size={35}
                  lines={1}
                  immunity={true}
                  style={baseMissionStyles.impactTitleGradient}
                >
                  Il nostro impatto sul mondo
                </PerfectText>
                {/* Underline decorativo per separazione - DESIGN SYSTEM */}
                <View style={baseMissionStyles.titleUnderline} />
              </View>
            </View>

            {/* Testo descrittivo con Sistema Bi-Direzionale Intelligente - RESPONSIVE */}
            <PerfectText
              size={18}
              lines={3}
              immunity={true}
              style={baseMissionStyles.missionText}
            >
              {missionText}
            </PerfectText>

            {/* Statistiche container */}
            <View style={baseMissionStyles.statsContainer}>
              {/* Container pasti - CLICKABLE */}
              <PlatformTouchable
                style={[baseMissionStyles.statsBox, baseMissionStyles.mealsBox]}
                onPress={handleMealsPress}
                activeOpacity={0.8}
              >
                <PerfectText
                  size={32}
                  lines={1}
                  immunity={true}
                  style={[baseMissionStyles.statNumber, { fontWeight: '900' }]}
                >
                  3.14M
                </PerfectText>
                <PerfectText
                  size={14}
                  lines={1}
                  immunity={true}
                  style={baseMissionStyles.statLabel}
                >
                  Pasti distribuiti
                </PerfectText>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={HomeHeaderDesignTokens.colors.primary}
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
                <PerfectText
                  size={32}
                  lines={1}
                  immunity={true}
                  style={[baseMissionStyles.statNumber, { fontWeight: '900' }]}
                >
                  13K
                </PerfectText>
                <PerfectText
                  size={14}
                  lines={1}
                  immunity={true}
                  style={baseMissionStyles.statLabel}
                >
                  Volontari attivi
                </PerfectText>
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
              colors={HomeHeaderDesignTokens.gradients.primary}
              style={baseMissionStyles.modalGradient}
            >
              <View style={baseMissionStyles.modalContent}>
                {/* Header del modal */}
                <View style={baseMissionStyles.modalHeader}>
                  <PerfectText
                    size={24}
                    lines={1}
                    immunity={true}
                    style={baseMissionStyles.modalTitle}
                  >
                    Pasti Distribuiti
                  </PerfectText>
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
                        color={HomeHeaderDesignTokens.colors.primary}
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <PerfectText
                        size={18}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownNumber}
                      >
                        2.5M
                      </PerfectText>
                      <PerfectText
                        size={14}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownLabel}
                      >
                        Pasti completi
                      </PerfectText>
                      <PerfectText
                        size={12}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownDescription}
                      >
                        Programmi Africa
                      </PerfectText>
                    </View>
                  </View>

                  <View style={baseMissionStyles.breakdownItem}>
                    <View style={baseMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={20}
                        color={HomeHeaderDesignTokens.colors.primary}
                      />
                    </View>
                    <View style={baseMissionStyles.breakdownText}>
                      <PerfectText
                        size={18}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownNumber}
                      >
                        600K
                      </PerfectText>
                      <PerfectText
                        size={14}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownLabel}
                      >
                        Kit di emergenza
                      </PerfectText>
                      <PerfectText
                        size={12}
                        lines={1}
                        immunity={true}
                        style={baseMissionStyles.breakdownDescription}
                      >
                        Situazioni di crisi
                      </PerfectText>
                    </View>
                  </View>
                </View>

                {/* Totale */}
                <View style={baseMissionStyles.totalContainer}>
                  <View style={baseMissionStyles.totalLine} />
                  <View style={baseMissionStyles.totalRow}>
                    <PerfectText
                      size={14}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.totalLabel}
                    >
                      Totale distribuito
                    </PerfectText>
                    <PerfectText
                      size={24}
                      lines={1}
                      immunity={true}
                      style={baseMissionStyles.totalNumber}
                    >
                      3.14M
                    </PerfectText>
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
