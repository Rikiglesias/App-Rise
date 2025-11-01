import React from 'react';
import { StyleSheet } from 'react-native';

// Import statici delle icone
import { PerfectContainer } from './PerfectContainer';
import { PerfectText } from './PerfectText';
import { PerfectImage } from './PerfectImage';
import instagramIcon from '@assets/icons/social/instagram.png';
import facebookIcon from '@assets/icons/social/facebook.png';
import linkedinIcon from '@assets/icons/social/linkedin.png';

interface SocialIconProps {
  readonly platform: 'website' | 'instagram' | 'facebook' | 'linkedin';
  readonly size?: number;
  readonly backgroundColor?: string; // Opzionale per compatibilità
}

const SocialIcon: React.FC<SocialIconProps> = ({
  platform,
  size = 48,
  backgroundColor: _backgroundColor, // Non usato ma mantenuto per compatibilità
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
      <PerfectContainer
        style={[styles.iconContainer, { width: size, height: size }]}
      >
        <PerfectImage
          width={size}
          height={size}
          source={iconSource}
          imageStyle={{ resizeMode: 'contain' }}
        />
      </PerfectContainer>
    );
  }

  // Versione con emoji (fallback per website) - anche senza cerchio
  return (
    <PerfectContainer
      style={[styles.iconContainer, { width: size, height: size }]}
    >
      <PerfectText
        size={Math.round(size * 0.6)}
        lines={1}
        style={styles.iconEmoji}
      >
        {emojiMap[platform]}
      </PerfectText>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    textAlign: 'center',
  },
});

export default SocialIcon;
