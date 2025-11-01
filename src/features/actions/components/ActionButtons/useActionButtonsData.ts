/**
 * BUSINESS LOGIC HOOK - Gestione dati e logica ActionButtons
 * Separa completamente la logica business dalla UI
 */

import { useCallback, useMemo, useState } from 'react';
import type { ContributeTabScreenProps } from '../../types/ContributeScreenTypes';
import type { ButtonData } from '../shared/ActionButtonTypes';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { Colors } from '@/shared/constants';

export interface ActionButtonsData {
  // Data arrays
  donateButtons: ButtonData[];
  exploreButtons: ButtonData[];
  communityButtons: ButtonData[];

  // Modal state
  showInfoModal: boolean;

  // Handlers
  handleButtonPress: (button: ButtonData) => Promise<void>;
  handleInfoPress: () => Promise<void>;
  handleInfoModalClose: () => void;
  openCommunityRegistration: () => void;
}

/**
 * Hook che centralizza tutta la logica business dei bottoni
 * - Gestione dati dei bottoni
 * - Handlers per le azioni
 * - Stato dei modali
 * - Logica di navigazione
 */
export const useActionButtonsData = (
  navigation: ContributeTabScreenProps['navigation']
): ActionButtonsData => {
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

  // DONATE BUTTONS DATA
  const donateButtons = useMemo(
    () => [
      {
        id: 'dona',
        title: 'Dona Ora',
        icon: 'heart',
        gradient: Colors.gradients.donate,
        onPress: () => openDonationLink(),
      },
      {
        id: 'charity-shop',
        title: 'Charity Shop',
        icon: 'shopping',
        gradient: Colors.gradients.shop,
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: 'Gift Cards',
        icon: 'gift',
        gradient: Colors.gradients.shop,
        onPress: () => openGiftCardLink(),
      },
    ],
    [openDonationLink, openShopLink, openGiftCardLink]
  );

  // EXPLORE BUTTONS DATA
  const exploreButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: 'Progetti',
        icon: 'charity',
        gradient: Colors.gradients.projects,
        onPress: () => openProjectsLink(),
      },
      {
        id: 'tracciabilita',
        title: 'Tracciabilità',
        icon: 'map-marker-path',
        gradient: Colors.gradients.tracking,
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'calendario',
        title: 'Eventi',
        icon: 'calendar',
        gradient: Colors.gradients.events,
        onPress: () => openEventsLink(),
      },
    ],
    [openProjectsLink, openEventsLink, openTracciabilitaLink]
  );

  // COMMUNITY REGISTRATION HANDLER
  const openCommunityRegistration = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/register?redirect=https%3A%2F%2Friseagainsthunger.org.welfare4charity.com%2Fcharity%2Fecommerce',
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLink]);

  // COMMUNITY BUTTONS DATA
  const communityButtons = useMemo(
    () => [
      {
        id: 'seguici',
        title: 'Seguici',
        icon: 'share-variant',
        gradient: Colors.gradients.community,
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'chi-siamo',
        title: 'Chi Siamo',
        icon: 'information',
        gradient: Colors.gradients.community,
        onPress: () => navigation.navigate('ChiSiamo'),
      },
    ],
    [navigation]
  );

  // BUTTON PRESS HANDLER WITH HAPTIC FEEDBACK
  const handleButtonPress = useCallback(
    async (button: ButtonData) => {
      await triggerHaptic('medium');
      button.onPress();
    },
    [triggerHaptic]
  );

  // INFO MODAL HANDLERS
  const handleInfoPress = useCallback(async () => {
    await triggerHaptic('light');
    setShowInfoModal(true);
  }, [triggerHaptic]);

  const handleInfoModalClose = useCallback(() => {
    setShowInfoModal(false);
  }, []);

  return {
    // Data
    donateButtons,
    exploreButtons,
    communityButtons,

    // Modal state
    showInfoModal,

    // Handlers
    handleButtonPress,
    handleInfoPress,
    handleInfoModalClose,
    openCommunityRegistration,
  };
};
