// ===================================================================
// UI COMPONENTS - Central Export
// ===================================================================

// Animation Components
export { default as AnimatedNumber } from './AnimatedNumber';
export { default as AnimatedTransition } from './AnimatedTransition';

// Card Components
export { default as EnhancedCard } from './EnhancedCard';
export { ArrowSection, IconSection, TextSection } from './EnhancedCardSections';
export { default as GlassmorphismCard } from './GlassmorphismCard';

// Interactive Components
export { default as EnhancedTouchable } from './EnhancedTouchable';
export { default as FilterTabs } from './FilterTabs';
export { default as PremiumFloatingButton } from './PremiumFloatingButton';

// Platform-Specific Components
export {
  default as PlatformAnimations,
  usePlatformAnimations,
} from './PlatformAnimations';

// Material Design 3 Components (Android-specific)
export { MaterialFAB } from './MaterialFAB';
export { MaterialCard, MaterialActionCard } from './MaterialCard';
export { MaterialBottomNavigation } from './MaterialBottomNavigation';
export { default as PlatformBlur } from './PlatformBlur';
export { default as PlatformTouchable } from './PlatformTouchable';
export { PlatformScrollView, PlatformSurface } from './PlatformComponents';

// Display Components
// LEGACY (DEPRECATO): mantenuto temporaneamente per compatibilità durante la migrazione
export { default as FormattedText } from './FormattedText';
export {
  FormattedTextEnhanced,
  useTextRenderStrategy,
} from './FormattedTextEnhanced';
export {
  PerfectText,
  PerfectTitle,
  PerfectSubtitle,
  PerfectBody,
} from './PerfectText';
export { SafeFormattedText } from './SafeFormattedText';
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

// Progress Components
export { ProgressRing } from './ProgressRing';
export { default as ProgressStat } from './ProgressStat';

// LEGACY (DEPRECATO): mantenuto temporaneamente per compatibilità durante la migrazione
export {
  ResponsiveBox,
  ResponsiveStack,
  ResponsiveCard,
} from './ResponsiveBox';
export { ResponsiveImage } from './ResponsiveImage';
