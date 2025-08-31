import { useCallback, useEffect, useRef } from 'react';
import { Animated, Linking, Alert } from 'react-native';
import { SocialPlatform } from '../components/SocialCard';
import { logWarn } from '../../../shared/utils/logger';

// Import delle icone dalla cartella social
import instagramIcon from '../../../../assets/icons/social/instagram.png';
import linkedinIcon from '../../../../assets/icons/social/linkedin.png';
import facebookIcon from '../../../../assets/icons/social/facebook.png';
// Icone temporanee - riutilizzo icone esistenti per evitare duplicati
// TODO: Sostituire con icone reali quando disponibili
const twitterIcon = facebookIcon; // Placeholder
const youtubeIcon = instagramIcon; // Placeholder
const tiktokIcon = linkedinIcon; // Placeholder

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
      id: 'instagram',
      name: 'Instagram',
      handle: '@rise_against_hunger_italia',
      description: 'Foto e storie delle nostre missioni',
      icon: instagramIcon,
      gradient: ['#E1306C', '#F56040', '#FCAF45'],
      onPress: () =>
        openSocialLink(
          'https://instagram.com/rise_against_hunger_italia',
          'Instagram'
        ),
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: '@rise-against-hunger-italia',
      description: 'Aggiornamenti professionali e partnership',
      icon: linkedinIcon,
      gradient: ['#0077B5', '#00A0DC', '#40E0D0'],
      onPress: () =>
        openSocialLink(
          'https://linkedin.com/company/rise-against-hunger-italia',
          'LinkedIn'
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
      id: 'twitter',
      name: 'Twitter',
      handle: '@RAH_Italia',
      description: 'News e aggiornamenti in tempo reale',
      icon: twitterIcon,
      gradient: ['#1DA1F2', '#42A5F5', '#64B5F6'],
      onPress: () =>
        openSocialLink('https://twitter.com/RAH_Italia', 'Twitter'),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      handle: '@RiseAgainstHungerItalia',
      description: 'Video documentari e testimonianze',
      icon: youtubeIcon,
      gradient: ['#FF0000', '#FF4500', '#FF6347'],
      onPress: () =>
        openSocialLink(
          'https://youtube.com/@RiseAgainstHungerItalia',
          'YouTube'
        ),
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      handle: '@rahitalia',
      description: 'Contenuti creativi e sensibilizzazione',
      icon: tiktokIcon,
      gradient: ['#000000', '#FF0050', '#00F2EA'],
      onPress: () => openSocialLink('https://tiktok.com/@rahitalia', 'TikTok'),
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      handle: 'Gruppo Volontari',
      description: 'Unisciti al nostro gruppo di volontari',
      emoji: '💬',
      gradient: ['#25D366', '#128C7E', '#075E54'],
      onPress: () =>
        openSocialLink('https://chat.whatsapp.com/invite-link', 'WhatsApp'),
    },
    {
      id: 'telegram',
      name: 'Telegram',
      handle: '@RAHItalia',
      description: 'Canale ufficiale per aggiornamenti',
      emoji: '✈️',
      gradient: ['#0088CC', '#229ED9', '#54A9EB'],
      onPress: () => openSocialLink('https://t.me/RAHItalia', 'Telegram'),
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
