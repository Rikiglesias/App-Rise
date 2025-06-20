/* eslint-disable react-native/no-unused-styles */
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';

import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import type { useImpactAnimations } from './ImpactAnimations';

const { width: screenWidth } = Dimensions.get('window');

// 🎨 MODERN IMPACT HEADER STYLES - Estratti per evitare falsi positivi ESLint
const modernImpactHeaderStyles = StyleSheet.create({
  headerContainer: {
    paddingTop: Spacing[8],
    paddingHorizontal: Spacing[4],
    paddingBottom: Spacing[6],
    alignItems: 'center',
  },
  titleGradientContainer: {
    alignSelf: 'stretch',
    marginHorizontal: Spacing[2],
    marginBottom: Spacing[4],
  },
  titleGradientBorder: {
    borderRadius: 24,
    padding: 3,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 21,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  titleText: {
    fontSize: screenWidth > 375 ? 36 : 30,
    fontWeight: Typography.weights.black,
    color: '#DC2626',
    textAlign: 'center',
    letterSpacing: -0.8,
    textShadowColor: 'rgba(220, 38, 38, 0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    includeFontPadding: false,
  },
  subtitleContainer: {
    marginHorizontal: Spacing[3],
    backgroundColor: 'rgba(31, 41, 55, 0.05)',
    borderRadius: 18,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderWidth: 1,
    borderColor: 'rgba(31, 41, 55, 0.1)',
  },
  subtitleText: {
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.medium,
    color: '#374151',
    textAlign: 'center',
    lineHeight: Typography.lineHeights.relaxed * Typography.sizes.base,
    letterSpacing: 0.2,
  },
});

const ModernImpactHeader: React.FC<{
  animations: ReturnType<typeof useImpactAnimations>;
}> = ({ animations }) => {
  return (
    <Animated.View
      style={[
        modernImpactHeaderStyles.headerContainer,
        {
          opacity: animations.fadeAnim,
          transform: [
            { translateY: animations.slideAnim },
            { scale: animations.scaleAnim },
          ],
        },
      ]}
    >
      <View style={modernImpactHeaderStyles.titleGradientContainer}>
        <LinearGradient
          colors={['#DC2626', '#B91C1C', '#991B1B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={modernImpactHeaderStyles.titleGradientBorder}
        >
          <View style={modernImpactHeaderStyles.titleContent}>
            <Text style={modernImpactHeaderStyles.titleText}>
              Il Nostro Impatto
            </Text>
          </View>
        </LinearGradient>
      </View>

      <View style={modernImpactHeaderStyles.subtitleContainer}>
        <Text style={modernImpactHeaderStyles.subtitleText}>
          Risultati concreti nella lotta contro la fame mondiale grazie al
          supporto di volontari, aziende e cittadini
        </Text>
      </View>
    </Animated.View>
  );
};

export default ModernImpactHeader;
