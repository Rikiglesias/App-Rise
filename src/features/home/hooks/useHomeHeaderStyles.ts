import { useMemo } from 'react';
import {
  createContainerStyles,
  createImageStyles,
  createTextStyles,
} from '../styles/HomeHeaderStyles';
import { useTheme } from '@/shared/hooks/useTheme';

// Hook for styles - now under 60 lines
export const useHomeHeaderStyles = () => {
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
