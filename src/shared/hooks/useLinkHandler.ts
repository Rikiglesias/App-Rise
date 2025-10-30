import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';

import {
  isSuccess,
  retry,
  safeAsync,
  withTimeout,
  type AsyncResult,
} from '../utils/result';
import { logWarn, logError } from '../utils/logger';
import { RISE_URLS, SOCIAL_URLS } from '../constants/urls';
import { useHapticFeedback } from './useHapticFeedback';

interface UseLinkHandlerOptions {
  defaultErrorMessage?: string;
  loadingDelay?: number;
  enableHaptics?: boolean;
  timeout?: number;
  retryAttempts?: number;
}

interface UseLinkHandlerReturn {
  isLoading: string | null;
  openLink: (
    url: string,
    loadingKey: string,
    errorMessage?: string
  ) => AsyncResult<void>;
  openDonationLink: () => AsyncResult<void>;
  openShopLink: () => AsyncResult<void>;
  openGiftCardLink: () => AsyncResult<void>;
  openEventsLink: () => AsyncResult<void>;
  openProjectsLink: () => AsyncResult<void>;
  openTracciabilitaLink: () => AsyncResult<void>;
  openFacebookLink: () => AsyncResult<void>;
  openInstagramLink: () => AsyncResult<void>;
  openYouTubeLink: () => AsyncResult<void>;
  openLinkedInLink: () => AsyncResult<void>;
  openWebsiteLink: () => AsyncResult<void>;
}

export const useLinkHandler = (
  options: UseLinkHandlerOptions = {}
): UseLinkHandlerReturn => {
  const {
    defaultErrorMessage = 'Impossibile aprire il link. Riprova più tardi.',
    loadingDelay = 0, // AZZERATO: apertura istantanea dei link
    enableHaptics = true,
    timeout = 10000,
    retryAttempts = 1,
  } = options;

  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { lightTap } = useHapticFeedback();

  // Allowlist domini: applicata in produzione, rilassata in sviluppo
  const allowedDomains = useMemo(
    () =>
      new Set<string>([
        'italy.riseagainsthunger.org',
        'www.riseagainsthunger.it',
        'riseagainsthunger.org',
        'riseagainsthunger.org.welfare4charity.com',
        'instagram.com',
        'www.instagram.com',
        'facebook.com',
        'www.facebook.com',
        'youtube.com',
        'www.youtube.com',
        'linkedin.com',
        'www.linkedin.com',
        'maps.google.com',
        'www.riseagainsthunger.it',
      ]),
    []
  );

  const isUrlAllowed = useCallback(
    (url: string): boolean => {
      if (__DEV__) return true;
      try {
        const u = new URL(url);
        return allowedDomains.has(u.hostname.toLowerCase());
      } catch {
        return false;
      }
    },
    [allowedDomains]
  );

  const triggerHaptic = useCallback(() => {
    if (!enableHaptics) {
      return Promise.resolve({
        success: true as const,
        data: undefined as void,
      });
    }
    return safeAsync(async () => {
      await lightTap();
    });
  }, [enableHaptics, lightTap]);

  const performLinkOpen = useCallback(
    (url: string) => {
      return withTimeout(
        async () => {
          if (!isUrlAllowed(url)) {
            throw new Error(`Dominio non consentito: ${url}`);
          }
          const supported = await Linking.canOpenURL(url);
          if (!supported) {
            throw new Error(`URL non supportato: ${url}`);
          }
          await Linking.openURL(url);
        },
        timeout,
        `Timeout nell'apertura del link: ${url}`
      );
    },
    [timeout, isUrlAllowed]
  );

  // Generic link opener with Result pattern
  const openLink = useCallback(
    async (url: string, loadingKey: string, errorMessage?: string) => {
      setIsLoading(loadingKey);

      try {
        // Step 1: Trigger haptic feedback
        const hapticResult = await triggerHaptic();
        if (!isSuccess(hapticResult)) {
          // Haptic failure is non-critical, log and continue
          if (__DEV__) {
            // eslint-disable-next-line no-console
            logWarn(
              'LinkHandler',
              'Haptic feedback failed',
              hapticResult.error
            );
          }
        }

        // Step 2: Loading delay for visual feedback
        if (loadingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, loadingDelay));
        }

        // Step 3: Attempt to open link with retry
        const linkResult = await retry(
          () => performLinkOpen(url),
          retryAttempts,
          1000
        );

        if (!isSuccess(linkResult)) {
          // Show user-friendly error
          Alert.alert('Errore', errorMessage ?? defaultErrorMessage);

          // Log detailed error for debugging
          if (__DEV__) {
            logError(
              'LinkHandler',
              `Failed to open URL: ${url}`,
              linkResult.error
            );
          }

          return linkResult;
        }

        return linkResult;
      } finally {
        setIsLoading(null);
      }
    },
    [
      triggerHaptic,
      loadingDelay,
      performLinkOpen,
      retryAttempts,
      defaultErrorMessage,
    ]
  );

  // Predefined link handlers for common actions
  const openDonationLink = useCallback(() => {
    return openLink(
      RISE_URLS.donation,
      'donation',
      'Impossibile aprire il link di donazione. Riprova più tardi.'
    );
  }, [openLink]);

  const openShopLink = useCallback(() => {
    return openLink(
      RISE_URLS.shop,
      'shop',
      'Impossibile aprire il charity shop. Riprova più tardi.'
    );
  }, [openLink]);

  const openGiftCardLink = useCallback(() => {
    return openLink(
      RISE_URLS.giftCards,
      'giftcard',
      'Impossibile aprire le gift card. Riprova più tardi.'
    );
  }, [openLink]);

  const openEventsLink = useCallback(() => {
    return openLink(
      RISE_URLS.events,
      'events',
      'Impossibile aprire il calendario eventi. Riprova più tardi.'
    );
  }, [openLink]);

  const openProjectsLink = useCallback(() => {
    return openLink(
      RISE_URLS.projects,
      'projects',
      'Impossibile aprire la pagina progetti. Riprova più tardi.'
    );
  }, [openLink]);

  const openFacebookLink = useCallback(() => {
    return openLink(
      SOCIAL_URLS.facebook,
      'facebook',
      'Impossibile aprire Facebook. Riprova più tardi.'
    );
  }, [openLink]);

  const openInstagramLink = useCallback(() => {
    return openLink(
      SOCIAL_URLS.instagram,
      'instagram',
      'Impossibile aprire Instagram. Riprova più tardi.'
    );
  }, [openLink]);

  const openYouTubeLink = useCallback(() => {
    return openLink(
      SOCIAL_URLS.youtube,
      'youtube',
      'Impossibile aprire YouTube. Riprova più tardi.'
    );
  }, [openLink]);

  const openLinkedInLink = useCallback(() => {
    return openLink(
      SOCIAL_URLS.linkedin,
      'linkedin',
      'Impossibile aprire LinkedIn. Riprova più tardi.'
    );
  }, [openLink]);

  const openWebsiteLink = useCallback(() => {
    return openLink(
      RISE_URLS.italyWebsite,
      'website',
      'Impossibile aprire il sito web. Riprova più tardi.'
    );
  }, [openLink]);

  const openTracciabilitaLink = useCallback(() => {
    return openLink(
      RISE_URLS.tracciabilita,
      'tracciabilita',
      'Impossibile aprire la pagina tracciabilità. Riprova più tardi.'
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
    openTracciabilitaLink,
    openFacebookLink,
    openInstagramLink,
    openYouTubeLink,
    openLinkedInLink,
    openWebsiteLink,
  };
};
