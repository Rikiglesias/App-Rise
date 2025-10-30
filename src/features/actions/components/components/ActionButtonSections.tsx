import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import { Platform } from 'react-native';

import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
} from '../../../../components/ui';
import { Spacing } from '../../../../shared/constants';
import { AnimatedButton } from './AnimatedButton';
import type {
  DonateButtonsSectionProps,
  ExploreButtonsSectionProps,
  CommunityButtonsSectionProps,
} from './ActionButtonTypes';
import {
  getExploreIconColor,
  getCommunityIconColor,
} from './ActionButtonUtils';

// Componente sezione per i bottoni di donazione
export const DonateButtonsSection: React.FC<DonateButtonsSectionProps> = ({
  styles,
  animations,
  donateButtons,
  onButtonPress,
  onInfoPress,
}) => {
  const handleFirstRowButton = useMemo(
    () => () => {
      const button = donateButtons[0];
      if (button) onButtonPress(button);
    },
    [onButtonPress, donateButtons]
  );

  const handleSecondRowButtons = useMemo(
    () => [
      () => {
        const button = donateButtons[1];
        if (button) onButtonPress(button);
      },
      () => {
        const button = donateButtons[2];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, donateButtons]
  );

  return (
    <PerfectContainer style={styles.categoryContainer}>
      <PerfectContainer style={styles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  styles.donateTitleContainer,
                  {
                    backgroundColor: '#FEF2F2', // Rosso più delicato e raffinato
                    borderColor: '#FECACA', // Rosso più sottile per eleganza
                  },
                ]
              : styles.donateTitleContainer
          }
          onPress={onInfoPress}
          activeOpacity={0.8}
        >
          <PerfectText
            size={24}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.donateCategoryTitle}
          >
            ❤️ Contribuisci
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.donateInlineSubtitle}
          >
            Supporta la lotta contro la fame
          </PerfectText>
        </PlatformTouchable>
        <PlatformTouchable
          style={styles.infoButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={16} color="white" />
        </PlatformTouchable>
      </PerfectContainer>
      <PerfectContainer style={styles.buttonsGrid}>
        {/* Prima riga: Charity Shop, Gift Cards */}
        <PerfectContainer style={styles.buttonRow}>
          {donateButtons.slice(1, 3).map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 1];
            const onPress = handleSecondRowButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor="#E11D48"
                />
              );
            }
            return null;
          })}
        </PerfectContainer>
        {/* Seconda riga: Dona (lungo e centrato) */}
        <PerfectContainer style={[styles.buttonRow, styles.centeredRow]}>
          {donateButtons[0] && (
            <PerfectContainer style={styles.singleButtonContainer}>
              <AnimatedButton
                button={donateButtons[0]}
                animationValue={animations.buttonAnimations[0]}
                styles={styles}
                onPress={handleFirstRowButton}
                iconColor="#DC2626"
              />
            </PerfectContainer>
          )}
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};

// Componente sezione per i bottoni esplora
export const ExploreButtonsSection: React.FC<ExploreButtonsSectionProps> = ({
  styles,
  animations,
  exploreButtons,
  onButtonPress,
}) => {
  const handleFirstRowButtons = useMemo(
    () => [
      () => {
        const button = exploreButtons[0]; // Progetti
        if (button) onButtonPress(button);
      },
      () => {
        const button = exploreButtons[2]; // Eventi
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, exploreButtons]
  );

  const handleSecondRowButton = useMemo(
    () => () => {
      const button = exploreButtons[1]; // Tracciabilità
      if (button) onButtonPress(button);
    },
    [onButtonPress, exploreButtons]
  );

  return (
    <PerfectContainer
      style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}
    >
      <PerfectContainer style={styles.categoryHeader}>
        <PerfectContainer
          style={
            Platform.OS === 'android'
              ? [
                  styles.exploreHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore
                  },
                ]
              : styles.exploreHeaderBackground
          }
        >
          <PerfectText
            size={20}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.exploreTitle}
          >
            🔍 Esplora
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.exploreSubtitle}
          >
            Progetti e iniziative umanitarie
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>
      <PerfectContainer style={styles.buttonsGrid}>
        {/* Prima riga: Progetti, Eventi */}
        <PerfectContainer style={styles.buttonRow}>
          {[exploreButtons[0], exploreButtons[2]].map((button, index) => {
            if (!button) return null;
            const animationValue =
              animations.buttonAnimations[index === 0 ? 3 : 5];
            const onPress = handleFirstRowButtons[index];
            const iconColorIndex = index === 0 ? 0 : 2; // 0 per Progetti, 2 per Eventi
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor={getExploreIconColor(iconColorIndex)}
                />
              );
            }
            return null;
          })}
        </PerfectContainer>
        {/* Seconda riga: Tracciabilità (centrata) */}
        <PerfectContainer style={[styles.buttonRow, styles.centeredRow]}>
          {exploreButtons[1] && (
            <PerfectContainer style={styles.singleButtonContainer}>
              <AnimatedButton
                button={exploreButtons[1]}
                animationValue={animations.buttonAnimations[4]}
                styles={styles}
                onPress={handleSecondRowButton}
                iconColor={getExploreIconColor(1)}
              />
            </PerfectContainer>
          )}
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};

// Componente sezione per i bottoni community
export const CommunityButtonsSection: React.FC<
  CommunityButtonsSectionProps
> = ({
  styles,
  animations,
  communityButtons,
  onButtonPress,
  onCommunityTitlePress,
}) => {
  const handleCommunityButtons = useMemo(
    () => [
      () => {
        const button = communityButtons[0];
        if (button) onButtonPress(button);
      },
      () => {
        const button = communityButtons[1];
        if (button) onButtonPress(button);
      },
    ],
    [onButtonPress, communityButtons]
  );

  return (
    <PerfectContainer
      style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}
    >
      <PerfectContainer style={styles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  styles.communityHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità (identico a Esplora)
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore (identico a Esplora)
                  },
                ]
              : styles.communityHeaderBackground
          }
          onPress={onCommunityTitlePress}
          activeOpacity={0.8}
        >
          <PerfectText
            size={20}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.communityTitle}
          >
            🤝 Community
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            fontWeight="400"
            immunity={true}
            style={styles.communitySubtitle}
          >
            Unisciti alla nostra comunità
          </PerfectText>
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color="#1F2937"
            style={styles.communityChevron}
          />
        </PlatformTouchable>
      </PerfectContainer>
      <PerfectContainer style={styles.buttonsGrid}>
        {/* Riga unica: Seguici, Chi Siamo */}
        <PerfectContainer style={styles.buttonRow}>
          {communityButtons.map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 6];
            const onPress = handleCommunityButtons[index];
            if (animationValue && onPress) {
              return (
                <AnimatedButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  styles={styles}
                  onPress={onPress}
                  iconColor={getCommunityIconColor(index)}
                />
              );
            }
            return null;
          })}
        </PerfectContainer>
      </PerfectContainer>
    </PerfectContainer>
  );
};
