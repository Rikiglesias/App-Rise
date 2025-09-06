import React from 'react';
import type { ImageStyle, ViewStyle } from 'react-native';
import { Image, StyleSheet, View } from 'react-native';

import { Colors } from '../../shared/constants/designTokens';
import logoImage from '../../../assets/icons/app/app-icon.jpg';

// Immagine logo importata correttamente

interface LogoProps {
  readonly size?: number;
  readonly style?: ViewStyle;
  readonly showBackground?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 56,
  style,
  showBackground = true,
}) => {
  // Asset immagine - deve essere require per React Native
  // Logo asset path available when needed

  const containerStyle: ViewStyle = {
    ...styles.logoContainer,
    width: size,
    height: size,
    backgroundColor: Colors.neutral[0],
    shadowColor: Colors.primary[600],
    borderColor: Colors.primary[100],
  };

  const imageStyle: ImageStyle = {
    ...styles.logoImage,
    width: showBackground ? size * 0.7 : size,
    height: showBackground ? size * 0.7 : size,
  };

  if (showBackground !== null) {
    return (
      <View style={[containerStyle, style]}>
        <Image source={logoImage} style={imageStyle} resizeMode="contain" />
      </View>
    );
  }

  return (
    <View style={style}>
      <Image source={logoImage} style={imageStyle} resizeMode="contain" />
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    overflow: 'hidden',
  },
  logoImage: {
    // Immagine Rise Against Hunger
  },
});

export default Logo;
