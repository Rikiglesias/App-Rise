import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { PerfectText } from '../../../components/ui';
import { Spacing } from '../../../shared/constants';
import type { ButtonData } from '../hooks/useActionButtonsLogic';
import { actionButtonsStyles } from '../styles/ActionButtonsStyles';
import { getExploreIconColor } from '../utils/buttonHelpers';
import { ActionButton } from './ActionButton';
import type { useNewActionsAnimations } from './components/ContributeAnimations';

interface Props {
  animations: ReturnType<typeof useNewActionsAnimations>;
  exploreButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
}

/**
 * Sezione esplora con layout specifico: 2 bottoni sopra + 1 bottone largo sotto
 */
export const ExploreSection: React.FC<Props> = ({
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
    <View
      style={[
        actionButtonsStyles.categoryContainer,
        { marginTop: -Spacing[1] },
      ]}
    >
      <View style={actionButtonsStyles.categoryHeader}>
        <View
          style={
            Platform.OS === 'android'
              ? [
                  actionButtonsStyles.exploreHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore
                  },
                ]
              : actionButtonsStyles.exploreHeaderBackground
          }
        >
          <PerfectText
            size={22}
            lines={1}
            immunity={true}
            lineBreakStrategyIOS="push-out"
            style={actionButtonsStyles.exploreTitle}
          >
            🔍 Esplora
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            immunity={true}
            lineBreakStrategyIOS="push-out"
            style={actionButtonsStyles.exploreSubtitle}
          >
            Progetti e iniziative umanitarie
          </PerfectText>
        </View>
      </View>
      <View style={actionButtonsStyles.buttonsGrid}>
        {/* Prima riga: Progetti, Eventi */}
        <View style={actionButtonsStyles.buttonRow}>
          {[exploreButtons[0], exploreButtons[2]].map((button, index) => {
            if (!button) return null;
            const animationValue =
              animations.buttonAnimations[index === 0 ? 3 : 5];
            const onPress = handleFirstRowButtons[index];
            const iconColorIndex = index === 0 ? 0 : 2; // 0 per Progetti, 2 per Eventi
            if (animationValue && onPress) {
              return (
                <ActionButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
                  onPress={onPress}
                  iconColor={getExploreIconColor(iconColorIndex)}
                />
              );
            }
            return null;
          })}
        </View>
        {/* Seconda riga: Tracciabilità (centrata) */}
        <View
          style={[
            actionButtonsStyles.buttonRow,
            actionButtonsStyles.centeredRow,
          ]}
        >
          {exploreButtons[1] && (
            <View style={actionButtonsStyles.singleButtonContainer}>
              <ActionButton
                button={exploreButtons[1]}
                animationValue={animations.buttonAnimations[4]}
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
