import React from 'react';
import { Platform, SafeAreaView, StyleSheet } from 'react-native';
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
      paddingBottom: Platform.OS === 'android' ? 160 : 120, // ANDROID: 160 per evitare sovrapposizione bottom navigation / iOS: 120 normale
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
