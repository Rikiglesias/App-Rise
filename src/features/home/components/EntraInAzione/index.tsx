import React from 'react';
import { View, StyleSheet } from 'react-native';
import { type EntraInAzioneProps } from '../../types';
import { Spacing } from '../../../../shared/constants/designTokens';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';

export const EntraInAzione: React.FC<EntraInAzioneProps> = ({
  navigation: _navigation,
}) => {
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
    marginHorizontal: Spacing[4],
    paddingTop: 0,
    paddingBottom: Spacing[6],
    marginTop: 0,
  },
});

export default EntraInAzione;
