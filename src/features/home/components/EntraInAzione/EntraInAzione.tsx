import React from 'react';

import { ActionTitle } from './ActionTitle';
import { ActionDescription } from './ActionDescription';
import { ActionCTAButtons } from './ActionCTAButtons';
import { PerfectContainer } from '@/components/ui';
import { PerfectSpacing } from '@/shared/constants';
import { type EntraInAzioneProps } from '@/features/home/types';
import { useDeviceType } from '@/shared/hooks/useDeviceType';

export const EntraInAzione: React.FC<EntraInAzioneProps> = () => {
  const { isTablet } = useDeviceType();

  return (
    <PerfectContainer
      marginHorizontal={isTablet ? 0 : PerfectSpacing.sm}
      padding={PerfectSpacing.base}
    >
      <ActionTitle />
      <ActionDescription />
      <ActionCTAButtons />
    </PerfectContainer>
  );
};

export default EntraInAzione;
