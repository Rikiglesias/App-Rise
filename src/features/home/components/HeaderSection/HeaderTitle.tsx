import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, StyleSheet, Platform } from 'react-native';
import { Spacing, Typography } from '../../../../shared/constants/designTokens';
import { HeaderLogo } from './HeaderLogo';

interface HeaderTitleProps {
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedNode;
  titleTransform: Animated.AnimatedNode;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
    const mainTitleDelay = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
            {/* Titolo con colori differenziati */}
            <View>
              <Text style={styles.titleText}>
                Rise Against{'\n'}Hunger{' '}
                <Text style={styles.titleTextItalia}>Italia</Text>
              </Text>
            </View>

            {/* Separatore elegante con logo centrale */}
            <HeaderLogo />
          </View>
        </Animated.View>
      </View>
    );
  }
);

HeaderTitle.displayName = 'HeaderTitle';

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
    paddingTop: Platform.OS === 'android' ? Spacing[16] : Spacing[6],
    position: 'relative',
  },

  titleText: {
    fontSize: 46,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center' as const,
    letterSpacing: -1.3,
    lineHeight: 50,
    includeFontPadding: false,
    marginBottom: 0,
  },

  titleTextItalia: {
    fontSize: 46,
    fontWeight: Typography.weights.black,
    color: '#1F2937',
    textAlign: 'center' as const,
    letterSpacing: -1.3,
    lineHeight: 50,
    includeFontPadding: false,
  },
});
