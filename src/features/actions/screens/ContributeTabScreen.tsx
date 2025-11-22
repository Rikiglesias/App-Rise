import React from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { ContributeTabScreenProps } from '../ContributeScreenTypes';
import {
  ActionButtons,
  ContributeHeader,
  HeaderDivider,
  useNewActionsAnimations,
} from '../components';
import { PlatformScrollView, PerfectContainer } from '@/components/ui';
import { useDeviceType } from '@/shared/hooks/useDeviceType';
import { Colors } from '@/shared/constants/designTokens';

const ContributeTabScreenComponent: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();
  const { isTablet } = useDeviceType();
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.neutral[50],
    },
    scrollContent: {
      // Padding inferiore coerente con altezza bottom bar custom + safe-area
      paddingBottom: Math.max(insets.bottom, 16) + 95 + 24,
    },
    tabletContainer: {
      width: '70%',
      maxWidth: 640, // CAP per Landscape
      alignSelf: 'center',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
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
