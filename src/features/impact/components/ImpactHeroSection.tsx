import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import { PerfectText } from '../../../components/ui';
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
      <PerfectText
        size={32}
        lines={1}
        fontWeight="400"
        immunity={true}
        style={styles.heroCounter}
      >
        {heroData.mainStat}
      </PerfectText>
      <PerfectText
        size={22}
        lines={1}
        fontWeight="400"
        immunity={true}
        style={styles.heroLabel}
      >
        {heroData.label}
      </PerfectText>
      <PerfectText
        size={15}
        lines={1}
        fontWeight="400"
        immunity={true}
        style={styles.heroSubtitle}
      >
        {heroData.subtitle}
      </PerfectText>
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
    fontWeight: Typography.weights.black,
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: Spacing[2],
  },
  heroLabel: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[0],
    textAlign: 'center',
    marginBottom: Spacing[3],
  },
  heroSubtitle: {
    color: Colors.neutral[0],
    textAlign: 'center',
    opacity: 0.9,
    paddingHorizontal: Spacing[4],
  },
});

export default ImpactHeroSection;
