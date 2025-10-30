// ===================================================================
// ?? DESIGN TOKENS - SHADOWS
// ===================================================================

import { Shadows as BaseShadows } from '../../shared/constants/designTokens';

const cloneShadowToken = (token: keyof typeof BaseShadows) => {
  const { shadowOffset, ...rest } = BaseShadows[token];
  return {
    ...rest,
    shadowOffset: shadowOffset ? { ...shadowOffset } : { width: 0, height: 0 },
  };
};

export const DesignShadows = {
  ...BaseShadows,
  semantic: {
    card: cloneShadowToken('sm'),
    modal: cloneShadowToken('lg'), // xl → lg (xl non esiste)
    button: cloneShadowToken('sm'), // xs → sm (xs non esiste)
    elevation: {
      none: cloneShadowToken('none'),
      low: cloneShadowToken('sm'), // xs → sm (xs non esiste)
      medium: cloneShadowToken('sm'),
      high: cloneShadowToken('md'),
    },
  },
};

export const Shadows = DesignShadows;

export default DesignShadows;
