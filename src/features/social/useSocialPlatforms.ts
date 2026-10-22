import { useCallback } from 'react';
import { SocialPlatform } from './components/SocialCard';
import { Colors } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { logWarn } from '@/shared/utils/logger';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';
import { SOCIAL_URLS } from '@/shared/constants/urls';

// Raster fallback still available if needed
// import instagramIcon from '@assets/icons/social/instagram.png';
// import linkedinIcon from '@assets/icons/social/linkedin.png';
// import facebookIcon from '@assets/icons/social/facebook.png';

/** «@nome» preso dall'indirizzo che il tocco apre: il nome mostrato non può divergere dal link. */
const handleFromUrl = (url: string): string =>
  `@${url.split('/').filter(Boolean).pop() ?? ''}`;

export const useSocialPlatforms = () => {
  const { t } = useTranslation();
  const {
    openWebsiteLink,
    openInstagramLink,
    openFacebookLink,
    openYouTubeLink,
    openLinkedInLink,
  } = useLinkHandler();

  const wrap = useCallback(
    (fn: () => Promise<unknown>): (() => Promise<void>) => {
      return async () => {
        try {
          await fn();
        } catch (error) {
          logWarn('open link failed', 'SocialPlatforms', error);
        }
      };
    },
    []
  );

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'website',
      name: t('social.websiteName'),
      handle: 'italy.riseagainsthunger.org',
      description: t('social.websiteDescription'),
      // Vector icon for web
      iconName: 'web',
      gradient: Colors.gradients.website,
      onPress: wrap(openWebsiteLink),
    },
    {
      id: 'instagram',
      name: t('social.instagramName'),
      handle: handleFromUrl(SOCIAL_URLS.instagram),
      description: t('social.instagramDescription'),
      // Use crisp vector icon instead of raster PNG
      iconName: 'instagram',
      gradient: Colors.gradients.instagram,
      onPress: wrap(openInstagramLink),
    },
    {
      id: 'facebook',
      name: t('social.facebookName'),
      handle: handleFromUrl(SOCIAL_URLS.facebook),
      description: t('social.facebookDescription'),
      // Use crisp vector icon instead of raster PNG
      iconName: 'facebook',
      gradient: Colors.gradients.facebook,
      onPress: wrap(openFacebookLink),
    },
    {
      id: 'youtube',
      name: t('social.youtubeName'),
      // Titolo del canale a SOCIAL_URLS.youtube: l'handle generato da YouTube non è leggibile.
      handle: 'Rise Against Hunger Italia ETS',
      description: t('social.youtubeDescription'),
      iconName: 'youtube',
      gradient: Colors.gradients.youtube,
      onPress: wrap(openYouTubeLink),
    },
    {
      id: 'linkedin',
      name: t('social.linkedinName'),
      handle: 'Rise Against Hunger Italia',
      description: t('social.linkedinDescription'),
      iconName: 'linkedin',
      gradient: Colors.gradients.linkedin,
      onPress: wrap(openLinkedInLink),
    },
  ];

  return {
    socialPlatforms,
  };
};
