import React from 'react';
import { View, StyleSheet } from 'react-native';
import { type EntraInAzioneProps } from '../../types';
import { Spacing } from '../../../../shared/constants/designTokens';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';

export const EntraInAzione: React.FC<EntraInAzioneProps> = () => {
  return (
    <View style={styles.container}>
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[2], // ← RIDOTTO DA 3 A 2 per più spazio orizzontale
    paddingTop: 0,
    paddingBottom: Spacing[4], // ← RIDOTTO DA 6 A 4 per evitare taglio in basso
    marginTop: 0,
  },
});

export default EntraInAzione;
