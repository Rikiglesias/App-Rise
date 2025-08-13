import React from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  View,
  Dimensions,
  Text,
} from 'react-native';
import { PerfectContainer } from '../ui';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';
import { findDeviceByWidth } from '../../shared/constants/deviceResolutionsDatabase';
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
    // ✅ ALGORITMO MILLIMETRICO UNIVERSALE - Proporzioni identiche su TUTTI i dispositivi
    const responsiveSpacing = React.useMemo(() => {
      // STEP 1: Rileva dispositivo corrente dal database universale
      const { width: currentDeviceWidth } = Dimensions.get('window');
      const currentDeviceData = findDeviceByWidth(currentDeviceWidth)[0]; // Primo match

      // STEP 2: iPhone 15 come riferimento assoluto (393px - CORREZIONE CRITICA)
      const REFERENCE_DEVICE = {
        width: 393, // iPhone 15 - CORREZIONE 414→393px
        containerPadding: 30, // 7.63% della larghezza (30/393)
        separatorTopMargin: 8, // 2.04% della larghezza
        separatorBottomMargin: 4, // 1.02% della larghezza
        logoSize: 53, // 13.49% della larghezza
        separatorLineWidth: 104, // 26.46% della larghezza
        logoMargin: 15, // 3.82% della larghezza
        stackSpacing: 8, // 2.04% della larghezza
      };

      // STEP 3: Calcola proporzioni percentuali MILLIMETRICHE
      const calculateProportionalSize = (
        referenceValue: number,
        referenceWidth: number,
        currentWidth: number
      ) => {
        const proportion = referenceValue / referenceWidth; // Percentuale del riferimento
        return Math.round(currentWidth * proportion); // Applicata al dispositivo corrente
      };

      // STEP 4: Applica proporzioni al dispositivo corrente
      const deviceWidth = currentDeviceData?.width ?? currentDeviceWidth;

      return {
        containerPadding: calculateProportionalSize(
          REFERENCE_DEVICE.containerPadding,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 32px | Redmi 393px: 30px | iPad 768px: 59px

        separatorTopMargin: calculateProportionalSize(
          REFERENCE_DEVICE.separatorTopMargin,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 8px | Redmi: 8px | iPad: 15px

        separatorBottomMargin: calculateProportionalSize(
          REFERENCE_DEVICE.separatorBottomMargin,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 4px | Redmi: 4px | iPad: 7px

        logoSize: calculateProportionalSize(
          REFERENCE_DEVICE.logoSize,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 56px | Redmi: 53px | iPad: 104px

        separatorLineWidth: calculateProportionalSize(
          REFERENCE_DEVICE.separatorLineWidth,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 110px | Redmi: 104px | iPad: 204px

        logoMargin: calculateProportionalSize(
          REFERENCE_DEVICE.logoMargin,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 16px | Redmi: 15px | iPad: 30px

        stackSpacing: calculateProportionalSize(
          REFERENCE_DEVICE.stackSpacing,
          REFERENCE_DEVICE.width,
          deviceWidth
        ), // iPhone 15: 8px | Redmi: 8px | iPad: 15px
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
              {/* TITOLO COMPLETO - TEXT NATIVO PER CONTROLLO ASSOLUTO */}
              <Text
                allowFontScaling={false} // ← BLOCCA QUALSIASI SCALING
                numberOfLines={2} // ← MASSIMO 2 RIGHE
                adjustsFontSizeToFit={true} // ← AUTO-ADJUST PER 2 RIGHE
                minimumFontScale={0.8} // ← RIDUZIONE MINIMA PER FIT
                style={{
                  fontSize: scaleFont(48), // ← DIMENSIONE SCALATA UNA VOLTA SOLA
                  fontWeight: '900', // ← BLACK WEIGHT
                  textAlign: 'center',
                  color: HomeHeaderDesignTokens.colors.primary,
                  lineHeight: scaleFont(52), // ← LINE HEIGHT PROPORZIONALE
                }}
              >
                Rise Against{'\n'}
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
            </PerfectContainer>
          </View>
        </Animated.View>
      </View>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
