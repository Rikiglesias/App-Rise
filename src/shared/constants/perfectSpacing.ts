import { scaleSpacing } from './perfectScale';

/**
 * PERFECT SPACING SYSTEM
 * Sistema di spacing semantico e completamente scalato per tutti i device.
 *
 * Nomenclatura allineata con BorderRadius per consistenza.
 * Tutti i valori usano scaleSpacing() con limite max 1.5x su tablet
 * per evitare spacing eccessivo su schermi grandi.
 *
 * @example
 * ```typescript
 * marginTop: PerfectSpacing.lg    // scaleSpacing(24) - chiaro e scalato
 * padding: PerfectSpacing.base    // scaleSpacing(16) - spacing principale
 * gap: PerfectSpacing.md          // scaleSpacing(12) - spacing medio
 * ```
 */
export const PerfectSpacing = {
  /** Nessuno spacing - 0px */
  none: 0,

  /** Extra small - 4px scalato (max 6px tablet) - Gap minimi, padding compatti */
  xs: scaleSpacing(4),

  /** Small - 8px scalato (max 12px tablet) - Spacing compatti, gap tra elementi vicini */
  sm: scaleSpacing(8),

  /** Medium - 12px scalato (max 18px tablet) - Spacing standard tra elementi */
  md: scaleSpacing(12),

  /** Base - 16px scalato (max 24px tablet) - Spacing principale, padding base */
  base: scaleSpacing(16),

  /** Large - 24px scalato (max 36px tablet) - Margini generosi, padding sezioni */
  lg: scaleSpacing(24),

  /** Extra large - 32px scalato (max 48px tablet) - Separazioni tra sezioni */
  xl: scaleSpacing(32),

  /** 2X large - 40px scalato (max 60px tablet) - Separazioni importanti */
  '2xl': scaleSpacing(40),

  /** 3X large - 48px scalato (max 72px tablet) - Blocchi separati */
  '3xl': scaleSpacing(48),

  /** 4X large - 64px scalato (max 96px tablet) - Sezioni major */
  '4xl': scaleSpacing(64),

  /** 5X large - 80px scalato (max 120px tablet) - Hero sections, separazioni massive */
  '5xl': scaleSpacing(80),
} as const;

/** Type per PerfectSpacing keys */
export type PerfectSpacingKey = keyof typeof PerfectSpacing;
