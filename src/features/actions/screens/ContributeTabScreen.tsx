import React from 'react';
import { StyleSheet } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';
import {
  ActionButtons,
  ContributeHeader,
  HeaderDivider,
  useNewActionsAnimations,
} from '../components/Contribute/components';
import { PlatformScrollView } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';

const ContributeTabScreenComponent: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();
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
  });

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        <ContributeHeader animations={animations} />
        <HeaderDivider animations={animations} />
        <ActionButtons animations={animations} navigation={navigation} />
      </PlatformScrollView>
    </SafeAreaView>
  );
};

export const ContributeTabScreen = React.memo(ContributeTabScreenComponent);
