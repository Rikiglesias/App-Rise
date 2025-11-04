import { useCallback } from 'react';
import { SocialPlatform } from '../components/SocialCard';
import { Colors } from '@/shared/constants';
import { logWarn } from '@/shared/utils/logger';
import { useLinkHandler } from '@/shared/hooks/useLinkHandler';

// Import delle icone dalla cartella social
import instagramIcon from '@assets/icons/social/instagram.png';
import linkedinIcon from '@assets/icons/social/linkedin.png';
import facebookIcon from '@assets/icons/social/facebook.png';

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
      emoji: '🌐',
      gradient: Colors.gradients.website,
      onPress: wrap(openWebsiteLink),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle missioni',
      icon: instagramIcon,
      gradient: Colors.gradients.instagram,
      onPress: wrap(openInstagramLink),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Community e eventi locali',
      icon: facebookIcon,
      gradient: Colors.gradients.facebook,
      onPress: wrap(openFacebookLink),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Opportunità e partnership',
      icon: linkedinIcon,
      gradient: Colors.gradients.linkedin,
      onPress: wrap(openLinkedInLink),
    },
  ];

  return {
    socialPlatforms,
  };
};
