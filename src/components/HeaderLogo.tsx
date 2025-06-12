import { Image, StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing } from '../constants/designTokens';
import { useTheme } from '../hooks/useTheme';

const HeaderLogo = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.glass.medium }]}>
      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
        source={require('../../assets/images/logo.png') as number}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing[2],
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  logo: {
    width: 100,
    height: 40,
  },
});

export default HeaderLogo;
