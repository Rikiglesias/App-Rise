// ===================================================================
// COMPONENTS - Central Export Hub
// ===================================================================

// Domain Components - Explicit exports for better tree-shaking
export {
  ModernSmartTitle,
  HomeHeaderDesignTokens,
  HeaderTextSection,
  HeaderImageSection,
  HomeHeaderSection,
} from './domain';

// Layout Components - Explicit exports
export {
  SectionContainer,
  ProjectDetailModal,
  InteractiveMap,
} from './layout';

// UI Components - Explicit exports
export {
  // Animation Components
  AnimatedNumber,
  AnimatedTransition,
  // Interactive Components
  EnhancedTouchable,
  FilterTabs,
  // Platform Components
  PlatformAnimations,
  usePlatformAnimations,
  PlatformBlur,
  PlatformTouchable,
  PlatformScrollView,
  PlatformSurface,
  // Display Components
  HeaderLogo,
  LoadingSkeleton,
  Logo,
  SocialIcon,
  ProfessionalContainer,
  TitleContainer,
  ProfessionalCardContainer,
  // Perfect System
  PerfectText,
  PerfectContainer,
  PageContainer,
  PerfectCardContainer,
  PerfectSection,
  ModalContainer,
  HeaderContainer,
  FooterContainer,
  PerfectImage,
  PerfectButton,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  PerfectSpacer,
  SpacerXS,
  SpacerS,
  SpacerM,
  SpacerL,
  SpacerXL,
  SpacerXXL,
  SpacerHorizontal,
  PerfectModal,
  SmallModal,
  MediumModal,
  LargeModal,
  FullscreenModal,
  PerfectIcon,
  PlatformIcon,
  PerfectHeroImage,
  PerfectCardImage,
  PerfectThumbnailImage,
  PerfectAvatarImage,
  PerfectBannerImage,
  ProgressRing,
  ProgressStat,
} from './ui';

// Export types
export type { PerfectTextProps, PerfectButtonProps } from './ui';

// Complex Components - Explicit exports
export { default as ModernCTA } from './ModernCTARefactored';
export { default as ProjectCard } from './ProjectCard';
