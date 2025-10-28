import React from 'react';
import { StyleSheet, View } from 'react-native';

// Import statici delle icone
import instagramIcon from '../../../assets/icons/social/instagram.png';
import facebookIcon from '../../../assets/icons/social/facebook.png';
import linkedinIcon from '../../../assets/icons/social/linkedin.png';
import { PerfectText } from './PerfectText';
import { PerfectImage } from './PerfectImage';

interface SocialIconProps {
  readonly platform: 'website' | 'instagram' | 'facebook' | 'linkedin';
  readonly size?: number;
  readonly backgroundColor: string; // Mantengo per compatibilità ma non lo uso più
}

const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  size = 48,
  backgroundColor: _backgroundColor, // Non usato più ma mantengo per non rompere l'interfaccia
}) => {
  // Mapping delle emoji di fallback
  const emojiMap = {
    website: '🌐',
    instagram: '📷',
    facebook: '📘',
    linkedin: '💼',
  } as const;

  // Funzione per verificare quale icona usare con typing sicuro
  const getIconSource = (): number | null => {
    switch (platform) {
      case 'instagram':
        return instagramIcon as number;
      case 'facebook':
        return facebookIcon as number;
      case 'linkedin':
        return linkedinIcon as number;
      case 'website':
        return null;
      default:
        return null;
    }
  };

  const iconSource = getIconSource();

  if (iconSource !== null) {
    // Versione con icone reali - solo immagine senza cerchio
    return (
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <PerfectImage
          width={size}
          height={size}
          source={iconSource}
          imageStyle={{ resizeMode: 'contain' }}
        />
      </View>
    );
  }

  // Versione con emoji (fallback per website) - anche senza cerchio
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <PerfectText
        size={Math.round(size * 0.6)}
        lines={1}
        style={styles.iconEmoji}
      >
        {emojiMap[platform]}
      </PerfectText>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // Rimosso tutto lo styling del cerchio colorato
  },
  iconImage: {
    // Icone pure senza modifiche
  },
  iconEmoji: {
    textAlign: 'center',
  },
});

export default SocialIcon;
