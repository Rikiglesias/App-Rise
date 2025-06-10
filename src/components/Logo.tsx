import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Import diretto dell'immagine
const logoImage = require('../../assets/images/logo.png');

interface LogoProps {
  size?: number;
  style?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  showBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 56,
  style,
  showBackground = true,
}) => {
  if (showBackground) {
    return (
      <View
        style={[styles.logoContainer, { width: size, height: size }, style]}
      >
        <Image
          source={logoImage}
          style={[styles.logoImage, { width: size * 0.7, height: size * 0.7 }]}
          resizeMode="contain"
        />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image
        source={logoImage}
        style={[styles.logoImage, { width: size, height: size }]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: '#FEE2E2',
    overflow: 'hidden',
  },
  logoImage: {
    // La tua immagine reale Rise Against Hunger
  },
});

export default Logo;
