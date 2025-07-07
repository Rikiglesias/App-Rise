import React from 'react';
import { Animated, Image, Platform, StyleSheet, View } from 'react-native';

import { FormattedText } from '../ui';
import { Spacing, Typography } from '../../shared/constants/designTokens';
import { HomeHeaderTokens } from './design-tokens/HomeHeaderTokens';

interface Props {
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}

/**
 * Titolo moderno e elegante con separatore e logo centrale
 * Ottimizzato per consistenza cross-platform
 */
export const ModernSmartTitle: React.FC<Props> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
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
      <View style={styles.container}>
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
          <View style={styles.titleContainer}>
            {/* Titolo con Container Professionale - Layout Consistency Guaranteed */}
            <View style={{ width: '100%', alignItems: 'center' }}>
              <View style={{ alignItems: 'center' }}>
                <FormattedText
                  fontSize={45}
                  fontWeight="black"
                  color={HomeHeaderTokens.colors.primary}
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
                    color={HomeHeaderTokens.colors.primary}
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
                    color={HomeHeaderTokens.colors.dark}
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
            <View style={styles.titleSeparator}>
              <View style={styles.separatorLine} />
              <Image
                source={require('../../../assets/icons/app/logo.png')}
                style={styles.separatorLogo}
                resizeMode="contain"
              />
              <View style={styles.separatorLine} />
            </View>
          </View>
        </Animated.View>
      </View>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';

const styles = StyleSheet.create({
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
    ...(Platform.OS === 'android' && HomeHeaderTokens.platformStyles.android),
    ...(Platform.OS === 'ios' && HomeHeaderTokens.platformStyles.ios),
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
    width: HomeHeaderTokens.dimensions.logoMedium,
    height: HomeHeaderTokens.dimensions.logoMedium,
    marginHorizontal: Spacing[4],
    opacity: 1,
  },

  separatorLine: {
    height: HomeHeaderTokens.dimensions.separatorHeight,
    width: HomeHeaderTokens.dimensions.separatorLineWidth,
    backgroundColor: HomeHeaderTokens.colors.primaryLight,
    marginHorizontal: 0,
    borderRadius: 1,
    ...HomeHeaderTokens.shadows.light,
  },
});
