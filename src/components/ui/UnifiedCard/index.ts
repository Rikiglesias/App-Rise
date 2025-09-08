/**
 * UNIFIED CARD SYSTEM - Export unificati
 * Sistema Card consolidato che sostituisce MaterialCard, EnhancedCard, GlassmorphismCard
 */

// Componente principale
export { UnifiedCard as default } from './UnifiedCard';
export { UnifiedCard } from './UnifiedCard';

// Componenti di convenienza per backward compatibility
export { MaterialCard, EnhancedCard, GlassmorphismCard } from './UnifiedCard';

// Renderer specifici (per uso avanzato)
export { MaterialCardRenderer } from './MaterialCardRenderer';
export { EnhancedCardRenderer } from './EnhancedCardRenderer';
export { GlassmorphismCardRenderer } from './GlassmorphismCardRenderer';

// Tipi
export type {
  UnifiedCardProps,
  CardDesignVariant,
  MaterialVariant,
  EnhancedVariant,
  GlassmorphismVariant,
  CardSize,
  ElevationLevel,
  GlassmorphismIntensity,
  IconSectionProps,
  TextSectionProps,
  ArrowSectionProps,
} from './types';

// Type guards
export { isMaterialCard, isEnhancedCard, isGlassmorphismCard } from './types';
