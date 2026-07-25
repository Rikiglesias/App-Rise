/**
 * BUSINESS LOGIC HOOK - Gestione dati e logica ActionButtons
 * Separa completamente la logica business dalla UI
 */

import { useCallback, useMemo, useState } from 'react';
import type { ContributeTabScreenProps } from '../../ContributeScreenTypes';
import type { ButtonData } from '../shared/ActionButtonTypes';
import { useHapticFeedback } from '@/shared/hooks/useHapticFeedback';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { usePartnerExit } from '@/shared/partner/usePartnerExit';
import { Colors } from '@/shared/constants';
import { RISE_URLS } from '@/shared/constants/urls';
import { useTranslation } from '@/shared/hooks/useTranslation';

export interface ActionButtonsData {
  // Data arrays
  donateButtons: ButtonData[];
  exploreButtons: ButtonData[];
  communityButtons: ButtonData[];

  // Modal "Come donare" (info categorie)
  showInfoModal: boolean;

  /** Un'uscita è in preparazione: il pulsante va disabilitato finché non parte. */
  isExiting: boolean;

  // Schermata onesta pre-redirect Let's Donation (F1.7d)
  disclosureVisible: boolean;

  // Handlers
  handleButtonPress: (button: ButtonData) => Promise<void>;
  handleInfoPress: () => Promise<void>;
  handleInfoModalClose: () => void;
  openCommunityRegistration: () => void;
  confirmDisclosure: () => Promise<void>;
  cancelDisclosure: () => void;
}

/**
 * Hook che centralizza tutta la logica business dei bottoni.
 * Le uscite verso i partner passano da usePartnerExit (goal partner-identita, F1.7):
 * - "Dona" → Donorbox con rise_ref + prefill (nessuna schermata onesta, è ospite).
 * - shop/gift card/progetti/eventi/community → Let's Donation con rise_ref e schermata
 *   onesta una volta per utente (doppia registrazione).
 * - "Tracciabilità" resta un link al sito Rise (non è un partner) → useLinkHandler.
 */
export const useActionButtonsData = (
  navigation: ContributeTabScreenProps['navigation']
): ActionButtonsData => {
  const { triggerHaptic } = useHapticFeedback();
  const { t } = useTranslation();
  const { openTracciabilitaLink } = useLinkHandler();
  const {
    disclosureVisible,
    isExiting,
    openDonation,
    openLetsDonationExit,
    confirmDisclosure,
    cancelDisclosure,
  } = usePartnerExit();

  const [showInfoModal, setShowInfoModal] = useState(false);

  // DONATE BUTTONS DATA
  const donateButtons = useMemo(
    () => [
      {
        id: 'dona',
        title: t('actions.donateNow'),
        icon: 'heart',
        gradient: Colors.gradients.donate,
        onPress: () => openDonation(),
      },
      {
        id: 'charity-shop',
        title: t('actions.charityShop'),
        icon: 'shopping',
        gradient: Colors.gradients.shop,
        onPress: () =>
          openLetsDonationExit(
            RISE_URLS.shop,
            'shop',
            'Impossibile aprire il charity shop. Riprova più tardi.'
          ),
      },
      {
        id: 'gift-card',
        title: t('actions.giftCards'),
        icon: 'gift',
        gradient: Colors.gradients.shop,
        onPress: () =>
          openLetsDonationExit(
            RISE_URLS.giftCards,
            'giftcard',
            'Impossibile aprire le gift card. Riprova più tardi.'
          ),
      },
    ],
    [t, openDonation, openLetsDonationExit]
  );

  // EXPLORE BUTTONS DATA
  const exploreButtons = useMemo(
    () => [
      {
        id: 'progetti',
        title: t('actions.projects'),
        icon: 'charity',
        gradient: Colors.gradients.projects,
        onPress: () =>
          openLetsDonationExit(
            RISE_URLS.projects,
            'projects',
            'Impossibile aprire la pagina progetti. Riprova più tardi.'
          ),
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
        onPress: () =>
          openLetsDonationExit(
            RISE_URLS.events,
            'events',
            'Impossibile aprire il calendario eventi. Riprova più tardi.'
          ),
      },
    ],
    [t, openLetsDonationExit, openTracciabilitaLink]
  );

  // COMMUNITY REGISTRATION HANDLER (Let's Donation → schermata onesta + ref)
  const openCommunityRegistration = useCallback(() => {
    void openLetsDonationExit(
      RISE_URLS.communityRegister,
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLetsDonationExit]);

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
    disclosureVisible,
    isExiting,

    // Handlers
    handleButtonPress,
    handleInfoPress,
    handleInfoModalClose,
    openCommunityRegistration,
    confirmDisclosure,
    cancelDisclosure,
  };
};
