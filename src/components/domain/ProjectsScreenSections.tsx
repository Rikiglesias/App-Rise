import React from 'react';
import { View } from 'react-native';
import { ResponsiveText } from '../ui/ResponsiveText';
import { Surface } from 'react-native-paper';
import type {
  ProjectsEmptyStateProps,
  ProjectsHeaderProps,
  ProjectsStatsProps,
} from '../../features/projects/types/ProjectsScreenTypes';
import SectionContainer from '../layout/SectionContainer';

// Header Component
export const ProjectsHeader: React.FC<ProjectsHeaderProps> = React.memo(
  ({ styles }) => (
    <View style={styles.header}>
      <ResponsiveText style={styles.headerTitle}>
        I Nostri Progetti
      </ResponsiveText>
      <ResponsiveText style={styles.headerSubtitle}>
        Scopri dove stiamo facendo la differenza nel mondo{'\n'}
        contro la fame e la malnutrizione
      </ResponsiveText>
    </View>
  )
);

ProjectsHeader.displayName = 'ProjectsHeader';

// Stats Section Component
export const ProjectsStats: React.FC<ProjectsStatsProps> = React.memo(
  ({ stats, styles }) => (
    <SectionContainer spacing="standard">
      <Surface style={styles.statsSurface} elevation={1}>
        <ResponsiveText style={styles.statsTitle}>
          Progetti in Numeri
        </ResponsiveText>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <ResponsiveText style={styles.statNumber}>
              {stats.total}
            </ResponsiveText>
            <ResponsiveText style={styles.statLabel}>
              Progetti{'\n'}Totali
            </ResponsiveText>
          </View>
          <View style={styles.statItem}>
            <ResponsiveText style={styles.statNumber}>
              {stats.active}
            </ResponsiveText>
            <ResponsiveText style={styles.statLabel}>
              In Corso{'\n'}Attualmente
            </ResponsiveText>
          </View>
          <View style={styles.statItem}>
            <ResponsiveText style={styles.statNumber}>
              {(stats.totalBeneficiaries / 1000).toFixed(0)}K+
            </ResponsiveText>
            <ResponsiveText style={styles.statLabel}>
              Persone{'\n'}Aiutate
            </ResponsiveText>
          </View>
        </View>
      </Surface>
    </SectionContainer>
  )
);

ProjectsStats.displayName = 'ProjectsStats';

// Empty State Component
export const ProjectsEmptyState: React.FC<ProjectsEmptyStateProps> = React.memo(
  ({ styles }) => (
    <View style={styles.emptyState}>
      <ResponsiveText style={styles.emptyStateIcon}>🔍</ResponsiveText>
      <ResponsiveText style={styles.emptyStateText}>
        Nessun progetto trovato per questa categoria
      </ResponsiveText>
    </View>
  )
);

ProjectsEmptyState.displayName = 'ProjectsEmptyState';
