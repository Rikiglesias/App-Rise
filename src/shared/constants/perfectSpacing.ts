import { scale } from './perfectScale';

/**
 * PERFECT SPACING SYSTEM
 * Sistema di spacing semantico e completamente scalato per tutti i device.
 * 
 * Nomenclatura allineata con BorderRadius per consistenza.
 * Tutti i valori usano scale() per responsive perfetto.
 * 
 * @example
 * ```typescript
 * marginTop: PerfectSpacing.lg    // scale(24) - chiaro e scalato
 * padding: PerfectSpacing.base    // scale(16) - spacing principale
 * gap: PerfectSpacing.md          // scale(12) - spacing medio
 * ```
 */
export const PerfectSpacing = {
  /** Nessuno spacing - 0px */
  none: 0,
  
  /** Extra small - 4px scalato - Gap minimi, padding compatti */
  xs: scale(4),
  
  /** Small - 8px scalato - Spacing compatti, gap tra elementi vicini */
  sm: scale(8),
  
  /** Medium - 12px scalato - Spacing standard tra elementi */
  md: scale(12),
  
  /** Base - 16px scalato - Spacing principale, padding base */
  base: scale(16),
  
  /** Large - 24px scalato - Margini generosi, padding sezioni */
  lg: scale(24),
  
  /** Extra large - 32px scalato - Separazioni tra sezioni */
  xl: scale(32),
  
  /** 2X large - 40px scalato - Separazioni importanti */
  '2xl': scale(40),
  
  /** 3X large - 48px scalato - Blocchi separati */
  '3xl': scale(48),
  
  /** 4X large - 64px scalato - Sezioni major */
  '4xl': scale(64),
  
  /** 5X large - 80px scalato - Hero sections, separazioni massive */
  '5xl': scale(80),
} as const;

/** Type per PerfectSpacing keys */
export type PerfectSpacingKey = keyof typeof PerfectSpacing;
