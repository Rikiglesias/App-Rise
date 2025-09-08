/**
 * UNIFIED CARD - Componente Card unificato
 * Consolida MaterialCard, EnhancedCard, GlassmorphismCard in un unico componente
 */

import React from 'react';

import { MaterialCardRenderer } from './MaterialCardRenderer';
import { EnhancedCardRenderer } from './EnhancedCardRenderer';
import { GlassmorphismCardRenderer } from './GlassmorphismCardRenderer';
import type { UnifiedCardProps } from './types';

/**
 * Componente Card unificato che supporta tre design variants:
 * - material: Material Design 3 cards con elevation e ripple
 * - enhanced: Cards con icone, testo e animazioni
 * - glassmorphism: Cards con effetti vetro e gradienti
 */
export const UnifiedCard: React.FC<UnifiedCardProps> = props => {
  // Material Design Card
  if (props.designVariant === 'material') {
    return (
      <MaterialCardRenderer
        variant={props.variant ?? 'elevated'}
        elevation={props.elevation ?? 'level1'}
        style={props.style}
        onPress={props.onPress}
        disabled={props.disabled ?? false}
        rippleColor={props.rippleColor}
      >
        {props.children}
      </MaterialCardRenderer>
    );
  }

  // Enhanced Card
  if (props.designVariant === 'enhanced') {
    return (
      <EnhancedCardRenderer
        title={props.title}
        subtitle={props.subtitle}
        icon={props.icon}
        onPress={props.onPress}
        variant={props.variant ?? 'default'}
        size={props.size ?? 'standard'}
        disabled={props.disabled ?? false}
        showArrow={props.showArrow ?? true}
        customStyle={props.customStyle}
        accessibilityLabel={props.accessibilityLabel}
        accessibilityHint={props.accessibilityHint}
      >
        {props.children}
      </EnhancedCardRenderer>
    );
  }

  // Glassmorphism Card
  if (props.designVariant === 'glassmorphism') {
    return (
      <GlassmorphismCardRenderer
        style={props.style}
        variant={props.variant ?? 'light'}
        intensity={props.intensity ?? 'normal'}
        gradient={props.gradient ?? false}
        onPress={props.onPress}
        disabled={props.disabled ?? false}
      >
        {props.children}
      </GlassmorphismCardRenderer>
    );
  }

  // Fallback - non dovrebbe mai accadere con TypeScript
  return null;
};

// Componenti di convenienza per backward compatibility
export const MaterialCard: React.FC<
  Omit<
    Extract<UnifiedCardProps, { designVariant: 'material' }>,
    'designVariant'
  >
> = props => <UnifiedCard {...props} designVariant="material" />;

export const EnhancedCard: React.FC<
  Omit<
    Extract<UnifiedCardProps, { designVariant: 'enhanced' }>,
    'designVariant'
  >
> = props => <UnifiedCard {...props} designVariant="enhanced" />;

export const GlassmorphismCard: React.FC<
  Omit<
    Extract<UnifiedCardProps, { designVariant: 'glassmorphism' }>,
    'designVariant'
  >
> = props => <UnifiedCard {...props} designVariant="glassmorphism" />;

// Default export
export default UnifiedCard;
