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

// Platform-Specific Components
export {
  default as PlatformAnimations,
  usePlatformAnimations,
} from './PlatformAnimations';

// Material Design 3 Components (Android-specific)
export { default as PlatformBlur } from './PlatformBlur';
export { default as PlatformTouchable } from './PlatformTouchable';
export { PlatformScrollView, PlatformSurface } from './PlatformComponents';

// Display Components
export { default as HeaderLogo } from './HeaderLogo';
export { default as LoadingSkeleton } from './LoadingSkeleton';
export { default as Logo } from './Logo';
export { default as SocialIcon } from './SocialIcon';
export {
  ProfessionalContainer,
  TitleContainer,
  CardContainer as ProfessionalCardContainer,
} from './ProfessionalContainer';

// Perfect System Components
export { PerfectText, PerfectTitle, PerfectSubtitle, PerfectBody } from './PerfectText';
export type { PerfectTextProps, TypographyVariant } from './PerfectText';

export {
  PerfectContainer,
  PageContainer,
  CardContainer as PerfectCardContainer,
  PerfectSection,
  ModalContainer,
  HeaderContainer,
  FooterContainer,
} from './PerfectContainer';

export { PerfectImage } from './PerfectImage';

export {
  PerfectButton,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
} from './PerfectButton';
export type { PerfectButtonProps } from './PerfectButton';

export {
  PerfectSpacer,
  SpacerXS,
  SpacerS,
  SpacerM,
  SpacerL,
  SpacerXL,
  SpacerXXL,
  SpacerHorizontal,
} from './PerfectSpacer';

export {
  PerfectModal,
  SmallModal,
  MediumModal,
  LargeModal,
  FullscreenModal,
} from './PerfectModal';

export { PerfectIcon, PlatformIcon } from './PlatformIcon';

// Perfect Image shortcuts (già exportato sopra)
export {
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
