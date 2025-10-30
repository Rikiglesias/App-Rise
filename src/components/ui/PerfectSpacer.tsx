/**
 * PERFECT SPACER - Sistema Spacing Standardizzato
 *
 * GARANTISCE:
 * - Spacing proporzionale su tutti i device
 * - Preset per casi comuni (xs, s, m, l, xl)
 * - Compatibile con 8dp grid system
 */

import React from 'react';
import { PerfectContainer } from './PerfectContainer';

interface PerfectSpacerProps {
  /** Altezza (se vertical) - riferimento iPhone 15 */
  height?: number;

  /** Larghezza (se horizontal) - riferimento iPhone 15 */
  width?: number;

  /** Size preset (multipli di 8) */
  size?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';

  /** Direzione (default: vertical) */
  direction?: 'vertical' | 'horizontal';
}

// 📏 SPACER PRESETS (multipli di 8 - 8dp grid system)
const SPACER_PRESETS = {
  xs: 8, // 8×1
  s: 16, // 8×2
  m: 24, // 8×3
  l: 32, // 8×4
  xl: 48, // 8×6
  xxl: 64, // 8×8
} as const;

export const PerfectSpacer: React.FC<PerfectSpacerProps> = ({
  height,
  width,
  size,
  direction = 'vertical',
}) => {
  // Risolvi dimensione finale
  const presetSize = size ? SPACER_PRESETS[size] : undefined;

  const finalHeight =
    height ?? (direction === 'vertical' ? (presetSize ?? 16) : undefined);
  const finalWidth =
    width ?? (direction === 'horizontal' ? presetSize : undefined);

  return (
    <PerfectContainer
      {...(finalHeight !== undefined && { height: finalHeight })}
      {...(finalWidth !== undefined && { width: finalWidth })}
    />
  );
};

// 🎯 SHORTCUTS PER SIZE COMUNI (vertical)
export const SpacerXS = () => <PerfectSpacer size="xs" />;
export const SpacerS = () => <PerfectSpacer size="s" />;
export const SpacerM = () => <PerfectSpacer size="m" />;
export const SpacerL = () => <PerfectSpacer size="l" />;
export const SpacerXL = () => <PerfectSpacer size="xl" />;
export const SpacerXXL = () => <PerfectSpacer size="xxl" />;

// 🎯 SHORTCUTS PER HORIZONTAL
export const SpacerHorizontal = ({
  size = 'm',
}: {
  size?: PerfectSpacerProps['size'];
}) => <PerfectSpacer size={size} direction="horizontal" />;
