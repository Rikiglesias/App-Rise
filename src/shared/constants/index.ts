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

// Responsive System (Enterprise-grade responsive design)
export {
  ScalingFactors,
  DeviceBreakpoints,
  ResponsiveDimensions,
  ResponsiveTypography,
  ResponsiveSpacing,
  ResponsiveShadows,
  PlatformAdjustments,
  DeviceInfo,
  scaleSize,
  scaleSpacing,
  getCurrentBreakpoint,
} from './responsiveSystem';

// Performance Constants
export * from './performance';
