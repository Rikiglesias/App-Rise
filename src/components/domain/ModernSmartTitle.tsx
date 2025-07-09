import React from 'react';
import { Animated, Image, StyleSheet, View, Text } from 'react-native';
import { ResponsiveStack } from '../ui';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';
import { scaleFont } from '../../shared/constants/responsiveSystem';

// ✨ TITLE STYLES ELEGANTI - UTILIZZANO DESIGN TOKENS + SISTEMA RESPONSIVE
const createModernTitleStyles = (responsiveSpacing: {
  containerPadding: number;
  separatorTopMargin: number;
  separatorBottomMargin: number;
  logoSize: number;
  separatorLineWidth: number;
  logoMargin: number;
  stackSpacing: number;
}) =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: 40, // ← SPAZIO SOPRA IL TITOLO AGGIUNTO
      paddingBottom: 0,
      paddingHorizontal: responsiveSpacing.containerPadding, // ← MATEMATICO DIRETTO
      width: '100%', // ← LARGHEZZA CONTROLLATA
    },

    titleContainer: {
      alignItems: 'center',
      paddingVertical: 0,
      position: 'relative',
    },

    titleSeparator: {
      alignItems: 'center',
      marginTop: responsiveSpacing.separatorTopMargin,
      marginBottom: responsiveSpacing.separatorBottomMargin,
      justifyContent: 'center',
      flexDirection: 'row',
    },

    separatorLogo: {
      width: responsiveSpacing.logoSize,
      height: responsiveSpacing.logoSize,
      marginHorizontal: responsiveSpacing.logoMargin,
      opacity: 1,
    },

    separatorLine: {
      height: HomeHeaderDesignTokens.dimensions.separatorHeight,
      width: responsiveSpacing.separatorLineWidth,
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
    // ✅ SCALING MATEMATICO UNIFICATO - Stesse proporzioni ovunque come iPhone 15
    const responsiveSpacing = React.useMemo(() => {
      // PROPORZIONI BASE da iPhone 15 (dispositivo di riferimento)
      const baseFontSize = 42;
      const baseSpacing = {
        containerPadding: 32, // ← AUMENTATO: più spazio laterale Android
        separatorTopMargin: 8,
        separatorBottomMargin: 4,
        logoSize: 56,
        separatorLineWidth: 110,
        logoMargin: 16,
        stackSpacing: 8, // ← AUMENTATO: più spazio tra righe su Android
      };

      // Calcolo scaling factor IDENTICO a scaleFont()
      const scaledFontSize = scaleFont(baseFontSize);
      const scaleFactor = scaledFontSize / baseFontSize;

      // TUTTO scala con la stessa matematica del font
      return {
        containerPadding: Math.round(
          baseSpacing.containerPadding * scaleFactor
        ),
        separatorTopMargin: Math.round(
          baseSpacing.separatorTopMargin * scaleFactor
        ),
        separatorBottomMargin: Math.round(
          baseSpacing.separatorBottomMargin * scaleFactor
        ),
        logoSize: Math.round(baseSpacing.logoSize * scaleFactor),
        separatorLineWidth: Math.round(
          baseSpacing.separatorLineWidth * scaleFactor
        ),
        logoMargin: Math.round(baseSpacing.logoMargin * scaleFactor),
        stackSpacing: Math.round(baseSpacing.stackSpacing * scaleFactor),
      };
    }, []);

    const modernTitleStyles = React.useMemo(
      () => createModernTitleStyles(responsiveSpacing),
      [responsiveSpacing]
    );

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
      <View style={modernTitleStyles.container}>
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
              spacing={responsiveSpacing.stackSpacing}
              style={{ alignItems: 'center' }}
            >
              {/* PRIMA RIGA - Rise Against */}
              <Text
                allowFontScaling={false} // ← DISABILITATO: dimensioni identiche garantite
                numberOfLines={1} // ← 1 riga esatta
                adjustsFontSizeToFit={true} // ← RIDIMENSIONA AUTOMATICAMENTE (nativo React Native)
                minimumFontScale={0.8} // ← LIMITE MINIMO 80% (mantiene qualità)
                style={{
                  fontSize: scaleFont(48), // ← DIMENSIONE AUMENTATA DA 42 A 48
                  lineHeight: scaleFont(54), // ← LINE HEIGHT PROPORZIONALE
                  textAlign: 'center',
                  fontWeight: '900',
                  color: HomeHeaderDesignTokens.colors.primary,
                }}
              >
                Rise Against
              </Text>

              {/* SECONDA RIGA - Hunger Italia (UN SOLO TEXT per spacing consistente) */}
              <Text
                allowFontScaling={false} // ← DISABILITATO: dimensioni identiche garantite
                numberOfLines={1} // ← 1 riga esatta
                adjustsFontSizeToFit={true} // ← RIDIMENSIONA AUTOMATICAMENTE (nativo React Native)
                minimumFontScale={0.8} // ← LIMITE MINIMO 80% (mantiene qualità)
                style={{
                  fontSize: scaleFont(48), // ← DIMENSIONE AUMENTATA DA 42 A 48
                  lineHeight: scaleFont(54), // ← LINE HEIGHT PROPORZIONALE
                  textAlign: 'center',
                  fontWeight: '900',
                  color: '#DC2626', // ← COLORE ROSSO UNIFICATO
                }}
              >
                <Text style={{ color: '#DC2626' }}>Hunger </Text>
                <Text style={{ color: HomeHeaderDesignTokens.colors.dark }}>
                  Italia
                </Text>
              </Text>

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
      </View>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
