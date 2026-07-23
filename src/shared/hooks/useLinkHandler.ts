import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking } from 'react-native';

import { useHapticFeedback } from './useHapticFeedback';
import {
  isSuccess,
  retry,
  safeAsync,
  withTimeout,
  type AsyncResult,
} from '@/shared/utils/result';
import { logWarn, logError } from '@/shared/utils/logger';
import { RISE_URLS, SOCIAL_URLS } from '@/shared/constants/urls';

/**
 * Schemi senza host, ammessi a prescindere dall'allowlist di domini.
 * `new URL('tel:051704070').hostname` è '' → l'allowlist li bloccherebbe, ma
 * solo in produzione (in dev `isUrlAllowed` ritorna sempre true), rendendo il
 * guasto invisibile durante lo sviluppo.
 */
const ALLOWED_SCHEMES = ['tel:', 'mailto:'] as const;

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
        // Let's Donation (dominio nuovo) + ex Welfare4Charity tenuto per la
        // transizione: URL vecchi ancora in circolazione fanno 301 sul nuovo.
        'riseagainsthunger.org.letsdonation.com',
        'riseagainsthunger.org.welfare4charity.com',
        // Donorbox: pronto per l'apertura diretta dell'embed donazioni (F1.7).
        'donorbox.org',
        'instagram.com',
        'www.instagram.com',
        'facebook.com',
        'www.facebook.com',
        'youtube.com',
        'www.youtube.com',
        'linkedin.com',
        'www.linkedin.com',
        'maps.google.com',
      ]),
    []
  );

  const isUrlAllowed = useCallback(
    (url: string): boolean => {
      if (__DEV__) return true;
      // Schemi senza host (tel:/mailto:): l'allowlist di domini non li copre
      // (hostname === '') e li bloccherebbe SOLO in produzione. Sono sicuri:
      // aprono dialer/client mail con valori costanti definiti nel codice.
      if (
        ALLOWED_SCHEMES.some(scheme => url.toLowerCase().startsWith(scheme))
      ) {
        return true;
      }
      try {
        const u = new URL(url);
        // Solo https per il web: un http: su host in allowlist passerebbe il
        // check hostname — innocuo con le costanti attuali, buco reale quando
        // gli URL arriveranno da config remota (F1.5).
        if (u.protocol !== 'https:') return false;
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
          // Unico punto di uscita legittimo: qui l'URL ha già passato l'allowlist.
          // eslint-disable-next-line no-restricted-properties
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
