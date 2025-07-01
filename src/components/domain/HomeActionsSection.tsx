import React from 'react';
import { View } from 'react-native';

import { FormattedText } from '../ui';

import { useHomeActionsLogic } from '../../features/actions/hooks/useHomeActionsHooks';
import type {
  HomeActionsSectionProps,
  ActionData,
} from '../../features/actions/types/HomeActionsTypes';
import { BentoActionCard } from './HomeActionsSubComponents';

// ===================================================================
// MAIN COMPONENT - Now ultra-clean and focused
// ===================================================================
export const HomeActionsSection: React.FC<HomeActionsSectionProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
}) => {
  const { containerStyles, typographyStyles, cardStyles, actions } =
    useHomeActionsLogic({
      onShopPress,
      onGiftCardPress,
      onEventsPress,
      onProjectsPress,
    });

  return (
    <View style={containerStyles.bentoContainer}>
      {/* 🎪 Header Moderno */}
      <View style={containerStyles.headerSection}>
        <FormattedText
          variant="headline-medium"
          style={typographyStyles.bentoTitle}
        >
          🚀 Come Puoi Aiutare
        </FormattedText>
        <FormattedText
          variant="body-large"
          style={typographyStyles.bentoSubtitle}
        >
          Ogni gesto conta per costruire un mondo senza fame
        </FormattedText>
      </View>

      {/* 🏗️ Bento Grid */}
      <View style={containerStyles.bentoGrid}>
        {actions.map((action: ActionData) => (
          <BentoActionCard
            key={action.id}
            action={action}
            cardStyles={cardStyles}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeActionsSection;
