import React from 'react';
import { type EntraInAzioneProps } from '../../types';
import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';

export const EntraInAzione: React.FC<EntraInAzioneProps> = () => {
  return (
    <PerfectContainer
      marginHorizontal={PerfectSpacing.sm}
      padding={PerfectSpacing.base}
    >
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </PerfectContainer>
  );
};

export default EntraInAzione;
