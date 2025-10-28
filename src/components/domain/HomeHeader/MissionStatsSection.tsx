/**
 * MISSION STATS SECTION - Componente modulare
 * Sezione statistiche della missione (pasti e volontari)
 */

import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { View } from 'react-native';

import { PlatformTouchable, PerfectText } from '../../ui';
import { HomeHeaderDesignTokens } from '../design-tokens/HomeHeaderTokens';
import { baseMissionStyles } from '../styles/HeaderMissionStyles';

interface MissionStatsSectionProps {
  onMealsPress: () => void;
}

export const MissionStatsSection: React.FC<MissionStatsSectionProps> =
  React.memo(({ onMealsPress }) => (
    <View style={baseMissionStyles.statsContainer}>
      {/* Container pasti - CLICKABLE */}
      <PlatformTouchable
        style={[baseMissionStyles.statsBox, baseMissionStyles.mealsBox]}
        onPress={onMealsPress}
        activeOpacity={0.8}
      >
        <PerfectText
          size={32}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={[baseMissionStyles.statNumber, { fontWeight: '600' }]}
        >
          3.14M
        </PerfectText>
        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={baseMissionStyles.statLabel}
        >
          Pasti distribuiti
        </PerfectText>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={HomeHeaderDesignTokens.colors.primary}
          style={baseMissionStyles.infoIcon}
        />
      </PlatformTouchable>

      {/* Container volontari - STATICO */}
      <View
        style={[baseMissionStyles.statsBox, baseMissionStyles.volunteersBox]}
      >
        <PerfectText
          size={32}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={[baseMissionStyles.statNumber, { fontWeight: '600' }]}
        >
          13K
        </PerfectText>
        <PerfectText
          size={14}
          lines={1}
          fontWeight="400"
          immunity={true}
          style={baseMissionStyles.statLabel}
        >
          Volontari attivi
        </PerfectText>
      </View>
    </View>
  ));

MissionStatsSection.displayName = 'MissionStatsSection';
