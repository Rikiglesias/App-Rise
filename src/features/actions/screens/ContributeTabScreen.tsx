import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { ContributeTabScreenProps } from '../ContributeScreenTypes';
import {
  ActionButtons,
  ContributeHeader,
  HeaderDivider,
  useNewActionsAnimations,
} from '../components';
import { PlatformScrollView, PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

const ContributeTabScreenComponent: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();
  const { isTablet } = useDeviceType();
  // Altezza vera della barra flottante (scala del testo e bordo sicuro compresi); 0 fuori dal navigatore.
  const tabBarHeight = useContext(BottomTabBarHeightContext) ?? 0;
  const colors = useThemeColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },
    scrollContent: {
      paddingBottom: tabBarHeight + PerfectSpacing.lg,
    },
    tabletContainer: {
      width: '70%',
      maxWidth: 640, // CAP per Landscape
      alignSelf: 'center',
    },
  });

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right']}
      testID="contribute-tab-screen"
    >
      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        <PerfectContainer style={isTablet ? styles.tabletContainer : {}}>
          <ContributeHeader animations={animations} />
          <HeaderDivider animations={animations} />
          <ActionButtons animations={animations} navigation={navigation} />
        </PerfectContainer>
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export const ContributeTabScreen = React.memo(ContributeTabScreenComponent);
