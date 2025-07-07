import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { Modal, View } from 'react-native';

import { FormattedText, PlatformTouchable } from '../ui';
import { Colors } from '../../shared/constants/designTokens';
import { HomeHeaderTokens } from './design-tokens/HomeHeaderTokens';
import { headerMissionStyles } from './styles/HeaderMissionStyles';

interface Props {
  styles?: object; // Mantenuto per compatibilità
  scrollY?: object; // Mantenuto per compatibilità
}

/**
 * Sezione mission del header con statistiche e modal interattivo
 * Completamente modulare con design tokens centralizzati
 */
export const HeaderMissionSection: React.FC<Props> = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleMealsPress = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const missionText =
    'Combattiamo la fame nel mondo attraverso programmi alimentari concreti, coinvolgendo comunità locali e volontari per creare un impatto duraturo.';

  return (
    <>
      {/* Container con Gradient Pattern del Design System */}
      <View style={headerMissionStyles.outerGradientContainer}>
        <LinearGradient
          colors={HomeHeaderTokens.gradients.dark}
          {...HomeHeaderTokens.gradientConfig.diagonal}
          style={headerMissionStyles.gradientBorder}
        >
          <View style={headerMissionStyles.missionContainer}>
            {/* CORREZIONE UX: Titolo principale SENZA GRADIENT - NON CLICCABILE */}
            <View style={headerMissionStyles.titleGradientContainer}>
              <View style={headerMissionStyles.titleContent}>
                <FormattedText
                  variant="title-large"
                  style={headerMissionStyles.impactTitleGradient}
                >
                  Il nostro impatto sul mondo
                </FormattedText>
                {/* Underline decorativo per separazione - DESIGN SYSTEM */}
                <View style={headerMissionStyles.titleUnderline} />
              </View>
            </View>

            {/* Testo descrittivo con Typography Smart - RESPONSIVE */}
            <FormattedText
              variant="body-large"
              style={headerMissionStyles.missionText}
              fixed={true}
              fixedLines={3}
            >
              {missionText}
            </FormattedText>

            {/* Statistiche container */}
            <View style={headerMissionStyles.statsContainer}>
              {/* Container pasti - CLICKABLE */}
              <PlatformTouchable
                style={[
                  headerMissionStyles.statsBox,
                  headerMissionStyles.mealsBox,
                ]}
                onPress={handleMealsPress}
                activeOpacity={0.8}
              >
                <FormattedText
                  variant="title-large"
                  style={headerMissionStyles.statNumber}
                >
                  3.14M
                </FormattedText>
                <FormattedText
                  variant="body-small"
                  style={headerMissionStyles.statLabel}
                >
                  Pasti distribuiti
                </FormattedText>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={20}
                  color={HomeHeaderTokens.colors.primary}
                  style={headerMissionStyles.infoIcon}
                />
              </PlatformTouchable>

              {/* Container volontari - STATICO */}
              <View
                style={[
                  headerMissionStyles.statsBox,
                  headerMissionStyles.volunteersBox,
                ]}
              >
                <FormattedText
                  variant="title-large"
                  style={headerMissionStyles.statNumber}
                >
                  13K
                </FormattedText>
                <FormattedText
                  variant="body-small"
                  style={headerMissionStyles.statLabel}
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
        <View style={headerMissionStyles.modalOverlay}>
          <View style={headerMissionStyles.modalContainer}>
            <LinearGradient
              colors={HomeHeaderTokens.gradients.primary}
              style={headerMissionStyles.modalGradient}
            >
              <View style={headerMissionStyles.modalContent}>
                {/* Header del modal */}
                <View style={headerMissionStyles.modalHeader}>
                  <FormattedText
                    variant="title-medium"
                    style={headerMissionStyles.modalTitle}
                  >
                    Pasti Distribuiti
                  </FormattedText>
                  <PlatformTouchable
                    onPress={closeModal}
                    style={headerMissionStyles.closeButton}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={24}
                      color={Colors.neutral[700]}
                    />
                  </PlatformTouchable>
                </View>

                {/* Breakdown dei pasti */}
                <View style={headerMissionStyles.breakdownContainer}>
                  <View style={headerMissionStyles.breakdownItem}>
                    <View style={headerMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="rice"
                        size={20}
                        color={HomeHeaderTokens.colors.primary}
                      />
                    </View>
                    <View style={headerMissionStyles.breakdownText}>
                      <FormattedText
                        variant="body-large"
                        style={headerMissionStyles.breakdownNumber}
                      >
                        2.5M
                      </FormattedText>
                      <FormattedText
                        variant="body-medium"
                        style={headerMissionStyles.breakdownLabel}
                      >
                        Pasti completi
                      </FormattedText>
                      <FormattedText
                        variant="body-small"
                        style={headerMissionStyles.breakdownDescription}
                      >
                        Programmi Africa
                      </FormattedText>
                    </View>
                  </View>

                  <View style={headerMissionStyles.breakdownItem}>
                    <View style={headerMissionStyles.breakdownBadge}>
                      <MaterialCommunityIcons
                        name="package-variant"
                        size={20}
                        color={HomeHeaderTokens.colors.primary}
                      />
                    </View>
                    <View style={headerMissionStyles.breakdownText}>
                      <FormattedText
                        variant="body-large"
                        style={headerMissionStyles.breakdownNumber}
                      >
                        600K
                      </FormattedText>
                      <FormattedText
                        variant="body-medium"
                        style={headerMissionStyles.breakdownLabel}
                      >
                        Kit di emergenza
                      </FormattedText>
                      <FormattedText
                        variant="body-small"
                        style={headerMissionStyles.breakdownDescription}
                      >
                        Situazioni di crisi
                      </FormattedText>
                    </View>
                  </View>
                </View>

                {/* Totale */}
                <View style={headerMissionStyles.totalContainer}>
                  <View style={headerMissionStyles.totalLine} />
                  <View style={headerMissionStyles.totalRow}>
                    <FormattedText
                      variant="body-medium"
                      style={headerMissionStyles.totalLabel}
                    >
                      Totale distribuito
                    </FormattedText>
                    <FormattedText
                      variant="title-large"
                      style={headerMissionStyles.totalNumber}
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
