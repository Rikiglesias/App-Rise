// ===================================================================
// UI COMPONENTS - Central Export
// ===================================================================

// Interactive Components
export { default as FilterTabs } from './FilterTabs';

// Material Design 3 Components (Android-specific)
export { default as PlatformBlur } from './PlatformBlur';
export { default as PlatformTouchable } from './PlatformTouchable';
export { PlatformScrollView, PlatformSurface } from './PlatformComponents';

// Display Components
export { default as Logo } from './Logo';
export { default as SocialIcon } from './SocialIcon';

// Perfect System Components
export { PerfectText } from './PerfectText';
export type { PerfectTextProps } from './PerfectText';

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
