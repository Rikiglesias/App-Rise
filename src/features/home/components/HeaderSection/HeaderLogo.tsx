import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Spacing } from '../../../../shared/constants/designTokens';

export const HeaderLogo: React.FC = () => {
  return (
    <View style={styles.titleSeparator}>
      <View style={styles.separatorLine} />
      <Image
        source={require('../../../../../assets/icons/app/logo.png')}
        style={styles.separatorLogo}
        resizeMode="contain"
      />
      <View style={styles.separatorLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  titleSeparator: {
    alignItems: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[1],
    justifyContent: 'center',
    flexDirection: 'row',
  },

  separatorLogo: {
    width: 32, // Ridotto da 56 a 32 per proporzioni migliori
    height: 32, // Ridotto da 56 a 32 per proporzioni migliori
    marginHorizontal: Spacing[3], // Ridotto da 4 a 3
    opacity: 1,
  },

  separatorLine: {
    height: 1, // Ridotto da 2 a 1 per linee più sottili
    width: 80, // Ridotto da 110 a 80 per proporzioni migliori
    backgroundColor: 'rgba(220, 38, 38, 0.4)', // Ridotta opacità da 0.6 a 0.4
    marginHorizontal: 0,
    borderRadius: 1,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, // Ridotta da 0.2 a 0.1
    shadowRadius: 1, // Ridotto da 2 a 1
    elevation: 1, // Ridotto da 2 a 1
  },
});
