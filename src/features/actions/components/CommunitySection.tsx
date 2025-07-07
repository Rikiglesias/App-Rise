import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';

import { FormattedText, PlatformTouchable } from '../../../components/ui';
import { Spacing } from '../../../shared/constants';
import type { ButtonData } from '../hooks/useActionButtonsLogic';
import { actionButtonsStyles } from '../styles/ActionButtonsStyles';
import { getCommunityIconColor } from '../utils/buttonHelpers';
import { ActionButton } from './ActionButton';
import type { useNewActionsAnimations } from './components/ContributeAnimations';

interface Props {
  animations: ReturnType<typeof useNewActionsAnimations>;
  communityButtons: ButtonData[];
  onButtonPress: (button: ButtonData) => void;
  onCommunityTitlePress: () => void;
}

/**
 * Sezione community con layout specifico: 2 bottoni in una riga + titolo cliccabile
 */
export const CommunitySection: React.FC<Props> = ({
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
    <View
      style={[
        actionButtonsStyles.categoryContainer,
        { marginTop: -Spacing[1] },
      ]}
    >
      <View style={actionButtonsStyles.categoryHeader}>
        <PlatformTouchable
          style={
            Platform.OS === 'android'
              ? [
                  actionButtonsStyles.communityHeaderBackground,
                  {
                    backgroundColor: '#F0F2F3', // Grigio più intenso per maggiore visibilità (identico a Esplora)
                    borderColor: '#DDE1E4', // Grigio più intenso per definizione migliore (identico a Esplora)
                  },
                ]
              : actionButtonsStyles.communityHeaderBackground
          }
          onPress={onCommunityTitlePress}
          activeOpacity={0.8}
        >
          <FormattedText
            variant="headline-small"
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={actionButtonsStyles.communityTitle}
          >
            🤝 Community
          </FormattedText>
          <FormattedText
            fontSize={16}
            lineBreakStrategyIOS="push-out"
            breakStrategyAndroid="highQuality"
            hyphenationFrequencyAndroid="full"
            style={actionButtonsStyles.communitySubtitle}
          >
            Unisciti alla nostra comunità
          </FormattedText>
          <MaterialCommunityIcons
            name="open-in-new"
            size={16}
            color="#1F2937"
            style={actionButtonsStyles.communityChevron}
          />
        </PlatformTouchable>
      </View>
      <View style={actionButtonsStyles.buttonsGrid}>
        {/* Riga unica: Seguici, Chi Siamo */}
        <View style={actionButtonsStyles.buttonRow}>
          {communityButtons.map((button, index) => {
            const animationValue = animations.buttonAnimations[index + 6];
            const onPress = handleCommunityButtons[index];
            if (animationValue && onPress) {
              return (
                <ActionButton
                  key={button.id}
                  button={button}
                  animationValue={animationValue}
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
