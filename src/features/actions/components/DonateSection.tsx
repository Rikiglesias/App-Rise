import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { FormattedText, PlatformTouchable } from '../../../components/ui';
import type { ButtonData } from '../hooks/useActionButtonsLogic';
import { actionButtonsStyles } from '../styles/ActionButtonsStyles';
import type { useNewActionsAnimations } from './components/ContributeAnimations';
import { ActionButton } from './ActionButton';

interface Props {
  animations: ReturnType<typeof useNewActionsAnimations>;
  donateButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onInfoPress: () => void;
}

/**
 * Sezione donazioni con layout specifico: 2 bottoni sopra + 1 bottone largo sotto
 */
export const DonateSection: React.FC<Props> = ({
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
    <View style={actionButtonsStyles.categoryContainer}>
      <View style={actionButtonsStyles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  actionButtonsStyles.donateTitleContainer,
                  {
                    backgroundColor: '#FEF2F2', // Rosso più delicato e raffinato
                    borderColor: '#FECACA', // Rosso più sottile per eleganza
                  },
                ]
              : actionButtonsStyles.donateTitleContainer
          }
          onPress={onInfoPress}
          activeOpacity={0.8}
        >
          <FormattedText
            variant="title-large"
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={actionButtonsStyles.donateCategoryTitle}
          >
            ❤️ Contribuisci
          </FormattedText>
          <FormattedText
            fontSize={16}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={actionButtonsStyles.donateInlineSubtitle}
          >
            Supporta la lotta contro la fame
          </FormattedText>
        </PlatformTouchable>
        <PlatformTouchable
          style={actionButtonsStyles.infoButton}
          onPress={onInfoPress}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="information" size={16} color="white" />
        </PlatformTouchable>
      </View>
      <View style={actionButtonsStyles.buttonsGrid}>
        {/* Prima riga: Charity Shop, Gift Cards */}
        <View style={actionButtonsStyles.buttonRow}>
          {donateButtons.slice(1, 3).map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 1];
            const onPress = handleSecondRowButtons[index];
            if (animationValue && onPress) {
              return (
                <ActionButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  onPress={onPress}
                  iconColor="#E11D48"
                />
              );
            }
            return null;
          })}
        </View>
        {/* Seconda riga: Dona (lungo e centrato) */}
        <View
          style={[
            actionButtonsStyles.buttonRow,
            actionButtonsStyles.centeredRow,
          ]}
        >
          {donateButtons[0] && (
            <View style={actionButtonsStyles.singleButtonContainer}>
              <ActionButton
                button={donateButtons[0]}
                animationValue={animations.buttonAnimations[0]}
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
