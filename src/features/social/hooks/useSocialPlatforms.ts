import { useCallback, useRef } from 'react';
import { Animated, Linking, Alert } from 'react-native';
import { SocialPlatform } from '../components/SocialCard';
import { logWarn } from '@/shared/utils/logger';
import { RISE_URLS, SOCIAL_URLS } from '@/shared/constants/urls';

// Import delle icone dalla cartella social
import instagramIcon from '@assets/icons/social/instagram.png';
import linkedinIcon from '@assets/icons/social/linkedin.png';
import facebookIcon from '@assets/icons/social/facebook.png';

export const useSocialPlatforms = () => {
  // ANIMAZIONI DISABILITATE - Valore statico per performance ottimale
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
      description: 'Il nostro sito ufficiale',
      emoji: '🌐',
      gradient: ['#6B7280', '#9CA3AF', '#D1D5DB'],
      onPress: () => openSocialLink(RISE_URLS.italyMain, 'Sito Web'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle nostre missioni',
      icon: instagramIcon,
      gradient: ['#E1306C', '#F56040', '#FCAF45'],
      onPress: () => openSocialLink(SOCIAL_URLS.instagramShort, 'Instagram'),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Community e eventi locali',
      icon: facebookIcon,
      gradient: ['#1877F2', '#42A5F5', '#64B5F6'],
      onPress: () => openSocialLink(SOCIAL_URLS.facebookShort, 'Facebook'),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Aggiornamenti professionali e partnership',
      icon: linkedinIcon,
      gradient: ['#0077B5', '#00A0DC', '#40E0D0'],
      onPress: () => openSocialLink(SOCIAL_URLS.linkedinShort, 'LinkedIn'),
    },
  ];

  // startAnimation e useEffect rimossi - nessuna animazione da eseguire

  return {
    socialPlatforms,
    animationValue: fadeAnim, // Manteniamo per compatibilità
  };
};
