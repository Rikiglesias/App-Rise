import { useMemo } from 'react';
import {
  createContainerStyles,
  createImageStyles,
  createTextStyles,
} from '../HomeHeaderStyles';
import type { HomeHeaderStyles } from '../types/HomeHeaderTypes';
import { useTheme } from '@/shared/hooks/useTheme';

// Hook for styles - now under 60 lines
export const useHomeHeaderStyles = (): HomeHeaderStyles => {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      ...createContainerStyles(colors),
      ...createTextStyles(colors),
      ...createImageStyles(),
    }),
    [colors]
  );
};
