import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import type { useImpactAnimations } from '../hooks/useImpactAnimations';
import {
  PerfectText,
  PlatformTouchable,
  PerfectContainer,
} from '@/components/ui';
import { Colors, BorderRadius, Shadows  } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

interface Props {
  animations: ReturnType<typeof useImpactAnimations>;
  onVolunteersPress: () => void;
  onPartnersPress: () => void;
}

/**
 * Sezione community con volontari e partner, header decorativo e card interattive
 */
export const CommunitySection: React.FC<Props> = ({
  animations,
  onVolunteersPress,
  onPartnersPress,
}) => {
  return (
    <PerfectContainer style={styles.communitySection}>
      {/* Header RIVOLUZIONATO con elementi community */}
      <Animated.View
        style={[
          styles.communityHeaderContainer,
          {
            opacity: animations.statsAnimations[2],
            transform: [{ scale: animations.statsAnimations[2] }],
          },
        ]}
      >
        <PerfectContainer style={styles.communityHeaderBackground}>
          <PerfectText
            size={22}
            lines={1}
            fontWeight="700"
            immunity={true}
            style={styles.communityTitle}
          >
            🤝 La Nostra Community
          </PerfectText>
          <PerfectText
            size={16}
            lines={1}
            immunity={true}
            style={styles.communitySubtitle}
          >
            Volontari e partner uniti nella missione #famezero
          </PerfectText>
        </PerfectContainer>
      </Animated.View>

      <PerfectContainer style={styles.communityRow}>
        <Animated.View
          style={[
            styles.communityCard,
            {
              opacity: animations.statsAnimations[2],
              transform: [{ scale: animations.statsAnimations[2] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onVolunteersPress} activeOpacity={0.9}>
            <LinearGradient
              colors={[Colors.gradients.success[1], Colors.gradients.success[0], Colors.gradients.success[2]]}
              style={styles.communityGradientContainer}
            >
              <PerfectContainer style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={scale(28)}
                  color={Colors.semantic.success.main}
                  style={styles.communityCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  fontWeight="700"
                  immunity={true}
                  style={styles.communityStatValue}
                >
                  13.323
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  fontWeight="600"
                  immunity={true}
                  style={styles.communityStatLabel}
                >
                  Volontari 2024
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={scale(20)}
                  color={Colors.semantic.success.main}
                  style={styles.chevronIcon}
                />
              </PerfectContainer>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>

        <Animated.View
          style={[
            styles.communityCard,
            {
              opacity: animations.statsAnimations[3],
              transform: [{ scale: animations.statsAnimations[3] }],
            },
          ]}
        >
          <PlatformTouchable onPress={onPartnersPress} activeOpacity={0.9}>
            <LinearGradient
              colors={Colors.gradients.purple}
              style={styles.communityGradientContainer}
            >
              <PerfectContainer style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="handshake"
                  size={scale(28)}
                  color={Colors.gradients.purple[0]}
                  style={styles.communityCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                  fontWeight="700"
                  immunity={true}
                  style={styles.communityStatValue}
                >
                  150+
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                  fontWeight="600"
                  immunity={true}
                  style={styles.communityStatLabel}
                >
                  Partner Attivi
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={scale(20)}
                  color={Colors.gradients.purple[0]}
                  style={styles.chevronIcon}
                />
              </PerfectContainer>
            </LinearGradient>
          </PlatformTouchable>
        </Animated.View>
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Community Section
  communitySection: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg, // AGGIUNTO: spazio generoso tra linea e titolo "La Nostra Community"
    marginBottom: PerfectSpacing.lg,
  },

  communityRow: {
    flexDirection: 'row',
    gap: PerfectSpacing.base,
  },
  communityCard: {
    flex: 1,
  },
  communityGradientContainer: {
    borderRadius: BorderRadius.xl,
    padding: scale(2),
    ...Shadows.lg,
  },
  communityCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: BorderRadius.xl - scale(2),
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  communityCardIcon: {
    marginBottom: PerfectSpacing.md,
  },
  communityStatValue: {
    color: Colors.neutral[800],
    marginBottom: PerfectSpacing.sm,
  },
  communityStatLabel: {
    color: Colors.neutral[700],
    textAlign: 'center',
  },
  chevronIcon: {
    position: 'absolute',
    top: PerfectSpacing.sm,
    right: PerfectSpacing.sm,
  },

  // Community Section - RIVOLUZIONATO
  communityHeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  communityHeaderBackground: {
    backgroundColor: Colors.neutral[50],
    borderRadius: BorderRadius.xl,
    paddingVertical: PerfectSpacing.base,
    paddingHorizontal: PerfectSpacing.lg,
    borderWidth: scale(1),
    borderColor: Colors.neutral[100],
    ...Shadows.sm,
  },
  communityTitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    letterSpacing: scale(-0.4),
    includeFontPadding: false,
    ...Shadows.sm,
  },
  communitySubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: PerfectSpacing.md,
    opacity: 0.9,
    letterSpacing: scale(0.1),
  },
});
