import React from 'react';
import { Animated, Image, StyleSheet, View, Text } from 'react-native';
import { PerfectContainer } from '../ui';
import { scaleFont } from '../../shared/constants/responsiveSystem';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';

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
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: responsiveSpacing.containerPadding + 10, // ← SPAZIO SOPRA RESPONSIVE
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

// Props per ModernSmartTitle
export interface ModernSmartTitleProps {
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}

// ✨ PERFECT SYSTEM INTEGRATION - MODERN TITLE COMPONENT
export const ModernSmartTitle: React.FC<ModernSmartTitleProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
    // ✅ PERFECT SYSTEM - Responsive scaling automatico
    const responsiveSpacing = React.useMemo(() => {
      return {
        containerPadding: scaleFont(30),
        separatorTopMargin: scaleFont(33), // ← ALLONTANA SEPARATORE DAL TITOLO
        separatorBottomMargin: scaleFont(0), // ← AVVICINA IMMAGINE ALLA LINEA
        logoSize: scaleFont(53),
        separatorLineWidth: scaleFont(104),
        logoMargin: scaleFont(15),
        stackSpacing: scaleFont(8),
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
            {/* TITOLO SISTEMA RESPONSIVE COMPLETO - SINGOLO FormattedText per Garantire 2 Righe Fisse */}
            <PerfectContainer
              gap={responsiveSpacing.stackSpacing}
              style={{ alignItems: 'center' }}
            >
              {/* TITOLO COMPLETO - LAYOUT ASSOLUTO PER CONTROLLO TOTALE INTERLINEA */}
              <View style={{ alignItems: 'center', height: scaleFont(80) }}>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.65}
                  style={{
                    fontSize: scaleFont(48),
                    fontWeight: '900',
                    textAlign: 'center',
                    color: HomeHeaderDesignTokens.colors.primary,
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                  }}
                >
                  Rise Against
                </Text>
                <Text
                  allowFontScaling={false}
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  minimumFontScale={0.65}
                  style={{
                    fontSize: scaleFont(48),
                    fontWeight: '900',
                    textAlign: 'center',
                    position: 'absolute',
                    top: scaleFont(55), // ← CONTROLLO ASSOLUTO POSIZIONE SECONDA RIGA
                    width: '100%',
                  }}
                >
                  <Text style={{ color: '#DC2626' }}>Hunger </Text>
                  <Text style={{ color: HomeHeaderDesignTokens.colors.dark }}>
                    Italia
                  </Text>
                </Text>
              </View>

              {/* Separatore elegante con logo simbolico centrale */}
              <View style={modernTitleStyles.titleSeparator}>
                <View style={modernTitleStyles.separatorLine} />
                <Image
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  source={require('../../../assets/icons/app/logo.png')}
                  style={modernTitleStyles.separatorLogo}
                  resizeMode="contain"
                />
                <View style={modernTitleStyles.separatorLine} />
              </View>
            </PerfectContainer>
          </View>
        </Animated.View>
      </View>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
