import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';

import { PerfectText, PlatformTouchable, PerfectContainer } from '../../../components/ui';
// ELIMINATO: scaleDimensionLinear from '../../../shared/constants/responsiveSystem';
import {
  Colors,
  Spacing,
  Typography,
} from '../../../shared/constants/designTokens';
import { PlatformShadows } from '../../../shared/constants/platformDesignTokens';
import type { useImpactAnimations } from '../hooks/useImpactAnimations';

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
              colors={['#10B981', '#059669', '#047857']}
              style={styles.communityGradientContainer}
            >
              <PerfectContainer style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={28}
                  color="#10B981"
                  style={styles.communityCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                        immunity={true}
                  style={styles.communityStatValue}
                >
                  13.323
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                        immunity={true}
                  style={styles.communityStatLabel}
                >
                  Volontari 2024
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#10B981"
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
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              style={styles.communityGradientContainer}
            >
              <PerfectContainer style={styles.communityCardContent}>
                <MaterialCommunityIcons
                  name="handshake"
                  size={28}
                  color="#8B5CF6"
                  style={styles.communityCardIcon}
                />
                <PerfectText
                  size={22}
                  lines={1}
                        immunity={true}
                  style={styles.communityStatValue}
                >
                  150+
                </PerfectText>
                <PerfectText
                  size={16}
                  lines={1}
                        immunity={true}
                  style={styles.communityStatLabel}
                >
                  Partner Attivi
                </PerfectText>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#8B5CF6"
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
    paddingHorizontal: Spacing[4],
    marginTop: Spacing[6], // AGGIUNTO: spazio generoso tra linea e titolo "La Nostra Community"
    marginBottom: Spacing[6],
  },

  communityRow: {
    flexDirection: 'row',
    gap: Spacing[4],
  },
  communityCard: {
    flex: 1,
  },
  communityGradientContainer: {
    borderRadius: 20,
    padding: 2,
    ...PlatformShadows.lg, // CONVERTITO: da shadow manuale a PlatformShadows per Android ottimizzato
  },
  communityCardContent: {
    backgroundColor: Colors.neutral[0],
    borderRadius: 18,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[3],
    alignItems: 'center',
    position: 'relative',
  },
  communityCardIcon: {
    marginBottom: Spacing[3],
  },
  communityStatValue: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold,
    color: Colors.neutral[800],
    marginBottom: Spacing[2], // AUMENTATO: da Spacing[1] a Spacing[2] per più spazio
    lineHeight: 28, // AGGIUNTO: lineHeight per headline-small
  },
  communityStatLabel: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.semibold,
    color: Colors.neutral[700],
    textAlign: 'center',
    lineHeight: 22, // AGGIUNTO: lineHeight per body-large
  },
  chevronIcon: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
  },

  // Community Section - RIVOLUZIONATO
  communityHeaderContainer: {
    alignItems: 'center',
    marginBottom: Spacing[6],
  },
  communityHeaderBackground: {
    backgroundColor:
      Platform.OS === 'android'
        ? Colors.neutral[100] // ANDROID: Grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.03)', // iOS: Mantiene rgba originale
    borderRadius: 20,
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[6],
    borderWidth: 1,
    borderColor:
      Platform.OS === 'android'
        ? Colors.neutral[200] // ANDROID: Bordo grigio leggermente più scuro
        : 'rgba(55, 65, 81, 0.08)', // iOS: Mantiene rgba originale
    shadowColor: Colors.neutral[700],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: Platform.OS === 'android' ? 1 : 2, // RIDOTTO su Android per stabilità
  },
  communityTitle: {
    // fontSize rimosso - ora gestito da Text
    fontWeight: Typography.weights.bold, // BOLD normale
    color: Colors.neutral[700], // GRIGIO ELEGANTE
    textAlign: 'center',
    letterSpacing: -0.4,
    includeFontPadding: false,
    textShadowColor: 'rgba(55, 65, 81, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  communitySubtitle: {
    // fontSize rimosso - ora gestito da Text
    color: Colors.neutral[600], // GRIGIO MEDIO per leggibilità
    textAlign: 'center',
    marginTop: Spacing[3],
    opacity: 0.9,
    letterSpacing: 0.1,
  },
});
