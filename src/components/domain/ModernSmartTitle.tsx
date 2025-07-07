import React from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';
import { FormattedText } from '../ui';
import { Spacing, Typography } from '../../shared/constants/designTokens';
import { HomeHeaderDesignTokens } from './design-tokens/HomeHeaderTokens';

// ✨ TITLE STYLES ELEGANTI - UTILIZZANO DESIGN TOKENS
const createModernTitleStyles = () =>
  /* eslint-disable react-native/no-unused-styles */
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: Spacing[4],
      paddingVertical: Spacing[0],
      paddingTop: Platform.OS === 'android' ? Spacing[8] : Spacing[0],
    },

    titleContainer: {
      alignItems: 'center',
      paddingVertical: Spacing[0],
      paddingHorizontal: Spacing[4],
      ...(Platform.OS === 'android' &&
        HomeHeaderDesignTokens.platformStyles.android),
      ...(Platform.OS === 'ios' && HomeHeaderDesignTokens.platformStyles.ios),
      position: 'relative',
    },

    titleText: {
      fontWeight: Typography.weights.black,
      textAlign: 'center',
      letterSpacing: -1.5,
      lineHeight: 45 * 1.15, // Aggiornato per fontSize={45}
      marginBottom: 0,
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

// ✨ CLEAN & MODERN TITLE COMPONENT
export const ModernSmartTitle: React.FC<ModernSmartTitleProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
    const modernTitleStyles = React.useMemo(
      () => createModernTitleStyles(),
      []
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
            {/* Titolo con Container Professionale - Layout Consistency Guaranteed */}
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <FormattedText
                  fontSize={45}
                  fontWeight="black"
                  color={HomeHeaderDesignTokens.colors.primary}
                  lineBreakStrategyIOS="push-out"
                  breakStrategyAndroid="highQuality"
                  hyphenationFrequencyAndroid="full"
                  style={{
                    textAlign: 'center',
                    fontWeight: '900',
                    lineHeight: 50,
                  }}
                >
                  Rise Against
                </FormattedText>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <FormattedText
                    fontSize={45}
                    fontWeight="black"
                    color={HomeHeaderDesignTokens.colors.primary}
                    lineBreakStrategyIOS="push-out"
                    breakStrategyAndroid="highQuality"
                    hyphenationFrequencyAndroid="full"
                    style={{
                      fontWeight: '900',
                    }}
                  >
                    Hunger{' '}
                  </FormattedText>
                  <FormattedText
                    fontSize={45}
                    fontWeight="black"
                    color={HomeHeaderDesignTokens.colors.dark}
                    lineBreakStrategyIOS="push-out"
                    breakStrategyAndroid="highQuality"
                    hyphenationFrequencyAndroid="full"
                    style={{
                      fontWeight: '900',
                    }}
                  >
                    Italia
                  </FormattedText>
                </View>
              </View>
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
          </View>
        </Animated.View>
      </View>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
