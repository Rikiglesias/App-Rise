import { useCallback, useMemo, useState } from 'react';

import { useHapticFeedback } from '../../../shared/hooks/useHapticFeedback';
import { useLinkHandler } from '../../../shared/hooks/useLinkHandler';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';

export interface ButtonData {
  id: string;
  title: string;
  icon: string;
  gradient: readonly [string, string, string];
  onPress: () => void;
}

/**
 * Hook per gestire la logica business dei bottoni delle azioni
 * Centralizza tutti i link, handlers e stati modali
 */
export const useActionButtonsLogic = (
  navigation: ContributeTabScreenProps['navigation']
) => {
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

  // Bottoni sezione donazioni
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

  // Bottoni sezione esplora
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

  // Bottoni sezione community
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

  // Registrazione community
  const openCommunityRegistration = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/register?redirect=https%3A%2F%2Friseagainsthunger.org.welfare4charity.com%2Fcharity%2Fecommerce',
      'community-registration',
      'Impossibile aprire la pagina di registrazione. Riprova più tardi.'
    );
  }, [openLink]);

  // Handlers con haptic feedback
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

  return {
    donateButtons,
    exploreButtons,
    communityButtons,
    showInfoModal,
    handleButtonPress,
    handleInfoPress,
    handleInfoModalClose,
    openCommunityRegistration,
  };
};
