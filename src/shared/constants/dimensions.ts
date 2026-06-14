/**
 * DIMENSIONS CONSTANTS - Magic numbers documentation
 *
 * Single source of truth per dimensioni ricorrenti nell'app.
 * Usare queste costanti invece di hardcodare numeri per:
 * - Consistenza visiva
 * - Manutenibilità
 * - Documentazione implicita del significato
 */

// ===================================================================
// IMAGE & MEDIA DIMENSIONS
// ===================================================================

/**
 * Dimensioni standard per immagini hero nelle schermate principali
 * Riferimento: iPhone 15 (393px wide)
 * Ratio: ~2:1 per hero banner ottimale
 */
export const IMAGE_DIMENSIONS = {
  /** Hero image height - Ottimizzato per above-the-fold content */
  HERO_HEIGHT: 280,

  /** Card image standard per griglia progetti */
  CARD_HEIGHT: 360,
  CARD_WIDTH: 280,

  /** Map preview height nelle schermate impatto */
  MAP_PREVIEW_HEIGHT: 280,

  /** Story card dimensions per carousel */
  STORY_HEIGHT: 360,
  STORY_WIDTH: 280,
} as const;

// ===================================================================
// ICON & BUTTON DIMENSIONS
// ===================================================================

/**
 * Dimensioni standard per icone e container
 * Seguono Material Design guidelines con multipli di 8
 */
export const ICON_DIMENSIONS = {
  /** Small icon - Per badge e indicators */
  SMALL: 24,

  /** Medium icon - Default per la maggior parte delle icone */
  MEDIUM: 32,

  /** Large icon - Per azioni primarie e hero sections */
  LARGE: 36,

  /** Extra large - Per elementi prominenti */
  XLARGE: 48,

  /** Icon container con padding - Social cards */
  SOCIAL_CONTAINER: 56,
} as const;

// ===================================================================
// BUTTON DIMENSIONS
// ===================================================================

/**
 * Dimensioni standard per bottoni e touchable areas
 * Minimum touch target: 44x44 (Apple HIG)
 */
export const BUTTON_DIMENSIONS = {
  /** Minimum touch target height (Apple HIG) */
  MIN_TOUCH_HEIGHT: 44,

  /** Standard button height */
  STANDARD_HEIGHT: 48,

  /** Large CTA button height */
  LARGE_HEIGHT: 56,

  /** Close button standard size */
  CLOSE_BUTTON: 32,

  /** Floating action button size */
  FAB_SIZE: 56,
} as const;

// ===================================================================
// MODAL & OVERLAY DIMENSIONS
// ===================================================================

/**
 * Dimensioni per modali e overlay
 */
export const MODAL_DIMENSIONS = {
  /** Header height per modali */
  HEADER_HEIGHT: 56,

  /** Story modal scroll height */
  STORY_SCROLL_HEIGHT: 500,

  /** Minimum modal width per tablet/desktop */
  MIN_WIDTH: 280,
} as const;

// ===================================================================
// REFERENCE DEVICE
// ===================================================================

// Device di riferimento (iPhone 15): SSOT in perfectScale.ts (LOGICAL_REFERENCE).
// La ex-costante REFERENCE_DEVICE qui era un duplicato orfano (0 consumatori).

// ===================================================================
// TYPE EXPORTS
// ===================================================================

export type ImageDimension = keyof typeof IMAGE_DIMENSIONS;
export type IconDimension = keyof typeof ICON_DIMENSIONS;
export type ButtonDimension = keyof typeof BUTTON_DIMENSIONS;
export type ModalDimension = keyof typeof MODAL_DIMENSIONS;
