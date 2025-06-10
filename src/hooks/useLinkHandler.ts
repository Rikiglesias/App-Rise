import { useCallback, useState } from 'react';
import { Alert, Linking } from 'react-native';
import { useHapticFeedback } from './useHapticFeedback';

interface UseLinkHandlerOptions {
  defaultErrorMessage?: string;
  loadingDelay?: number;
  enableHaptics?: boolean;
}

interface UseLinkHandlerReturn {
  isLoading: string | null;
  openLink: (
    url: string,
    loadingKey: string,
    errorMessage?: string
  ) => Promise<void>;
  openDonationLink: () => Promise<void>;
  openShopLink: () => Promise<void>;
  openGiftCardLink: () => Promise<void>;
  openEventsLink: () => Promise<void>;
  openProjectsLink: () => Promise<void>;
}

export const useLinkHandler = (
  options: UseLinkHandlerOptions = {}
): UseLinkHandlerReturn => {
  const {
    defaultErrorMessage = 'Impossibile aprire il link. Riprova più tardi.',
    loadingDelay = 150,
    enableHaptics = true,
  } = options;

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { lightTap } = useHapticFeedback();

  // Haptic feedback function using the existing hook
  const triggerHaptic = useCallback(() => {
    if (enableHaptics) {
      lightTap();
    }
  }, [enableHaptics, lightTap]);

  // Generic link opener with loading states and error handling
  const openLink = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      try {
        setIsLoading(loadingKey);
        triggerHaptic();

        // Small delay for visual feedback
        if (loadingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, loadingDelay));
        }

        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          throw new Error('URL non supportato');
        }
      } catch (err) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.error(`[LinkHandler] Failed to open URL: ${url}`, {
            error: err,
            loadingKey,
            timestamp: new Date().toISOString(),
          });
        }
        Alert.alert('Errore', errorMessage || defaultErrorMessage);
      } finally {
        setIsLoading(null);
      }
    },
    [triggerHaptic, loadingDelay, defaultErrorMessage]
  );

  // Predefined link handlers for common actions
  const openDonationLink = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.welfare4charity.com/crowdfunding',
      'donation',
      'Impossibile aprire il link di donazione. Riprova più tardi.'
    );
  }, [openLink]);

  const openShopLink = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/charity/ecommerce',
      'shop',
      'Impossibile aprire il charity shop. Riprova più tardi.'
    );
  }, [openLink]);

  const openGiftCardLink = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/charity/giftcards',
      'giftcard',
      'Impossibile aprire le gift card. Riprova più tardi.'
    );
  }, [openLink]);

  const openEventsLink = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.org.welfare4charity.com/organization/events',
      'events',
      'Impossibile aprire il calendario eventi. Riprova più tardi.'
    );
  }, [openLink]);

  const openProjectsLink = useCallback(() => {
    return openLink(
      'https://riseagainsthunger.welfare4charity.com/crowdfunding',
      'projects',
      'Impossibile aprire la pagina progetti. Riprova più tardi.'
    );
  }, [openLink]);

  return {
    isLoading,
    openLink,
    openDonationLink,
    openShopLink,
    openGiftCardLink,
    openEventsLink,
    openProjectsLink,
  };
};
