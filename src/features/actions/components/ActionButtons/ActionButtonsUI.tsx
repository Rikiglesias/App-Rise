/**
 * UI COMPONENT - Rendering puro ActionButtons
 * Componente UI separato dalla logica business
 */

import React, { useMemo } from 'react';

import { createActionButtonStyles } from '../shared/ActionButtonStyles';
import {
  DonateButtonsSection,
  ExploreButtonsSection,
  CommunityButtonsSection,
} from '../shared/ActionButtonSections';
import {
  FirstSectionDivider,
  SectionDivider,
} from '../shared/ActionButtonUtils';
import type { useNewActionsAnimations } from '../shared/ContributeAnimations';
import type { ActionButtonsData } from './useActionButtonsData';
import { PerfectContainer } from '@/components/ui';
import { useDeviceType } from '@/shared/hooks/useDeviceType';

interface ActionButtonsUIProps {
  animations: ReturnType<typeof useNewActionsAnimations>;
  data: ActionButtonsData;
}

/**
 * Componente UI puro per il rendering dei bottoni
 * - Riceve solo dati e handlers tramite props
 * - Non contiene logica business
 * - Focalizzato esclusivamente sul rendering
 */
const ActionButtonsUIComponent: React.FC<ActionButtonsUIProps> = ({
  animations,
  data,
}) => {
  const styles = useMemo(() => createActionButtonStyles(), []);
  const { isTablet } = useDeviceType();

  return (
    <PerfectContainer
      style={[
        styles.container,
        isTablet ? { paddingHorizontal: 0 } : {}, // Rimuovi padding orizzontale su tablet
      ]}
    >
      {/* CATEGORIA CONTRIBUISCI con Info Button */}
      <DonateButtonsSection
        styles={styles}
        animations={animations}
        donateButtons={data.donateButtons}
        onButtonPress={data.handleButtonPress}
        onInfoPress={data.handleInfoPress}
      />

      <FirstSectionDivider styles={styles} />

      {/* CATEGORIA ESPLORA */}
      <ExploreButtonsSection
        styles={styles}
        animations={animations}
        exploreButtons={data.exploreButtons}
        onButtonPress={data.handleButtonPress}
      />

      <SectionDivider styles={styles} />

      {/* CATEGORIA COMMUNITY */}
      <CommunityButtonsSection
        styles={styles}
        animations={animations}
        communityButtons={data.communityButtons}
        onButtonPress={data.handleButtonPress}
        onCommunityTitlePress={data.openCommunityRegistration}
      />
    </PerfectContainer>
  );
};

export const ActionButtonsUI = React.memo(ActionButtonsUIComponent);
