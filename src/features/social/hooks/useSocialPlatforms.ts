import { useCallback } from 'react';
import { SocialPlatform } from '../components/SocialCard';
import { Colors } from '@/shared/constants';
import { logWarn } from '@/shared/utils/logger';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

// Raster fallback still available if needed
// import instagramIcon from '@assets/icons/social/instagram.png';
// import linkedinIcon from '@assets/icons/social/linkedin.png';
// import facebookIcon from '@assets/icons/social/facebook.png';

export const useSocialPlatforms = () => {
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
          logWarn('SocialPlatforms', 'open link failed', error);
        }
      };
    },
    []
  );

  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'website',
      name: 'Sito Web',
      handle: 'italy.riseagainsthunger.org',
      description: 'Scopri tutte le nostre iniziative',
      // Vector icon for web
      iconName: 'web',
      iconColor: Colors.neutral[900],
      gradient: Colors.gradients.website,
      onPress: wrap(openWebsiteLink),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle missioni',
      // Use crisp vector icon instead of raster PNG
      iconName: 'instagram',
      iconColor: Colors.neutral[900],
      gradient: Colors.gradients.instagram,
      onPress: wrap(openInstagramLink),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Community e eventi locali',
      // Use crisp vector icon instead of raster PNG
      iconName: 'facebook',
      iconColor: Colors.neutral[900],
      gradient: Colors.gradients.facebook,
      onPress: wrap(openFacebookLink),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Opportunità e partnership',
      iconName: 'linkedin',
      iconColor: Colors.neutral[900],
      gradient: Colors.gradients.linkedin,
      onPress: wrap(openLinkedInLink),
    },
  ];

  return {
    socialPlatforms,
  };
};
