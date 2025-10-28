import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { PerfectContainer, PerfectText } from '../ui';
import { PerfectImage } from '../ui/PerfectImage';
import {
  scaleFont,
  getMillimetricScale,
} from '../../shared/constants/responsiveSystem';
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
      paddingTop: 0, // ← ELIMINATO COMPLETAMENTE il padding sopra per massima riduzione spazio
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
        containerPadding: scaleFont(10), // ← RIDOTTO DA 15 A 10 per meno spazio sopra
        separatorTopMargin: scaleFont(20), // ← RIDOTTO DA 25 A 20
        separatorBottomMargin: scaleFont(10), // ← RIDOTTO PER COMPENSARE RIMOZIONE SOTTOTITOLO
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
              {/* ✅ PERFECT SYSTEM - Titolo principale su due righe separate */}
              <View style={{ alignItems: 'center' }}>
                {/* Prima riga: "Rise Against" */}
                <PerfectText
                  size={48}
                  lines={1}
                  immunity={true}
                  fontWeight="900"
                  textAlign="center"
                  color={HomeHeaderDesignTokens.colors.primary}
                >
                  Rise Against
                </PerfectText>

                {/* Seconda riga: "Hunger Italia" con colori diversi */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <PerfectText
                    size={48}
                    lines={1}
                    immunity={true}
                    fontWeight="900"
                    color="#DC2626"
                  >
                    Hunger{' '}
                  </PerfectText>
                  <PerfectText
                    size={48}
                    lines={1}
                    immunity={true}
                    fontWeight="900"
                    color={HomeHeaderDesignTokens.colors.dark}
                  >
                    Italia
                  </PerfectText>
                </View>
              </View>

              {/* Separatore elegante con logo simbolico centrale */}
              <View style={modernTitleStyles.titleSeparator}>
                <View style={modernTitleStyles.separatorLine} />
                {(() => {
                  const size = modernTitleStyles.separatorLogo.width as number;
                  const scale = getMillimetricScale();
                  const ref = Math.round(size / scale);
                  return (
                    <PerfectImage
                      width={ref}
                      height={ref}
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                      source={require('../../../assets/icons/app/logo.png')}
                      imageStyle={{ resizeMode: 'contain' }}
                    />
                  );
                })()}
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
