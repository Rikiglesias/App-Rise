import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import { FormattedText } from '../../../components/ui/FormattedText';
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
      <FormattedText fontSize={32} style={styles.heroCounter}>
        {heroData.mainStat}
      </FormattedText>
      <FormattedText fontSize={22} style={styles.heroLabel}>
        {heroData.label}
      </FormattedText>
      <FormattedText fontSize={15} style={styles.heroSubtitle}>
        {heroData.subtitle}
      </FormattedText>
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
