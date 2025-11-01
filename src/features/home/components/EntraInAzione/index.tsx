import React from 'react';
import { StyleSheet } from 'react-native';
import { type EntraInAzioneProps } from '../../types';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { PerfectContainer } from '@/components/ui';
import { Spacing } from '@/shared/constants/designTokens';

export const EntraInAzione: React.FC<EntraInAzioneProps> = () => {
  return (
    <PerfectContainer style={styles.container}>
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </PerfectContainer>
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
