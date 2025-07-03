import React from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

import { TypographyTokens } from '../../../shared/constants/responsiveSystem';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '../../../shared/constants';

interface Props {
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  heroData: {
    mainStat: string;
    label: string;
    subtitle: string;
  };
}

const ImpactHeroSection: React.FC<Props> = ({
  fadeAnim,
  slideAnim,
  heroData,
}) => {
  return (
    <Animated.View
      style={[
        styles.heroSection,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Text style={styles.heroCounter}>{heroData.mainStat}</Text>
      <Text style={styles.heroLabel}>{heroData.label}</Text>
      <Text style={styles.heroSubtitle}>{heroData.subtitle}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[8],
    alignItems: 'center',
    borderBottomLeftRadius: BorderRadius['2xl'],
    borderBottomRightRadius: BorderRadius['2xl'],
    ...Shadows.lg,
  },
  heroCounter: {
    fontSize: TypographyTokens.styles.display.small,
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  heroLabel: {
    fontSize: TypographyTokens.styles.title.large,
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  heroSubtitle: {
    fontSize: TypographyTokens.styles.body.medium,
    color: Colors.neutral[0],
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: Spacing[4],
  },
});

export default ImpactHeroSection;
