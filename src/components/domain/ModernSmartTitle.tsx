import React from 'react';
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { ResponsiveBox, ResponsiveStack } from '../ui';
import { useResponsiveLayout } from '../../shared/hooks';
import { Spacing } from '../../shared/constants/designTokens';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';
import { scaleFont } from '../../shared/constants/responsiveSystem';

// ✨ TITLE STYLES ELEGANTI - UTILIZZANO DESIGN TOKENS + SISTEMA RESPONSIVE
const createModernTitleStyles = () =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: Spacing[0],
      paddingTop: Platform.OS === 'android' ? Spacing[8] : Spacing[0],
    },

    titleContainer: {
      alignItems: 'center',
      paddingVertical: Spacing[0],
      ...(Platform.OS === 'android' &&
        HomeHeaderDesignTokens.platformStyles.android),
      ...(Platform.OS === 'ios' && HomeHeaderDesignTokens.platformStyles.ios),
      position: 'relative',
    },

    titleSeparator: {
      alignItems: 'center',
      marginTop: Spacing[2],
      marginBottom: Spacing[1],
      justifyContent: 'center',
      flexDirection: 'row',
    },

    separatorLogo: {
      width: HomeHeaderDesignTokens.dimensions.logoMedium,
      height: HomeHeaderDesignTokens.dimensions.logoMedium,
      marginHorizontal: Spacing[4],
      opacity: 1,
    },

    separatorLine: {
      height: HomeHeaderDesignTokens.dimensions.separatorHeight,
      width: HomeHeaderDesignTokens.dimensions.separatorLineWidth,
      backgroundColor: HomeHeaderDesignTokens.colors.primaryLight,
      marginHorizontal: 0,
      borderRadius: 1,
      ...HomeHeaderDesignTokens.shadows.light,
    },
  });
/* eslint-enable react-native/no-unused-styles */

// Props per ModernSmartTitle
export interface ModernSmartTitleProps {
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}

// ✨ SISTEMA BI-DIREZIONALE INTELLIGENTE - MODERN TITLE COMPONENT
export const ModernSmartTitle: React.FC<ModernSmartTitleProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
    const modernTitleStyles = React.useMemo(
      () => createModernTitleStyles(),
      []
    );
    const { responsive } = useResponsiveLayout();

    // Animazione semplice e professionale
    const mainTitleDelay = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
      const titleAnimation = Animated.timing(mainTitleDelay, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      });

      titleAnimation.start();
    }, [mainTitleDelay]);

    return (
      <ResponsiveBox preset="container" style={modernTitleStyles.container}>
        <Animated.View
          style={{
            opacity: Animated.multiply(
              Animated.multiply(titleAnim, titleOpacity as Animated.Value),
              mainTitleDelay
            ),
            transform: [
              {
                translateY: Animated.add(
                  titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                  }),
                  titleTransform as Animated.Value
                ),
              },
            ],
          }}
        >
          <View style={modernTitleStyles.titleContainer}>
            {/* TITOLO UNIFICATO - Dimensioni Consistenti Garantite */}
            <ResponsiveStack
              spacing={responsive({ compact: 4, xlarge: 8 }) ?? 4}
              style={{ alignItems: 'center' }}
            >
              {/* PRIMA RIGA - Rise Against */}
              <Text
                allowFontScaling={false} // ← DISABILITATO: dimensioni identiche garantite
                numberOfLines={1} // ← 1 riga esatta
                adjustsFontSizeToFit={true} // ← RIDIMENSIONA AUTOMATICAMENTE (nativo React Native)
                minimumFontScale={0.8} // ← LIMITE MINIMO 80% (mantiene qualità)
                style={{
                  fontSize: scaleFont(42), // ← DIMENSIONE BASE SCALATA UNA VOLTA
                  textAlign: 'center',
                  fontWeight: '900',
                  color: HomeHeaderDesignTokens.colors.primary,
                }}
              >
                Rise Against
              </Text>

              {/* SECONDA RIGA - Hunger Italia (PARAMETRI IDENTICI) */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text
                  allowFontScaling={false} // ← DISABILITATO: dimensioni identiche garantite
                  numberOfLines={1} // ← 1 riga esatta
                  adjustsFontSizeToFit={true} // ← RIDIMENSIONA AUTOMATICAMENTE (nativo React Native)
                  minimumFontScale={0.8} // ← LIMITE MINIMO 80% (mantiene qualità)
                  style={{
                    fontSize: scaleFont(42), // ← DIMENSIONE BASE SCALATA UNA VOLTA
                    textAlign: 'center',
                    fontWeight: '900',
                    color: '#DC2626', // ← SOLO IL COLORE CAMBIA
                  }}
                >
                  Hunger{' '}
                </Text>
                <Text
                  allowFontScaling={false} // ← DISABILITATO: dimensioni identiche garantite
                  numberOfLines={1} // ← 1 riga esatta
                  adjustsFontSizeToFit={true} // ← RIDIMENSIONA AUTOMATICAMENTE (nativo React Native)
                  minimumFontScale={0.8} // ← LIMITE MINIMO 80% (mantiene qualità)
                  style={{
                    fontSize: scaleFont(42), // ← DIMENSIONE BASE SCALATA UNA VOLTA
                    textAlign: 'center',
                    fontWeight: '900',
                    color: HomeHeaderDesignTokens.colors.dark, // ← SOLO IL COLORE CAMBIA
                  }}
                >
                  Italia
                </Text>
              </View>

              {/* Separatore elegante con logo simbolico centrale */}
              <View style={modernTitleStyles.titleSeparator}>
                <View style={modernTitleStyles.separatorLine} />
                <Image
                  source={require('../../../assets/icons/app/logo.png')}
                  style={modernTitleStyles.separatorLogo}
                  resizeMode="contain"
                />
                <View style={modernTitleStyles.separatorLine} />
              </View>
            </ResponsiveStack>
          </View>
        </Animated.View>
      </ResponsiveBox>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
