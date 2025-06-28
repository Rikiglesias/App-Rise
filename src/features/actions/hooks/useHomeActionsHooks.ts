import React from 'react';
import { createActionsData } from '../../../data/HomeActionsData';
import { useTheme } from '../../../shared/hooks/useTheme';
import {
  createCardStyles,
  createContainerStyles,
  createTypographyStyles,
} from '../styles/HomeActionsStyles';
import type { ActionHandlers } from '../types/HomeActionsTypes';

// ===================================================================
// STYLES HOOK - Extracted styles logic
// ===================================================================
export const useActionStyles = () => {
  const { colors } = useTheme();

  return React.useMemo(
    () => ({
      containerStyles: createContainerStyles(),
      typographyStyles: createTypographyStyles(colors),
      cardStyles: createCardStyles(colors),
    }),
    [colors]
  );
};

// ===================================================================
// CUSTOM HOOK - Extracted all logic
// ===================================================================
export const useHomeActionsLogic = (handlers: ActionHandlers) => {
  const { colors } = useTheme();
  const styles = useActionStyles();
  const actions = React.useMemo(
    () => createActionsData(colors, handlers),
    [colors, handlers]
  );

  return { ...styles, actions };
};
