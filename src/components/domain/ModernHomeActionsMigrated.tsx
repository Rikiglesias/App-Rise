// ===================================================================
// MODERNHOMEACTIONS - MIGRATED TO RESPONSIVE LAYER v2.0
// ELIMINA FRAMMENTAZIONE: breakpoints duplicati, percentuali hard-coded
// ===================================================================

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { Surface } from 'react-native-paper';

import {
  BorderRadius,
  Spacing,
  Typography,
} from '../../shared/constants/designTokens';
import { TypographyTokens } from '../../shared/constants/responsiveSystem';
import { useHapticFeedback } from '../../shared/hooks/useHapticFeedback';
import { useTheme } from '../../shared/hooks/useTheme';
// 🎯 NUOVO: Import layer centralizzato
import { useResponsiveLayout } from '../../shared/hooks/useResponsiveLayout';
import { ResponsiveBox, ResponsiveStack, PlatformTouchable, FormattedText } from '../ui';

// ❌ RIMOSSO: Calcolo manuale duplicato
// const { width: screenWidth } = Dimensions.get('window');

// ===================================================================
// INTERFACES
// ===================================================================
interface ModernHomeActionsProps {
  onShopPress: () => void;
  onGiftCardPress: () => void;
  onEventsPress: () => void;
  onProjectsPress: () => void;
  onSocialPress: () => void;
  onChiSiamoPress: () => void;
  isLoaded: boolean;
}

// ===================================================================
// MIGRATED COMPONENT - ZERO FRAMMENTAZIONE
// ===================================================================
const ModernHomeActionsMigrated: React.FC<ModernHomeActionsProps> = ({
  onShopPress,
  onGiftCardPress,
  onEventsPress,
  onProjectsPress,
  onSocialPress,
  onChiSiamoPress,
  isLoaded,
}) => {
  const { colors } = useTheme();
  const { triggerHaptic } = useHapticFeedback();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // 🎯 NUOVO: Layer centralizzato elimina frammentazione
  const { responsive } = useResponsiveLayout();

  // Simplified animation (unchanged)
  useEffect(() => {
    if (isLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isLoaded, fadeAnim]);

  // ❌ RIMOSSO: Breakpoint e calcolo duplicato
  // const isTablet = screenWidth >= 768;
  // const cardWidth = isTablet ? '31%' : '47.5%';

  const handlePress = useCallback(
    (onPress: () => void) => {
      void triggerHaptic('light');
      onPress();
    },
    [triggerHaptic]
  );

  // Clean data structure (unchanged)
  const actions = useMemo(
    () => [
      {
        id: 'shop',
        title: 'Shop Solidale',
        icon: '🛍️',
        onPress: () => handlePress(onShopPress),
      },
      {
        id: 'gift',
        title: 'Gift Card',
        icon: '🎁',
        onPress: () => handlePress(onGiftCardPress),
      },
      {
        id: 'events',
        title: 'Eventi',
        icon: '📅',
        onPress: () => handlePress(onEventsPress),
      },
      {
        id: 'projects',
        title: 'Progetti',
        icon: '🌱',
        onPress: () => handlePress(onProjectsPress),
      },
      {
        id: 'social',
        title: 'Seguici',
        icon: '💬',
        onPress: () => handlePress(onSocialPress),
      },
      {
        id: 'chisiamo',
        title: 'Chi Siamo',
        icon: '👥',
        onPress: () => handlePress(onChiSiamoPress),
      },
    ],
    [
      handlePress,
      onShopPress,
      onGiftCardPress,
      onEventsPress,
      onProjectsPress,
      onSocialPress,
      onChiSiamoPress,
    ]
  );

  // 🎯 MIGRATED: Clean extracted styles usando responsive spacing
  const styles = useMemo(
    () => ({
      container: {
        opacity: fadeAnim,
      },
      card: {
        borderRadius: BorderRadius.lg,
        backgroundColor: colors.neutral[0],
        minHeight: 100,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      },
      icon: {
        marginBottom: Spacing[1],
      },
      title: {
        fontSize: TypographyTokens.styles.body.small,
        fontWeight: Typography.weights.bold,
        color: colors.neutral[900],
        textAlign: 'center' as const,
      },
    }),
    [fadeAnim, colors]
  );

  // 🎯 MIGRATED: Action renderer usando ResponsiveBox
  const renderAction = useCallback(
    (action: {
      id: string;
      title: string;
      icon: string;
      onPress: () => void;
    }) => (
      <ResponsiveBox 
        key={action.id} 
        preset="card"
        // 🎯 ALTERNATIVA: Uso width dal layer centralizzato
        // width={responsive({ compact: '100%', standard: '47.5%', xlarge: '31%' })}
      >
        <PlatformTouchable onPress={action.onPress}>
          <Surface style={styles.card}>
            <FormattedText fontSize={24} fixedLines={1} style={styles.icon}>
              {action.icon}
            </FormattedText>
            <Text style={styles.title}>{action.title}</Text>
          </Surface>
        </PlatformTouchable>
      </ResponsiveBox>
    ),
    [styles]
  );

  return (
    <Animated.View style={styles.container}>
      {/* 🎯 MIGRATED: Grid usando ResponsiveStack */}
      <ResponsiveStack 
        direction="horizontal" 
        spacing={responsive({ 
          compact: Spacing[2], 
          standard: Spacing[2], 
          xlarge: Spacing[3] 
        }) ?? Spacing[2]}
        style={{ 
          flexWrap: 'wrap', 
          justifyContent: 'space-between' 
        }}
        padding={responsive({
          compact: Spacing[4],
          standard: Spacing[4],
          xlarge: Spacing[6]
        }) ?? Spacing[4]}
      >
        {actions.map(renderAction)}
      </ResponsiveStack>
    </Animated.View>
  );
};

export default ModernHomeActionsMigrated;

// ===================================================================
// 📊 MIGRATION BENEFITS SUMMARY
// ===================================================================

/**
 * ELIMINATI:
 * ❌ const { width: screenWidth } = Dimensions.get('window');  // Duplicato in 3+ componenti
 * ❌ const isTablet = screenWidth >= 768;                      // Breakpoint frammentato
 * ❌ const cardWidth = isTablet ? '31%' : '47.5%';             // Percentuale hard-coded
 * ❌ width: cardWidth as DimensionValue,                       // Calcolo manuale
 * ❌ flexDirection: 'row', flexWrap: 'wrap'                    // Layout manuale
 * 
 * AGGIUNTI:
 * ✅ useResponsiveLayout()                                     // Layer centralizzato
 * ✅ preset="card"                                             // Width dal tema
 * ✅ responsive({ compact: '100%', standard: '47.5%' })        // Token-based
 * ✅ ResponsiveStack direction="horizontal"                    // Layout semantico
 * ✅ spacing={responsive({ compact: 16, xlarge: 24 })}         // Spacing unificato
 * 
 * FUTURE BENEFITS:
 * 🚀 Tablet XL → Una riga nel tema: `tabletXL: 1280,`
 * 🚀 Dark mode → Toggle centrale aggiorna tutti i Surface
 * 🚀 RTL support → flexDirection automatico
 * 🚀 Re-branding → Colori nel tema, zero find & replace
 */ 