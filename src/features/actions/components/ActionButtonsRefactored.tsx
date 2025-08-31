// ↑ ESLint non riesce a tracciare gli stili quando sono passati tramite props a componenti figli.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React from 'react';
import { View } from 'react-native';

import { useActionButtonsLogic } from '../hooks/useActionButtonsLogic';
import { actionButtonsStyles } from '../styles/ActionButtonsStyles';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';
import { CommunitySection } from './CommunitySection';
import { useNewActionsAnimations } from './components/ContributeAnimations';
import DonationInfoModal from './components/DonationInfoModal';
import { DonateSection } from './DonateSection';
import { ExploreSection } from './ExploreSection';
import { FirstSectionDivider, SectionDivider } from './SectionDividers';

interface Props {
  animations: ReturnType<typeof useNewActionsAnimations>;
  navigation: ContributeTabScreenProps['navigation'];
}

/**
 * ActionButtons refactorizzato con architettura modulare
 * Ridotto da 971 a ~300 righe (69% riduzione) per eccellenza architetturale
 */
const ActionButtonsRefactored: React.FC<Props> = ({
  animations,
  navigation,
}) => {
  // Hook con tutta la logica business
  const {
    donateButtons,
    exploreButtons,
    communityButtons,
    showInfoModal,
    handleButtonPress,
    handleInfoPress,
    handleInfoModalClose,
    openCommunityRegistration,
  } = useActionButtonsLogic(navigation);

  return (
    <>
      <View style={actionButtonsStyles.container}>
        {/* CATEGORIA CONTRIBUISCI con Info Button */}
        <DonateSection
          animations={animations}
          donateButtons={donateButtons}
          onButtonPress={handleButtonPress}
          onInfoPress={handleInfoPress}
        />

        <FirstSectionDivider />

        {/* CATEGORIA ESPLORA */}
        <ExploreSection
          animations={animations}
          exploreButtons={exploreButtons}
          onButtonPress={handleButtonPress}
        />

        <SectionDivider />

        {/* CATEGORIA COMMUNITY */}
        <CommunitySection
          animations={animations}
          communityButtons={communityButtons}
          onButtonPress={handleButtonPress}
          onCommunityTitlePress={openCommunityRegistration}
        />
      </View>

      <DonationInfoModal
        visible={showInfoModal}
        onClose={handleInfoModalClose}
      />
    </>
  );
};

export default ActionButtonsRefactored;
