// ===================================================================
// ?? DESIGN TOKENS - SHADOWS
// ===================================================================

import { ShadowTokens as BaseShadows } from '../../shared/constants/responsiveSystem';

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
    modal: cloneShadowToken('xl'),
    button: cloneShadowToken('xs'),
    elevation: {
      none: cloneShadowToken('none'),
      low: cloneShadowToken('xs'),
      medium: cloneShadowToken('sm'),
      high: cloneShadowToken('md'),
    },
  },
};

export const Shadows = DesignShadows;

export default DesignShadows;
