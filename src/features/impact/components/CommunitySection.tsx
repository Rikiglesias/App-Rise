import React from 'react';
import { StyleSheet } from 'react-native';

import { StatCard } from './StatCard';
import { PerfectText, PerfectContainer } from '@/components/ui';
import { Colors } from '@/shared/constants/designTokens';
import { PerfectSpacing } from '@/shared/constants';
import { sectionHeaderBackground } from '@/shared/styles';

interface Props {
  onVolunteersPress: () => void;
  onPartnersPress: () => void;
}

/**
 * Sezione community con volontari e partner, header decorativo e card interattive
 */
export const CommunitySection: React.FC<Props> = ({
  onVolunteersPress,
  onPartnersPress,
}) => {
  return (
    <PerfectContainer style={styles.communitySection}>
      {/* Header con elementi community */}
      <PerfectContainer style={styles.communityHeaderContainer}>
        <PerfectContainer style={styles.communityHeaderBackground}>
          <PerfectText
            size={24}
            lines={1}
            fontWeight="700"
            style={styles.communityTitle}
          >
            🤝 La Nostra Community
          </PerfectText>
          <PerfectText
            size={16}
            lines={2}
            containerWidth={0}
            style={styles.communitySubtitle}
          >
            Volontari e partner uniti nella {'\n'}missione #famezero
          </PerfectText>
        </PerfectContainer>
      </PerfectContainer>

      <PerfectContainer style={styles.communityRow}>
        <StatCard
          icon="account-group"
          iconColor={Colors.semantic.success.main}
          value="13.323"
          label="Volontari 2024"
          subtitle="Attivi quest'anno"
          gradientColors={[
            Colors.gradients.success[0],
            Colors.gradients.success[2],
          ]}
          onPress={onVolunteersPress}
        />
        <StatCard
          icon="handshake"
          iconColor={Colors.gradients.purple[0]}
          value="150+"
          label="Partner Attivi"
          subtitle="Collaborazioni attive"
          gradientColors={[
            Colors.gradients.purple[0],
            Colors.gradients.purple[2],
          ]}
          onPress={onPartnersPress}
        />
      </PerfectContainer>
    </PerfectContainer>
  );
};

const styles = StyleSheet.create({
  // Community Section
  communitySection: {
    paddingHorizontal: PerfectSpacing.base,
    marginTop: PerfectSpacing.lg,
    marginBottom: PerfectSpacing.lg,
  },

  communityRow: {
    flexDirection: 'row',
    gap: PerfectSpacing.base,
  },

  // Community Header
  communityHeaderContainer: {
    alignItems: 'center',
    marginBottom: PerfectSpacing.lg,
  },
  communityHeaderBackground: sectionHeaderBackground('white'),
  communityTitle: {
    color: Colors.neutral[900],
    textAlign: 'center',
    letterSpacing: 0,
  },
  communitySubtitle: {
    color: Colors.neutral[700],
    textAlign: 'center',
    marginTop: PerfectSpacing.sm,
    opacity: 0.8,
    letterSpacing: 0,
  },
});
