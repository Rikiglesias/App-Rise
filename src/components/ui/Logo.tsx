import React from 'react';
import type { ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';

import { Colors } from '../../shared/constants/designTokens';
import logoImage from '../../../assets/icons/app/app-icon.png';
import { PerfectImage } from './PerfectImage';
import { PerfectContainer } from './PerfectContainer';

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

  const innerSize = showBackground ? size * 0.7 : size;

  if (showBackground !== null) {
    return (
      <PerfectContainer style={[containerStyle, ...(style ? [style] : [])]}>
        <PerfectImage
          width={innerSize}
          height={innerSize}
          source={logoImage}
          imageStyle={{ resizeMode: 'contain' }}
        />
      </PerfectContainer>
    );
  }

  return (
    <PerfectContainer {...(style && { style })}>
      <PerfectImage
        width={innerSize}
        height={innerSize}
        source={logoImage}
        imageStyle={{ resizeMode: 'contain' }}
      />
    </PerfectContainer>
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
  logoImage: {},
});

export default Logo;
