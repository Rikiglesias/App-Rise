import { StyleSheet } from 'react-native';

import { PerfectImage } from './PerfectImage';
import { PerfectContainer } from './PerfectContainer';
import appIcon from '@assets/icons/app/app-icon.png';
import { BorderRadius } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { useTheme } from '@/shared/hooks/useTheme';

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
    padding: PerfectSpacing.sm,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
});

export default HeaderLogo;
