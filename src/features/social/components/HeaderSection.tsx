import React from 'react';
import { Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PerfectText, PerfectContainer } from '../../../components/ui';
import { Colors, Spacing, Typography } from '../../../shared/constants';
import responsiveSystem, {
  scaleFont,
  scaleDimensionLinear,
} from '../../../shared/constants/responsiveSystem';

interface HeaderSectionProps {
  readonly animationValue: Animated.Value;
}

export const HeaderSection: React.FC<HeaderSectionProps> = React.memo(
  ({ animationValue }) => {
    return (
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: animationValue,
            transform: [
              {
                translateY: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <PerfectContainer style={styles.headerIconContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={scaleDimensionLinear(32)}
            color={Colors.primary[600]}
          />
        </PerfectContainer>

        <PerfectText
          size={28}
          lines={1}
          containerWidth={
            (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
          }
          style={styles.headerTitle}
        >
          Seguici sui Social
        </PerfectText>

        <PerfectText
          size={16}
          lines={2}
          containerWidth={
            (responsiveSystem?.LOGICAL_REFERENCE?.width ?? 393) * 0.7
          }
          style={styles.headerSubtitle}
        >
          Resta aggiornato sulle nostre iniziative e scopri come puoi
          contribuire al cambiamento
        </PerfectText>
      </Animated.View>
    );
  }
);

HeaderSection.displayName = 'HeaderSection';

const styles = {
  headerContainer: {
    alignItems: 'center' as const,
    marginBottom: Spacing[8],
    paddingHorizontal: Spacing[4],
  },
  headerIconContainer: {
    width: scaleFont(80),
    height: scaleFont(80),
    borderRadius: scaleFont(40),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: Spacing[4],
    shadowColor: Colors.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[900],
    textAlign: 'center' as const,
    marginBottom: Spacing[3],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontWeight: Typography.weights.medium,
    color: Colors.neutral[600],
    textAlign: 'center' as const,
    lineHeight: scaleFont(24),
    paddingHorizontal: Spacing[2],
  },
};
