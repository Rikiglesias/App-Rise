import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { scale } from '@/shared/constants/perfectScale';
import { Colors, PerfectSpacing, Shadows } from '@/shared/constants';
import { PerfectContainer, PerfectText } from '@/components/ui';
import { PerfectImage } from '@/components/ui/PerfectImage';

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
      paddingTop: 0,
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
      gap: PerfectSpacing.md, // Spacing tra linee e logo
    },

    separatorLine: {
      height: scale(2), // Linea sottile elegante
      width: responsiveSpacing.separatorLineWidth,
      backgroundColor: Colors.primary[200], // Colore primario chiaro
      borderRadius: scale(1),
      ...Shadows.sm,
    },

    // Stili per testo titolo
    titleText: {
      fontWeight: '900' as const,
      color: Colors.primary[500],
    },
    italiaText: {
      fontWeight: '900' as const,
      color: Colors.neutral[900],
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
        containerPadding: scale(10),
        separatorTopMargin: scale(20),
        separatorBottomMargin: scale(10),
        logoSize: 53, // NON scalato - PerfectImage lo scala automaticamente
        separatorLineWidth: scale(104),
        logoMargin: scale(15),
        stackSpacing: scale(4), // Ridotto per meno spazio tra le righe
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
                    outputRange: [scale(30), 0],
                  }),
                  titleTransform as Animated.Value
                ),
              },
            ],
          }}
        >
          <PerfectContainer style={modernTitleStyles.titleContainer}>
            <PerfectContainer
              gap={responsiveSpacing.stackSpacing}
              style={modernTitleStyles.titleWrapper}
            >
              {/* Prima riga: "Rise Against" */}
              <PerfectText
                size={44}
                lines={1}
                fontWeight="900"
                textAlign="center"
                color={Colors.primary[500]}
              >
                Rise Against
              </PerfectText>

              {/* Seconda riga: "Hunger Italia" con colori diversi */}
              <PerfectText
                size={44}
                lines={1}
                fontWeight="900"
                textAlign="center"
                color={Colors.primary[500]}
              >
                Hunger <Text style={modernTitleStyles.italiaText}>Italia</Text>
              </PerfectText>

              {/* Separatore con logo centrale */}
              <PerfectContainer style={modernTitleStyles.titleSeparator}>
                <PerfectContainer style={modernTitleStyles.separatorLine} />
                <PerfectImage
                  width={responsiveSpacing.logoSize}
                  height={responsiveSpacing.logoSize}
                  source={require('@assets/icons/app/logo.png')}
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
