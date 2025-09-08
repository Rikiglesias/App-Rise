/**
 * BUSINESS LOGIC HOOK - Gestione dati e logica ActionButtons
 * Separa completamente la logica business dalla UI
 */

import { useCallback, useMemo, useState } from 'react';
import type { ContributeTabScreenProps } from '../../types/ContributeScreenTypes';
import { useHapticFeedback } from '../../../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../../../shared/hooks/useLinkHandler';
import type { ButtonData } from '../components/ActionButtonTypes';

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
        gradient: ['#E11D48', '#DC2626', '#B91C1C'] as const,
        onPress: () => openDonationLink(),
      },
      {
        id: 'charity-shop',
        title: 'Charity Shop',
        icon: 'shopping',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const,
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: 'Gift Cards',
        icon: 'gift',
        gradient: ['#DC2626', '#B91C1C', '#991B1B'] as const,
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
        gradient: ['#0F766E', '#0D9488', '#14B8A6'] as const,
        onPress: () => openProjectsLink(),
      },
      {
        id: 'tracciabilita',
        title: 'Tracciabilità',
        icon: 'map-marker-path',
        gradient: ['#1565C0', '#1976D2', '#2196F3'] as const,
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'calendario',
        title: 'Eventi',
        icon: 'calendar',
        gradient: ['#7C3AED', '#8B5CF6', '#A855F7'] as const,
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
        gradient: ['#1F2937', '#374151', '#4B5563'] as const,
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'chi-siamo',
        title: 'Chi Siamo',
        icon: 'information',
        gradient: ['#1F2937', '#374151', '#4B5563'] as const,
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
