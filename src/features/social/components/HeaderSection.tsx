import React from 'react';
import { Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PerfectText, PerfectContainer } from '../../../components/ui';
import { Colors, Spacing } from '../../../shared/constants';
import {
  LOGICAL_REFERENCE,
  scale,
} from '../../../shared/constants/perfectScale';

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
            size={scale(32)}
            color={Colors.primary[600]}
          />
        </PerfectContainer>

        <PerfectText
          size={28}
          lines={1}
          fontWeight="700"
          containerWidth={LOGICAL_REFERENCE.width * 0.7}
          style={styles.headerTitle}
        >
          Seguici sui Social
        </PerfectText>

        <PerfectText
          size={16}
          lines={2}
          fontWeight="500"
          containerWidth={LOGICAL_REFERENCE.width * 0.7}
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
    width: /* scaleFont(80) */ 80,
    height: /* scaleFont(80) */ 80,
    borderRadius: /* scaleFont(40) */ 40,
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
    color: Colors.neutral[900],
    textAlign: 'center' as const,
    marginBottom: Spacing[3],
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: Colors.neutral[600],
    textAlign: 'center' as const,
    paddingHorizontal: Spacing[2],
  },
};
