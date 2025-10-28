// ===================================================================
// UI COMPONENTS - Central Export
// ===================================================================

// Animation Components
export { default as AnimatedNumber } from './AnimatedNumber';
export { default as AnimatedTransition } from './AnimatedTransition';

// Card Components - UNIFIED SYSTEM
export {
  UnifiedCard,
  MaterialCard,
  EnhancedCard,
  GlassmorphismCard,
} from './UnifiedCard';
export type {
  UnifiedCardProps,
  CardDesignVariant,
  MaterialVariant,
  EnhancedVariant,
  GlassmorphismVariant,
} from './UnifiedCard';

// Interactive Components
export { default as EnhancedTouchable } from './EnhancedTouchable';
export { default as FilterTabs } from './FilterTabs';
// PremiumFloatingButton removed (legacy)

// Platform-Specific Components
export {
  default as PlatformAnimations,
  usePlatformAnimations,
} from './PlatformAnimations';

// Material Design 3 Components (Android-specific)
// MaterialFAB removed (legacy)
export { default as PlatformBlur } from './PlatformBlur';
export { default as PlatformTouchable } from './PlatformTouchable';
export { PlatformScrollView, PlatformSurface } from './PlatformComponents';

// Display Components
export {
  PerfectText,
  PerfectTitle,
  PerfectSubtitle,
  PerfectBody,
} from './PerfectText';
export { default as HeaderLogo } from './HeaderLogo';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as Logo } from './Logo';
export { default as SocialIcon } from './SocialIcon';
export {
  ProfessionalContainer,
  TitleContainer,
  CardContainer,
} from './ProfessionalContainer';

// Perfect System Components
export {
  PerfectContainer,
  PageContainer,
  CardContainer as PerfectCardContainer,
  SectionContainer as PerfectSectionContainer,
  ModalContainer,
  HeaderContainer,
  FooterContainer,
} from './PerfectContainer';

// Perfect Image Components
export {
  PerfectImage,
  HeroImage as PerfectHeroImage,
  CardImage as PerfectCardImage,
  ThumbnailImage as PerfectThumbnailImage,
  AvatarImage as PerfectAvatarImage,
  BannerImage as PerfectBannerImage,
} from './PerfectImage';

// Progress Components
export { ProgressRing } from './ProgressRing';
export { default as ProgressStat } from './ProgressStat';

// FormattedText rimosso - usa PerfectText dal Perfect System
