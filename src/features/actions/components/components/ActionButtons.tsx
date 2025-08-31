// ↑ ESLint non riesce a tracciare gli stili quando sono passati tramite props a componenti figli.
// Tutti gli stili in questo file sono verificati manualmente come utilizzati.

import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../../../shared/hooks/useLinkHandler';
import type {
  NewActionButtonsSectionProps,
  ActionButtonsContentProps,
  ButtonData,
} from './ActionButtonTypes';
import { createActionButtonStyles } from './ActionButtonStyles';
import {
  DonateButtonsSection,
  ExploreButtonsSection,
  CommunityButtonsSection,
} from './ActionButtonSections';
import { FirstSectionDivider, SectionDivider } from './ActionButtonUtils';
import DonationInfoModal from './DonationInfoModal';

const NewActionButtonsSection: React.FC<NewActionButtonsSectionProps> = ({
  animations,
  navigation,
}) => {
  const { triggerHaptic } = useHapticFeedback();
  const {
    openLink,
    openDonationLink,
    openEventsLink,
    openShopLink,
    openGiftCardLink,
    openProjectsLink,
    openTracciabilitaLink,
  } = useLinkHandler();
  const [showInfoModal, setShowInfoModal] = useState(false);

  const donateButtons = useMemo(
    () => [
      {
        id: 'dona',
        title: 'Dona Ora',
        icon: 'heart',
        gradient: ['#E11D48', '#DC2626', '#B91C1C'] as const, // ROSSO PRINCIPALE più vibrante
        onPress: () => openDonationLink(),
      },
      {
        id: 'charity-shop',
        title: 'Charity Shop',
        icon: 'shopping',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const, // ROSSO STANDARD
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: 'Gift Cards',
        icon: 'gift',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const, // ROSSO STANDARD
        onPress: () => openGiftCardLink(),
      },
    ],
    [openDonationLink, openShopLink, openGiftCardLink]
  );

  const exploreButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: 'Progetti',
        icon: 'charity',
        gradient: ['#0F766E', '#0D9488', '#14B8A6'] as const, // TEAL per progetti
        onPress: () => openProjectsLink(),
      },
      {
        id: 'tracciabilita',
        title: 'Tracciabilità',
        icon: 'map-marker-path',
        gradient: ['#1565C0', '#1976D2', '#2196F3'] as const, // BLU per tracciabilità
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'calendario',
        title: 'Eventi',
        icon: 'calendar',
        gradient: ['#7C3AED', '#8B5CF6', '#A855F7'] as const, // VIOLA per eventi
        onPress: () => openEventsLink(),
      },
    ],
    [openProjectsLink, openEventsLink, openTracciabilitaLink]
  );

  const openCommunityRegistration = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/register?redirect=https%3A%2F%2Friseagainsthunger.org.welfare4charity.com%2Fcharity%2Fecommerce',
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLink]);

  const communityButtons = useMemo(
    () => [
      {
        id: 'seguici',
        title: 'Seguici',
        icon: 'share-variant',
        gradient: ['#1F2937', '#374151', '#4B5563'] as const, // NERO per social
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'chi-siamo',
        title: 'Chi Siamo',
        icon: 'information',
        gradient: ['#1F2937', '#374151', '#4B5563'] as const, // GRIGIO SCURO per info
        onPress: () => navigation.navigate('ChiSiamo'),
      },
    ],
    [navigation]
  );

  const handleButtonPress = useCallback(
    async (button: ButtonData) => {
      await triggerHaptic('medium');
      button.onPress();
    },
    [triggerHaptic]
  );

  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    setShowInfoModal(true);
  }, [triggerHaptic]);

  const handleInfoModalClose = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  return (
    <>
      <ActionButtonsContent
        animations={animations}
        donateButtons={donateButtons}
        exploreButtons={exploreButtons}
        communityButtons={communityButtons}
        onButtonPress={handleButtonPress}
        onInfoPress={handleInfoPress}
        onCommunityTitlePress={openCommunityRegistration}
      />
      <DonationInfoModal
        visible={showInfoModal}
        onClose={handleInfoModalClose}
      />
    </>
  );
};

// Componente separato per il contenuto dei bottoni
const ActionButtonsContent: React.FC<ActionButtonsContentProps> = ({
  animations,
  donateButtons,
  exploreButtons,
  communityButtons,
  onButtonPress,
  onInfoPress,
  onCommunityTitlePress,
}) => {
  const styles = useMemo(() => createActionButtonStyles(), []);

  return (
    <View style={styles.container}>
      {/* CATEGORIA CONTRIBUISCI con Info Button */}
      <DonateButtonsSection
        styles={styles}
        animations={animations}
        donateButtons={donateButtons}
        onButtonPress={onButtonPress}
        onInfoPress={onInfoPress}
      />

      <FirstSectionDivider styles={styles} />

      {/* CATEGORIA ESPLORA */}
      <ExploreButtonsSection
        styles={styles}
        animations={animations}
        exploreButtons={exploreButtons}
        onButtonPress={onButtonPress}
      />

      <SectionDivider styles={styles} />

      {/* CATEGORIA COMMUNITY */}
      <CommunityButtonsSection
        styles={styles}
        animations={animations}
        communityButtons={communityButtons}
        onButtonPress={onButtonPress}
        onCommunityTitlePress={onCommunityTitlePress}
      />
    </View>
  );
};

export default NewActionButtonsSection;
