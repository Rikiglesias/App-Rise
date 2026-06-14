/**
 * ABOUT STYLES - LEGACY COMPATIBILITY
 *
 * Re-exports from refactored modular styles for backward compatibility
 * Reduced from 565 to ~20 lines through modularization
 */

// Re-export all styles from refactored modules
export { mainStyles } from './mainStyles';
export { modalStyles } from './modalStyles';
export { createChiSiamoSectionStyles } from './chiSiamoStyles';
export {
  createContactSectionStyles,
  createAnimatedContactStyles,
} from './contactStyles';

// Legacy aliases for backward compatibility
export { mainStyles as aboutMainStyles } from './mainStyles';
export { modalStyles as aboutModalStyles } from './modalStyles';
export { createChiSiamoSectionStyles as createAboutChiSiamoStyles } from './chiSiamoStyles';
export { createContactSectionStyles as createAboutContactStyles } from './contactStyles';
