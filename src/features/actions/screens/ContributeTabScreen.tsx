import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';

import { Colors } from '../../../shared/constants/designTokens';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';
import {
  ActionButtons,
  ContributeHeader,
  HeaderDivider,
  useNewActionsAnimations,
} from '../components/Contribute/components';

export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.neutral[50],
    },
    scrollContent: {
      paddingBottom: 120,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        <ContributeHeader animations={animations} />
        <HeaderDivider animations={animations} />
        <ActionButtons animations={animations} navigation={navigation} />
      </PlatformScrollView>
    </SafeAreaView>
  );
};
