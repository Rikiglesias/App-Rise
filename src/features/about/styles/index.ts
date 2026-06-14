/**
 * ABOUT STYLES - LEGACY COMPATIBILITY
 *
 * Re-exports from refactored modular styles for backward compatibility
 * Reduced from 565 to ~20 lines through modularization
 */

// Re-export all styles from refactored modules
export { createMainStyles } from './mainStyles';
export { createModalStyles } from './modalStyles';
export { createChiSiamoSectionStyles } from './chiSiamoStyles';
export {
  createContactSectionStyles,
  createAnimatedContactStyles,
} from './contactStyles';

// Legacy aliases for backward compatibility
export { createMainStyles as createAboutMainStyles } from './mainStyles';
export { createModalStyles as createAboutModalStyles } from './modalStyles';
export { createChiSiamoSectionStyles as createAboutChiSiamoStyles } from './chiSiamoStyles';
export { createContactSectionStyles as createAboutContactStyles } from './contactStyles';
