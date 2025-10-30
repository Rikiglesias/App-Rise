import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { PerfectContainer, PerfectText } from '../ui';
import { PerfectImage } from '../ui/PerfectImage';
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
    },

    titleWrapper: {
      alignItems: 'center',
    },


    titleSeparator: {
      alignItems: 'center',
      marginTop: responsiveSpacing.separatorTopMargin,
      marginBottom: responsiveSpacing.separatorBottomMargin,
      justifyContent: 'center',
      flexDirection: 'row',
    },

    separatorLine: {
      height: HomeHeaderDesignTokens.dimensions.separatorHeight,
      width: responsiveSpacing.separatorLineWidth,
      backgroundColor: HomeHeaderDesignTokens.colors.primaryLight,
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
        containerPadding: /* scaleFont(10) */ 10, // ← RIDOTTO DA 15 A 10 per meno spazio sopra
        separatorTopMargin: /* scaleFont(20) */ 20, // ← RIDOTTO DA 25 A 20
        separatorBottomMargin: /* scaleFont(10) */ 10, // ← RIDOTTO PER COMPENSARE RIMOZIONE SOTTOTITOLO
        logoSize: /* scaleFont(53) */ 53,
        separatorLineWidth: /* scaleFont(104) */ 104,
        logoMargin: /* scaleFont(15) */ 15,
        stackSpacing: /* scaleFont(8) */ 8,
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
      <PerfectContainer style={modernTitleStyles.container}>
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
          <PerfectContainer style={modernTitleStyles.titleContainer}>
            <PerfectContainer gap={responsiveSpacing.stackSpacing} style={modernTitleStyles.titleWrapper}>
                {/* Prima riga: "Rise Against" */}
                <PerfectText
                  size={38}
                  lines={1}
                  fontWeight="900"
                  textAlign="center"
                  color={HomeHeaderDesignTokens.colors.primary}
                >
                  Rise Against
                </PerfectText>

                {/* Seconda riga: "Hunger Italia" con colori diversi */}
                <PerfectText
                  size={38}
                  lines={1}
                  fontWeight="900"
                  textAlign="center"
                >
                  <Text style={{ color: HomeHeaderDesignTokens.colors.primary }}>Hunger </Text>
                  <Text style={{ color: HomeHeaderDesignTokens.colors.dark }}>Italia</Text>
                </PerfectText>

              {/* Separatore con logo centrale */}
              <PerfectContainer style={modernTitleStyles.titleSeparator}>
                <PerfectContainer style={modernTitleStyles.separatorLine} />
                <PerfectImage
                  width={Math.round(responsiveSpacing.logoSize)}
                  height={Math.round(responsiveSpacing.logoSize)}
                  source={require('../../../assets/icons/app/logo.png')}
                />
                <PerfectContainer style={modernTitleStyles.separatorLine} />
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>
        </Animated.View>
      </PerfectContainer>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
