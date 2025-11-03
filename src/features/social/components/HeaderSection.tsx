import React from 'react';
import { PerfectText, PerfectContainer, PerfectIcon } from '@/components/ui';
import { Colors, PerfectSpacing } from '@/shared/constants';
import { scale } from '@/shared/constants/perfectScale';

export const HeaderSection: React.FC = React.memo(() => {
  return (
    <PerfectContainer style={styles.headerContainer}>
      <PerfectContainer style={styles.headerIconContainer}>
        <PerfectIcon
          name="account-group"
          size={32}
          color={Colors.primary[600]}
        />
      </PerfectContainer>

      <PerfectContainer
        paddingVertical={PerfectSpacing.md}
        paddingHorizontal={PerfectSpacing.lg}
        style={styles.titleContainer}
      >
        <PerfectText
          size={28}
          lines={1}
          fontWeight="700"
          style={styles.headerTitle}
        >
          Seguici sui social
        </PerfectText>

        <PerfectText
          size={16}
          lines={2}
          fontWeight="500"
          style={styles.headerSubtitle}
        >
          Resta aggiornato sulle nostre iniziative e unisciti al cambiamento
        </PerfectText>
      </PerfectContainer>
    </PerfectContainer>
  );
});

HeaderSection.displayName = 'HeaderSection';

const styles = {
  headerContainer: {
    alignItems: 'center' as const,
    marginBottom: PerfectSpacing.xl,
    paddingHorizontal: PerfectSpacing.base,
  },
  headerIconContainer: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: Colors.primary[50],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: PerfectSpacing.base,
  },
  titleContainer: {
    alignItems: 'center' as const,
    backgroundColor: Colors.neutral[100],
    borderWidth: scale(1),
    borderColor: Colors.neutral[400],
    borderRadius: scale(16),
    width: '100%' as const,
  },
  headerTitle: {
    color: Colors.neutral[900],
    textAlign: 'center' as const,
    marginBottom: PerfectSpacing.md,
    letterSpacing: scale(-0.5),
  },
  headerSubtitle: {
    color: Colors.neutral[600],
    textAlign: 'center' as const,
    paddingHorizontal: PerfectSpacing.sm,
  },
};

