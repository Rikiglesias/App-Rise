import { StyleSheet } from 'react-native';

import { PerfectImage } from './PerfectImage';
import { PerfectContainer } from './PerfectContainer';
import appIcon from '@assets/icons/app/app-icon.png';
import { BorderRadius, Spacing } from '@/shared/constants/designTokens';
import { useTheme } from '@/shared/hooks/useTheme';
import { scale } from '@/shared/constants/perfectScale';

const HeaderLogo = () => {
  const { colors } = useTheme();

  return (
    <PerfectContainer
      style={[styles.container, { backgroundColor: colors.glass.medium }]}
    >
      <PerfectImage
        // iPhone 15 reference: 100x40 logo area
        width={100}
        height={40}
        source={appIcon}
        imageStyle={{ resizeMode: 'contain' }}
      />
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing[2],
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  logo: {
    width: scale(100),
    height: scale(40),
  },
});

export default HeaderLogo;
