import { useMemo } from 'react';
import { useTheme } from '../../../shared/hooks/useTheme';
import {
  createContainerStyles,
  createImageStyles,
  createMissionStyles,
  createTextStyles,
} from '../styles/HomeHeaderStyles';

// Hook for styles - now under 60 lines
export const useHomeHeaderStyles = () => {
  const { colors } = useTheme();

  return useMemo(
    () => ({
      ...createContainerStyles(colors),
      ...createTextStyles(colors),
      ...createImageStyles(colors),
      ...createMissionStyles(colors),
    }),
    [colors]
  );
};
