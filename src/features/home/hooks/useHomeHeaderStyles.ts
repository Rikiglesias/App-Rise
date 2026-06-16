import { useMemo } from 'react';
import {
  createContainerStyles,
  createImageStyles,
  createTextStyles,
} from '../HomeHeaderStyles';
import type { HomeHeaderStyles } from '../types/HomeHeaderTypes';
import { useThemeColors } from '@/shared/hooks/useThemeColors';

// Hook for styles - now under 60 lines
export const useHomeHeaderStyles = (): HomeHeaderStyles => {
  const colors = useThemeColors();

  return useMemo(
    () => ({
      ...createContainerStyles(colors),
      ...createTextStyles(colors),
      ...createImageStyles(),
    }),
    [colors]
  );
};
