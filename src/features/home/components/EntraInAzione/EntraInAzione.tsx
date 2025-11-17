import React from 'react';

import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { type EntraInAzioneProps } from '@/features/home/types';

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
