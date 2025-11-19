import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { PerfectContainer, PerfectText } from '@/components/ui';
import { PerfectImage } from '@/components/ui/PerfectImage';
import { Colors, PerfectSpacing, Shadows } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface ResponsiveSpacing {
  containerPadding: number;
  separatorTopMargin: number;
  separatorBottomMargin: number;
  logoSize: number;
  separatorLineWidth: number;
  separatorMaxWidth: number;
  stackSpacing: number;
}

const createModernTitleStyles = (spacing: ResponsiveSpacing) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: 0,
      paddingBottom: 0,
      paddingHorizontal: spacing.containerPadding,
      width: '100%',
    },
    titleContainer: {
      alignItems: 'center',
    },
    titleWrapper: {
      alignItems: 'center',
    },
    titleSeparator: {
      alignItems: 'center',
      marginTop: spacing.separatorTopMargin,
      marginBottom: spacing.separatorBottomMargin,
      justifyContent: 'center',
      flexDirection: 'row',
      gap: PerfectSpacing.md,
      width: '100%',
      maxWidth: spacing.separatorMaxWidth,
    },
    separatorLine: {
      flex: 1,
      minWidth: scale(48),
      maxWidth: spacing.separatorLineWidth,
      height: scale(2),
      backgroundColor: Colors.primary[200],
      borderRadius: scale(1),
      ...Shadows.sm,
    },
    titleText: {
      fontWeight: '900' as const,
      color: Colors.primary[500],
    },
  });

export interface ModernSmartTitleProps {
  titleAnim: Animated.Value;
  titleOpacity: Animated.AnimatedInterpolation<number>;
  titleTransform: Animated.AnimatedInterpolation<number>;
}

export const ModernSmartTitle: React.FC<ModernSmartTitleProps> = React.memo(
  ({ titleAnim, titleOpacity, titleTransform }) => {
    const responsiveSpacing = useMemo<ResponsiveSpacing>(
      () => ({
        containerPadding: scale(10),
        separatorTopMargin: scale(20),
        separatorBottomMargin: scale(10),
        logoSize: 53,
        separatorLineWidth: scale(104),
        separatorMaxWidth: scale(320),
        stackSpacing: scale(4),
      }),
      []
    );

    const styles = useMemo(
      () => createModernTitleStyles(responsiveSpacing),
      [responsiveSpacing]
    );

    const mainTitleDelay = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const titleAnimation = Animated.timing(mainTitleDelay, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      });

      titleAnimation.start();

      return () => {
        titleAnimation.stop();
      };
    }, [mainTitleDelay]);

    return (
      <PerfectContainer style={styles.container}>
        <Animated.View
          style={{
            opacity: Animated.multiply(
              Animated.multiply(titleAnim, titleOpacity),
              mainTitleDelay
            ),
            transform: [
              {
                translateY: Animated.add(
                  titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [scale(30), 0],
                  }),
                  titleTransform
                ),
              },
            ],
          }}
        >
          <PerfectContainer style={styles.titleContainer}>
            <PerfectContainer
              gap={responsiveSpacing.stackSpacing}
              style={styles.titleWrapper}
            >
              <PerfectText
                size={44}
                lines={1}
                fontWeight="900"
                textAlign="center"
                color={Colors.primary[500]}
                style={styles.titleText}
              >
                Rise Against
              </PerfectText>

              <PerfectText
                size={44}
                lines={1}
                fontWeight="900"
                textAlign="center"
                color={Colors.primary[500]}
                style={styles.titleText}
              >
                Hunger{' '}
                <PerfectText
                  size={44}
                  lines={1}
                  fontWeight="900"
                  color={Colors.neutral[900]}
                >
                  Italia ❤️
                </PerfectText>
              </PerfectText>

              <PerfectContainer style={styles.titleSeparator}>
                <PerfectContainer style={styles.separatorLine} />
                <PerfectImage
                  width={responsiveSpacing.logoSize}
                  height={responsiveSpacing.logoSize}
                  source={require('@assets/icons/app/splash-screen.png')}
                  accessibilityRole="image"
                  accessibilityLabel="Logo Rise Against Hunger"
                />
                <PerfectContainer style={styles.separatorLine} />
              </PerfectContainer>
            </PerfectContainer>
          </PerfectContainer>
        </Animated.View>
      </PerfectContainer>
    );
  }
);

ModernSmartTitle.displayName = 'ModernSmartTitle';
