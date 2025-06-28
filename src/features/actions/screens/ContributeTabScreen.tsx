import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PlatformScrollView } from '../../../components/ui';

import { Colors } from '../../../shared/constants/designTokens';
import type { ContributeTabScreenProps } from '../../../types/ContributeScreenTypes';
// TODO: Re-enable imports when components are properly exported
// import { HeaderDivider, NewActionButtonsSection, NewActionsHeader, useNewActionsAnimations } from '../components/Contribute/components';

export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation: _navigation,
}) => {
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
        {/* TODO: Components temporarily disabled during features migration */}
        {/* Will be re-enabled when component exports are fixed */}
      </PlatformScrollView>
    </SafeAreaView>
  );
};
