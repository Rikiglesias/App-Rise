import React, { ReactNode } from 'react';
import {
  View,
  ViewStyle,
  Platform,
  StyleProp,
  LayoutChangeEvent,
} from 'react-native';
import { useContainerLayout } from '../../shared/hooks/useResponsive';

interface ProfessionalContainerProps {
  children: ReactNode;
  variant?: 'text' | 'card' | 'section';
  enableRTL?: boolean;
  forceWidth?: string | number;
  style?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
  testID?: string;
}

/**
 * 📱 PROFESSIONAL CONTAINER (Typography Guide Compliant)
 *
 * Implementa automaticamente:
 * ✅ Larghezza costante (90% su phone, fisso su tablet)
 * ✅ Padding interno costante in dp
 * ✅ Safe area handling dinamico
 * ✅ RTL support integrato
 * ✅ Baseline grid per line-height
 * ✅ Breakpoint strategy automatica
 * ✅ Cross-platform consistency
 * ✅ Layout measurement e debugging
 *
 * @example
 * ```tsx
 * <ProfessionalContainer variant="text">
 *   <FormattedText fontSize={75}>Rise Against Hunger Italia</FormattedText>
 * </ProfessionalContainer>
 * ```
 */
export const ProfessionalContainer: React.FC<ProfessionalContainerProps> = ({
  children,
  variant = 'text',
  enableRTL = false,
  forceWidth,
  style,
  onLayout,
  testID,
}) => {
  const {
    containerStyle,
    handleLayout,
    breakpoint,
    strategy,
    containerWidth,
    maxTextWidth,
    isRTL,
  } = useContainerLayout({
    variant,
    enableRTL,
    ...(forceWidth !== undefined && { forceWidth }),
  });

  // Development info
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log('🏗️ ProfessionalContainer:', {
      variant,
      breakpoint,
      maxWidth: strategy.container.maxWidth,
      containerWidth,
      maxTextWidth,
      isRTL,
      platform: Platform?.OS || 'ios',
    });
  }

  const finalOnLayout = React.useCallback(
    (event: LayoutChangeEvent) => {
      handleLayout(event);
      onLayout?.(event);
    },
    [handleLayout, onLayout]
  );

  return (
    <View
      style={[containerStyle as ViewStyle, style]}
      onLayout={finalOnLayout}
      testID={testID}
    >
      {children}
    </View>
  );
};

/**
 * 📱 TITLE CONTAINER (Specialized for titles)
 *
 * Ottimizzato per titoli che necessitano di:
 * - Layout consistency (sempre stesso numero di righe)
 * - Font scaling intelligente
 * - Spacing predicibile
 */
export const TitleContainer: React.FC<ProfessionalContainerProps> = props => {
  const titleStyle: ViewStyle = {
    // Title-specific optimizations
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90, // Ensure consistent height for 2-line titles
  };

  return (
    <ProfessionalContainer
      {...props}
      variant="text"
      style={[titleStyle, props.style]}
    />
  );
};

/**
 * 📱 CARD CONTAINER (Specialized for cards)
 *
 * Ottimizzato per card che necessitano di:
 * - Background e shadows consistenti
 * - Padding interno standardizzato
 * - Elevation cross-platform
 */
export const CardContainer: React.FC<ProfessionalContainerProps> = props => {
  const cardStyle: ViewStyle = {
    // Card-specific optimizations
    overflow: 'hidden',
    // Android-specific fixes
    ...((Platform?.OS || 'ios') === 'android' && {
      elevation: 2,
      backgroundColor: '#FFFFFF',
    }),
  };

  return (
    <ProfessionalContainer
      {...props}
      variant="card"
      style={[cardStyle, props.style]}
    />
  );
};

export default ProfessionalContainer;
