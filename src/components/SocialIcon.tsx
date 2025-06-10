import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

interface SocialIconProps {
  platform: 'website' | 'instagram' | 'facebook' | 'linkedin';
  size?: number;
  backgroundColor: string; // Mantengo per compatibilità ma non lo uso più
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
  };

  // Funzione per verificare quale icona usare
  const getIconSource = () => {
    try {
      switch (platform) {
        case 'instagram':
          return require('../../assets/images/icons/instagram.png');
        case 'facebook':
          return require('../../assets/images/icons/facebook.png');
        case 'linkedin':
          return require('../../assets/images/icons/linkedin.png');
        case 'website':
          return null;
        default:
          return null;
      }
    } catch (_error) {
      return null;
    }
  };

  const iconSource = getIconSource();

  if (iconSource) {
    // Versione con icone reali - solo immagine senza cerchio
    return (
      <View style={[styles.iconContainer, { width: size, height: size }]}>
        <Image
          source={iconSource}
          style={[
            styles.iconImage,
            {
              width: size,
              height: size,
            },
          ]}
          resizeMode="contain" // Mantiene proporzioni originali
        />
      </View>
    );
  }

  // Versione con emoji (fallback per website) - anche senza cerchio
  return (
    <View style={[styles.iconContainer, { width: size, height: size }]}>
      <Text style={[styles.iconEmoji, { fontSize: size * 0.6 }]}>
        {emojiMap[platform]}
      </Text>
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
