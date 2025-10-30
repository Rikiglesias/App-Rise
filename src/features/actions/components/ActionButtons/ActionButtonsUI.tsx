/**
 * UI COMPONENT - Rendering puro ActionButtons
 * Componente UI separato dalla logica business
 */

import React, { useMemo } from 'react';

import { createActionButtonStyles } from '../components/ActionButtonStyles';
import {
  DonateButtonsSection,
  ExploreButtonsSection,
  CommunityButtonsSection,
} from '../components/ActionButtonSections';
import {
  FirstSectionDivider,
  SectionDivider,
} from '../components/ActionButtonUtils';
import type { useNewActionsAnimations } from '../components/ContributeAnimations';
import type { ActionButtonsData } from './useActionButtonsData';
import { PerfectContainer } from '@/components/ui';

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

  return (
    <PerfectContainer style={styles.container}>
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
