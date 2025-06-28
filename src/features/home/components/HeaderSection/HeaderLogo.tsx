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
    width: 56,
    height: 56,
    marginHorizontal: Spacing[4],
    opacity: 1,
  },

  separatorLine: {
    height: 2,
    width: 110,
    backgroundColor: 'rgba(220, 38, 38, 0.6)',
    marginHorizontal: 0,
    borderRadius: 1,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
