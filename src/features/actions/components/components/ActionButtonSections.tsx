import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { PlatformTouchable, FormattedText } from '../../../../components/ui';
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
    <View style={styles.categoryContainer}>
      <View style={styles.categoryHeader}>
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
          <FormattedText
            variant="title-large"
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.donateCategoryTitle}
          >
            ❤️ Contribuisci
          </FormattedText>
          <FormattedText
            fontSize={16}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.donateInlineSubtitle}
          >
            Supporta la lotta contro la fame
          </FormattedText>
        </PlatformTouchable>
        <PlatformTouchable
          style={styles.infoButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={16} color="white" />
        </PlatformTouchable>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Prima riga: Charity Shop, Gift Cards */}
        <View style={styles.buttonRow}>
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
        </View>
        {/* Seconda riga: Dona (lungo e centrato) */}
        <View style={[styles.buttonRow, styles.centeredRow]}>
          {donateButtons[0] && (
            <View style={styles.singleButtonContainer}>
              <AnimatedButton
                button={donateButtons[0]}
                animationValue={animations.buttonAnimations[0]}
                styles={styles}
                onPress={handleFirstRowButton}
                iconColor="#DC2626"
              />
            </View>
          )}
        </View>
      </View>
    </View>
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
    <View style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}>
      <View style={styles.categoryHeader}>
        <View
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
          <FormattedText
            variant="headline-small"
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.exploreTitle}
          >
            🔍 Esplora
          </FormattedText>
          <FormattedText
            fontSize={16}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.exploreSubtitle}
          >
            Progetti e iniziative umanitarie
          </FormattedText>
        </View>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Prima riga: Progetti, Eventi */}
        <View style={styles.buttonRow}>
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
        </View>
        {/* Seconda riga: Tracciabilità (centrata) */}
        <View style={[styles.buttonRow, styles.centeredRow]}>
          {exploreButtons[1] && (
            <View style={styles.singleButtonContainer}>
              <AnimatedButton
                button={exploreButtons[1]}
                animationValue={animations.buttonAnimations[4]}
                styles={styles}
                onPress={handleSecondRowButton}
                iconColor={getExploreIconColor(1)}
              />
            </View>
          )}
        </View>
      </View>
    </View>
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
    <View style={[styles.categoryContainer, { marginTop: -Spacing[1] }]}>
      <View style={styles.categoryHeader}>
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
          <FormattedText
            variant="headline-small"
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.communityTitle}
          >
            🤝 Community
          </FormattedText>
          <FormattedText
            fontSize={16}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={styles.communitySubtitle}
          >
            Unisciti alla nostra comunità
          </FormattedText>
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color="#1F2937"
            style={styles.communityChevron}
          />
        </PlatformTouchable>
      </View>
      <View style={styles.buttonsGrid}>
        {/* Riga unica: Seguici, Chi Siamo */}
        <View style={styles.buttonRow}>
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
        </View>
      </View>
    </View>
  );
};
