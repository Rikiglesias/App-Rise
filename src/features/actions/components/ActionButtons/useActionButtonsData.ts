/**
 * BUSINESS LOGIC HOOK - Gestione dati e logica ActionButtons
 * Separa completamente la logica business dalla UI
 */

import { useCallback, useMemo, useState } from 'react';
import type { ContributeTabScreenProps } from '../../ContributeScreenTypes';
import type { ButtonData } from '../shared/ActionButtonTypes';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { Colors } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useTranslation } from '@/shared/hooks/useTranslation';

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
  const { t } = useTranslation();
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
        title: t('actions.donateNow'),
        icon: 'heart',
        gradient: Colors.gradients.donate,
        onPress: () => openDonationLink(),
      },
      {
        id: 'charity-shop',
        title: t('actions.charityShop'),
        icon: 'shopping',
        gradient: Colors.gradients.shop,
        onPress: () => openShopLink(),
      },
      {
        id: 'gift-card',
        title: t('actions.giftCards'),
        icon: 'gift',
        gradient: Colors.gradients.shop,
        onPress: () => openGiftCardLink(),
      },
    ],
    [t, openDonationLink, openShopLink, openGiftCardLink]
  );

  // EXPLORE BUTTONS DATA
  const exploreButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: t('actions.projects'),
        icon: 'charity',
        gradient: Colors.gradients.projects,
        onPress: () => openProjectsLink(),
      },
      {
        id: 'tracciabilita',
        title: t('actions.tracking'),
        icon: 'map-marker-path',
        gradient: Colors.gradients.tracking,
        onPress: () => openTracciabilitaLink(),
      },
      {
        id: 'calendario',
        title: t('actions.events'),
        icon: 'calendar',
        gradient: Colors.gradients.events,
        onPress: () => openEventsLink(),
      },
    ],
    [t, openProjectsLink, openTracciabilitaLink, openEventsLink]
  );

  // COMMUNITY REGISTRATION HANDLER
  const openCommunityRegistration = useCallback(() => {
    return openLink(
      RISE_URLS.communityRegister,
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLink]);

  // COMMUNITY BUTTONS DATA
  const communityButtons = useMemo(
    () => [
      {
        id: 'seguici',
        title: t('actions.follow'),
        icon: 'share-variant',
        gradient: Colors.gradients.community,
        onPress: () => navigation.navigate('Seguici'),
      },
      {
        id: 'chi-siamo',
        title: t('actions.aboutUs'),
        icon: 'information',
        gradient: Colors.gradients.community,
        onPress: () => navigation.navigate('ChiSiamo'),
      },
    ],
    [t, navigation]
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
