import { StyleSheet, View } from 'react-native';

import { BorderRadius, Spacing } from '../../shared/constants/designTokens';
import { useTheme } from '../../shared/hooks/useTheme';
import appIcon from '../../../assets/icons/app/app-icon.png';
import { PerfectImage } from './PerfectImage';

const HeaderLogo = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.glass.medium }]}>
      <PerfectImage
        // iPhone 15 reference: 100x40 logo area
        width={100}
        height={40}
        source={appIcon}
        imageStyle={{ resizeMode: 'contain' }}
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
