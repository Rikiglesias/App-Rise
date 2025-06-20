import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '../shared/constants/designTokens';
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
  const insets = useSafeAreaInsets();

  // CALCOLO DINAMICO PADDING BOTTOM - SOLUZIONE SOVRAPPOSIZIONE
  // Bottom tab bar ha altezza ~80px + insets, aggiungiamo margine sicurezza
  const dynamicPaddingBottom = Math.max(
    insets.bottom + Spacing[16], // Tab bar height + safe area
    Spacing[20] // Minimo garantito per sicurezza
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.neutral[0],
    },
    content: {
      flexGrow: 1,
    },
    contentContainer: {
      paddingBottom: dynamicPaddingBottom, // DINAMICO: evita sovrapposizione navigation
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true} // ABILITATO: smooth scroll experience
        scrollEventThrottle={16} // PERFORMANCE: smooth scroll animations
        decelerationRate="normal" // NATURALE: scroll comportamento ottimale
      >
        <NewActionsHeader animations={animations} />
        <HeaderDivider animations={animations} />
        <NewActionButtonsSection
          animations={animations}
          navigation={navigation}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
