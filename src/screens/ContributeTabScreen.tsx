import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { PlatformScrollView } from '../components/ui';

import { Colors } from '../shared/constants/designTokens';
import type { ContributeTabScreenProps } from '../types/ContributeScreenTypes';
import {
  HeaderDivider,
  NewActionButtonsSection,
  NewActionsHeader,
  useNewActionsAnimations,
} from './Contribute/components';

export const ContributeTabScreen: React.FC<ContributeTabScreenProps> = ({
  navigation,
}) => {
  const animations = useNewActionsAnimations();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.neutral[0],
    },
    scrollContent: {
      paddingBottom: 120, // AGGIUNTO: spazio più ampio per evitare sovrapposizione bottom navigation
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <PlatformScrollView contentContainerStyle={styles.scrollContent}>
        <NewActionsHeader animations={animations} />
        <HeaderDivider animations={animations} />
        <NewActionButtonsSection
          animations={animations}
          navigation={navigation}
        />
      </PlatformScrollView>
    </SafeAreaView>
  );
};
