import React, { useMemo } from 'react';
import { AnimatedButton } from './AnimatedButton';
import { useTranslation } from '@/shared/hooks/useTranslation';
import type {
  DonateButtonsSectionProps,
  ExploreButtonsSectionProps,
  CommunityButtonsSectionProps,
} from './ActionButtonTypes';
import {
  getExploreIconColor,
  getCommunityIconColor,
} from './ActionButtonUtils';
import { Colors } from '@/shared/constants';
// No direct scaling here: PerfectIcon scales its size internally.
import {
  PlatformTouchable,
  PerfectText,
  PerfectContainer,
  PerfectIcon,
} from '@/components/ui';

// Componente sezione per i bottoni di donazione
export const DonateButtonsSection: React.FC<DonateButtonsSectionProps> = ({
  styles,
  animations,
  donateButtons,
  onButtonPress,
  onInfoPress,
}) => {
  const { t } = useTranslation();
  const infoIconSize = 16;
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
        <PerfectContainer
          style={styles.donateTitleContainerWrapper}
          testID="donate-header"
        >
          <PlatformTouchable
            style={styles.donateTitleContainer}
            onPress={onInfoPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Contribuisci"
          >
            <PerfectText
              size={24}
              lines={1}
              immunity={true}
              testID="donate-title"
              style={styles.donateCategoryTitle}
            >
              {'\u2764\uFE0F '}Contribuisci
            </PerfectText>
            <PerfectText
              size={16}
              lines={1}
              immunity={true}
              testID="donate-subtitle"
              style={styles.donateInlineSubtitle}
            >
              {t('actions.donateSubtitle')}
            </PerfectText>
          </PlatformTouchable>
          <PlatformTouchable
            style={styles.infoButton}
            onPress={onInfoPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Informazioni su Contribuisci"
            testID="donate-info-button"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <PerfectIcon
              name="information"
              size={infoIconSize}
              minSize={14}
              maxSize={18}
              color={Colors.neutral[0]}
            />
          </PlatformTouchable>
        </PerfectContainer>
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
                  iconColor={Colors.primary[600]}
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
                iconColor={Colors.primary[600]}
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
  const { t } = useTranslation();
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
    <PerfectContainer style={styles.categoryContainerExplore}>
      <PerfectContainer style={styles.categoryHeader}>
        <PerfectContainer style={styles.exploreHeaderBackground}>
          <PerfectText
            size={20}
            lines={1}
            immunity={true}
            style={styles.exploreTitle}
          >
            {'\uD83D\uDD0E '}Esplora
          </PerfectText>
          <PerfectText
            size={13}
            lines={1}
            immunity={true}
            style={styles.exploreSubtitle}
          >
            {t('actions.exploreSubtitle')}
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
    <PerfectContainer style={styles.categoryContainerCommunity}>
      <PerfectContainer style={styles.categoryHeader}>
        <PlatformTouchable
          style={styles.communityHeaderBackground}
          onPress={onCommunityTitlePress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Contribuisci"
        >
          <PerfectText
            size={20}
            lines={1}
            immunity={true}
            style={styles.communityTitle}
          >
            {'\uD83E\uDD1D '}Community
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            immunity={true}
            style={styles.communitySubtitle}
          >
            Unisciti alla nostra comunità
          </PerfectText>
          <PerfectIcon
            name="open-in-new"
            size={16}
            color={Colors.neutral[900]}
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
