// ===================================================================
// SHARED CONSTANTS - Central Export
// ===================================================================

// Design System (original)
export * from './designTokens';

// Platform-Aware Design System (Smart components should import these)
export {
  PlatformShadows,
  PlatformAnimations,
  PlatformColors,
  PlatformTypography,
  PlatformTouch,
} from './platformDesignTokens';

// Performance Constants
export * from './performance';
