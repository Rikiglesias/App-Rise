/**
 * HEADER MISSION SECTION - Componente modulare refactorizzato
 * Sezione missione del header con statistiche e modal
 */

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { PerfectContainer } from '../../ui/PerfectContainer';

import { PerfectText } from '../../ui';
import { type HeaderMissionSectionProps } from '../../../features/home/types/HomeHeaderTypes';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';
import { baseMissionStyles } from '../styles/HeaderMissionStyles';
import { MissionStatsSection } from './MissionStatsSection';
import { MealsBreakdownModal } from './MealsBreakdownModal';

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
      <PerfectContainer style={baseMissionStyles.outerGradientContainer}>
        <LinearGradient
          colors={HomeHeaderDesignTokens.gradients.dark}
          {...HomeHeaderDesignTokens.gradientConfig.diagonal}
          style={baseMissionStyles.gradientBorder}
        >
          <PerfectContainer style={baseMissionStyles.missionContainer}>
            {/* CORREZIONE UX: Titolo principale SENZA GRADIENT - NON CLICCABILE */}
            <PerfectContainer style={baseMissionStyles.titleGradientContainer}>
              <PerfectContainer style={baseMissionStyles.titleContent}>
                <PerfectText
                  size={35}
                  lines={1}
                  fontWeight="400"
                  immunity={true}
                  style={baseMissionStyles.impactTitleGradient}
                >
                  Il nostro impatto sul mondo
                </PerfectText>
                {/* Underline decorativo per separazione - DESIGN SYSTEM */}
                <PerfectContainer style={baseMissionStyles.titleUnderline} />
              </PerfectContainer>
            </PerfectContainer>

            {/* Testo descrittivo con Sistema Bi-Direzionale Intelligente - RESPONSIVE */}
            <PerfectText
              size={18}
              lines={3}
              fontWeight="400"
              immunity={true}
              style={baseMissionStyles.missionText}
            >
              {missionText}
            </PerfectText>

            {/* Statistiche container - Componente modulare */}
            <MissionStatsSection onMealsPress={handleMealsPress} />
          </PerfectContainer>
        </LinearGradient>
      </PerfectContainer>

      {/* Modal per la breakdown dei pasti - Componente modulare */}
      <MealsBreakdownModal isVisible={isModalVisible} onClose={closeModal} />
    </>
  );
};

HeaderMissionSection.displayName = 'HeaderMissionSection';
