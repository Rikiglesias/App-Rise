import { useCallback } from 'react';
import { SocialPlatform } from './components/SocialCard';
import { Colors } from '@/shared/constants';
import { useTranslation } from '@/shared/hooks/useTranslation';
import { logWarn } from '@/shared/utils/logger';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

// Raster fallback still available if needed
// import instagramIcon from '@assets/icons/social/instagram.png';
// import linkedinIcon from '@assets/icons/social/linkedin.png';
// import facebookIcon from '@assets/icons/social/facebook.png';

export const useSocialPlatforms = () => {
  const { t } = useTranslation();
  const {
    openWebsiteLink,
    openInstagramLink,
    openFacebookLink,
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
      handle: '@riseagainsthungeritalia',
      description: t('social.instagramDescription'),
      // Use crisp vector icon instead of raster PNG
      iconName: 'instagram',
      gradient: Colors.gradients.instagram,
      onPress: wrap(openInstagramLink),
    },
    {
      id: 'facebook',
      name: t('social.facebookName'),
      handle: '@RiseAgainstHungerItalia',
      description: t('social.facebookDescription'),
      // Use crisp vector icon instead of raster PNG
      iconName: 'facebook',
      gradient: Colors.gradients.facebook,
      onPress: wrap(openFacebookLink),
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
