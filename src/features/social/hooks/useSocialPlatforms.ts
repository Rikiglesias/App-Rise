import { useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { SocialPlatform } from '../components/SocialCard';
import { Colors } from '@/shared/constants';
import { logWarn } from '@/shared/utils/logger';
import { RISE_URLS, SOCIAL_URLS } from '@/shared/constants/urls';

// Import delle icone dalla cartella social
import instagramIcon from '@assets/icons/social/instagram.png';
import linkedinIcon from '@assets/icons/social/linkedin.png';
import facebookIcon from '@assets/icons/social/facebook.png';

export const useSocialPlatforms = () => {
  const openSocialLink = useCallback(
    async (url: string, platformName: string) => {
      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert(
            'Errore',
            `Non è possibile aprire ${platformName}. Assicurati di avere l'app installata.`,
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        logWarn(
          `Errore nell'apertura di ${platformName}`,
          'SocialPlatforms',
          error
        );
        Alert.alert(
          'Errore',
          `Si è verificato un errore nell'apertura di ${platformName}.`,
          [{ text: 'OK' }]
        );
      }
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
      onPress: () => openSocialLink(RISE_URLS.italyMain, 'Sito Web'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle missioni',
      icon: instagramIcon,
      gradient: Colors.gradients.instagram,
      onPress: () => openSocialLink(SOCIAL_URLS.instagramShort, 'Instagram'),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Community e eventi locali',
      icon: facebookIcon,
      gradient: Colors.gradients.facebook,
      onPress: () => openSocialLink(SOCIAL_URLS.facebookShort, 'Facebook'),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Opportunità e partnership',
      icon: linkedinIcon,
      gradient: Colors.gradients.linkedin,
      onPress: () => openSocialLink(SOCIAL_URLS.linkedinShort, 'LinkedIn'),
    },
  ];

  return {
    socialPlatforms,
  };
};
