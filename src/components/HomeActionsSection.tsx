import React from 'react';
import { Text, View } from 'react-native';

import { useHomeActionsLogic } from '../hooks/useHomeActionsHooks';
import type { HomeActionsSectionProps } from '../types/HomeActionsTypes';
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
        <Text style={typographyStyles.bentoTitle}>🚀 Come Puoi Aiutare</Text>
        <Text style={typographyStyles.bentoSubtitle}>
          Ogni gesto conta per costruire un mondo senza fame
        </Text>
      </View>

      {/* 🏗️ Bento Grid */}
      <View style={containerStyles.bentoGrid}>
        {actions.map(action => (
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
