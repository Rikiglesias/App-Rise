import { useCallback, useEffect, useRef } from 'react';
import { Animated, Linking, Alert } from 'react-native';
import { SocialPlatform } from '../components/SocialCard';
import { logWarn } from '../../../shared/utils/logger';

// Import delle icone dalla cartella social
import instagramIcon from '../../../../assets/icons/social/instagram.png';
import linkedinIcon from '../../../../assets/icons/social/linkedin.png';
import facebookIcon from '../../../../assets/icons/social/facebook.png';

export const useSocialPlatforms = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      onPress: () =>
        openSocialLink('https://italy.riseagainsthunger.org', 'Sito Web'),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      handle: '@riseagainsthungeritalia',
      description: 'Foto e storie delle nostre missioni',
      icon: instagramIcon,
      gradient: ['#E1306C', '#F56040', '#FCAF45'],
      onPress: () =>
        openSocialLink(
          'https://instagram.com/riseagainsthungeritalia',
          'Instagram'
        ),
    },
    {
      id: 'facebook',
      name: 'Facebook',
      handle: '@RiseAgainstHungerItalia',
      description: 'Community e eventi locali',
      icon: facebookIcon,
      gradient: ['#1877F2', '#42A5F5', '#64B5F6'],
      onPress: () =>
        openSocialLink(
          'https://facebook.com/RiseAgainstHungerItalia',
          'Facebook'
        ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'Rise Against Hunger Italia',
      description: 'Aggiornamenti professionali e partnership',
      icon: linkedinIcon,
      gradient: ['#0077B5', '#00A0DC', '#40E0D0'],
      onPress: () =>
        openSocialLink(
          'https://linkedin.com/company/rise-against-hunger-italia',
          'LinkedIn'
        ),
    },
  ];

  const startAnimation = useCallback(() => {
    void Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    startAnimation();
  }, [startAnimation]);

  return {
    socialPlatforms,
    animationValue: fadeAnim,
    startAnimation,
  };
};
